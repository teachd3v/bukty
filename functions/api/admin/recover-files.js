// Cloudflare Pages Function: GET / POST /api/admin/recover-files
// Scans R2 bucket (env.FILES) for orphaned uploaded files and relinks missing fileUrl entries in D1 (registrations.uploaded_files_json)

const ID_MONTHS = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

function parseIndonesianSubmittedAt(str) {
  if (!str || typeof str !== 'string') return null;
  // Format: "Minggu, 22 November 2026 pukul 00.45" or "22/11/2026, 00.45"
  const m = str.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:.*?(\d{1,2})[.:](\d{2}))?/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthName = m[2].toLowerCase();
    const year = parseInt(m[3], 10);
    const hour = m[4] ? parseInt(m[4], 10) : 12;
    const minute = m[5] ? parseInt(m[5], 10) : 0;
    const month = ID_MONTHS[monthName];
    if (month !== undefined) {
      // WIB is UTC+7
      return Date.UTC(year, month, day, hour - 7, minute, 0);
    }
  }
  return null;
}

function sanitizeFileName(name) {
  return (name || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function extractTimestampPrefix(key) {
  const m = /^(\d{12,14})_(.+)$/.exec(key || '');
  if (!m) return null;
  return {
    ts: parseInt(m[1], 10),
    suffix: m[2],
  };
}

function parseMbString(sizeStr) {
  if (!sizeStr || typeof sizeStr !== 'string') return null;
  const num = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : null;
}

async function runRecovery(env, applyChanges = false) {
  if (!env || !env.DB || !env.FILES) {
    throw new Error('Binding D1 (DB) atau R2 (FILES) belum terhubung');
  }

  // 1. List all objects in R2 bucket
  const allObjects = [];
  let cursor = undefined;
  do {
    const listed = await env.FILES.list({ limit: 1000, cursor });
    if (listed && Array.isArray(listed.objects)) {
      for (const obj of listed.objects) {
        const parsedKey = extractTimestampPrefix(obj.key);
        allObjects.push({
          key: obj.key,
          size: obj.size,
          sizeMbStr: (obj.size / 1024 / 1024).toFixed(2) + ' MB',
          sizeMb: obj.size / 1024 / 1024,
          uploaded: obj.uploaded,
          ts: parsedKey ? parsedKey.ts : (obj.uploaded ? new Date(obj.uploaded).getTime() : null),
          suffix: parsedKey ? parsedKey.suffix : obj.key,
        });
      }
    }
    cursor = listed && listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  // 2. Fetch all registrations and announcements from D1
  const regRes = await env.DB.prepare(
    `SELECT id, reg_id, nama, submitted_at, uploaded_files_json FROM registrations ORDER BY id ASC`
  ).all();
  const registrations = regRes.results || [];

  const usedKeys = new Set();

  // Check announcements table for used R2 keys
  try {
    const ann = await env.DB.prepare(`SELECT * FROM announcements WHERE id = 1`).first();
    if (ann) {
      ['file1_url', 'file2_url', 'file3_url', 'pantukhir_file_url'].forEach((col) => {
        const val = ann[col];
        if (typeof val === 'string' && val.startsWith('/api/files/')) {
          usedKeys.add(decodeURIComponent(val.replace('/api/files/', '')));
        }
      });
    }
  } catch (e) {}

  // Collect all already-linked R2 keys across all registrations
  const parsedRegs = registrations.map((r) => {
    let files = {};
    try {
      if (r.uploaded_files_json) {
        files = JSON.parse(r.uploaded_files_json);
      }
    } catch (e) {}

    const knownTimestamps = [];
    Object.keys(files).forEach((k) => {
      const f = files[k];
      if (!f) return;
      const key =
        f.fileName ||
        (typeof f.fileUrl === 'string' && f.fileUrl.startsWith('/api/files/')
          ? decodeURIComponent(f.fileUrl.replace('/api/files/', ''))
          : null);
      if (key && f.fileUrl && f.fileUrl !== '#') {
        usedKeys.add(key);
        const extracted = extractTimestampPrefix(key);
        if (extracted) knownTimestamps.push(extracted.ts);
      }
    });

    const parsedSubmitTs = parseIndonesianSubmittedAt(r.submitted_at);
    return {
      ...r,
      files,
      knownTimestamps,
      parsedSubmitTs,
    };
  });

  // Index orphan R2 objects by lowercase sanitized suffix
  const orphanObjects = allObjects.filter((obj) => !usedKeys.has(obj.key));
  const orphansBySuffix = new Map();
  for (const obj of orphanObjects) {
    const lowerSuffix = (obj.suffix || '').toLowerCase();
    if (!orphansBySuffix.has(lowerSuffix)) {
      orphansBySuffix.set(lowerSuffix, []);
    }
    orphansBySuffix.get(lowerSuffix).push(obj);
  }

  const recoveredDetails = [];
  const stillMissingDetails = [];
  const updatedRegs = [];

  // 3. Try to match missing document slots against orphan R2 objects
  for (const reg of parsedRegs) {
    const docKeys = Object.keys(reg.files);
    let regModified = false;

    // Reference timestamp for this registration
    const refTimestamps = [...reg.knownTimestamps];
    if (reg.parsedSubmitTs) refTimestamps.push(reg.parsedSubmitTs);
    const minRefTs = refTimestamps.length > 0 ? Math.min(...refTimestamps) : null;
    const maxRefTs = refTimestamps.length > 0 ? Math.max(...refTimestamps) : null;

    for (const docKey of docKeys) {
      const f = reg.files[docKey];
      if (!f) continue;
      const existingUrl = f.fileUrl || (f.fileName ? `/api/files/${f.fileName}` : null);
      if (existingUrl && existingUrl !== '#') continue;

      const expectedSuffix = sanitizeFileName(f.name || '').toLowerCase();
      const candidates = (orphansBySuffix.get(expectedSuffix) || []).filter((obj) => !usedKeys.has(obj.key));

      const targetMb = parseMbString(f.size);

      // Filter candidates by size (exact formatted MB string or within 0.02 MB) and reasonable time window
      const viable = candidates.filter((obj) => {
        if (targetMb !== null) {
          const diffMb = Math.abs(obj.sizeMb - targetMb);
          if (obj.sizeMbStr !== f.size && diffMb > 0.02) {
            return false;
          }
        }
        if (obj.ts && maxRefTs) {
          // Allow up to 48 hours before minRefTs and at most 15 minutes after maxRefTs
          const fortyEightHours = 48 * 60 * 60 * 1000;
          const fifteenMinutes = 15 * 60 * 1000;
          if (obj.ts < minRefTs - fortyEightHours || obj.ts > maxRefTs + fifteenMinutes) {
            return false;
          }
        }
        return true;
      });

      if (viable.length > 0) {
        // Pick candidate closest to known timestamps of this registration
        viable.sort((a, b) => {
          if (!a.ts || !b.ts || refTimestamps.length === 0) return 0;
          const distA = Math.min(...refTimestamps.map((t) => Math.abs(a.ts - t)));
          const distB = Math.min(...refTimestamps.map((t) => Math.abs(b.ts - t)));
          return distA - distB;
        });

        const matched = viable[0];
        usedKeys.add(matched.key);
        reg.files[docKey] = {
          ...f,
          fileName: matched.key,
          fileUrl: `/api/files/${matched.key}`,
        };
        regModified = true;
        if (matched.ts) refTimestamps.push(matched.ts);

        recoveredDetails.push({
          id: reg.id,
          reg_id: reg.reg_id,
          nama: reg.nama,
          docKey,
          originalName: f.name,
          size: f.size,
          matchedKey: matched.key,
          fileUrl: `/api/files/${matched.key}`,
        });
      } else {
        stillMissingDetails.push({
          id: reg.id,
          reg_id: reg.reg_id,
          nama: reg.nama,
          submitted_at: reg.submitted_at,
          docKey,
          originalName: f.name,
          size: f.size,
        });
      }
    }

    if (regModified) {
      updatedRegs.push({
        id: reg.id,
        reg_id: reg.reg_id,
        nama: reg.nama,
        uploaded_files_json: JSON.stringify(reg.files),
      });
    }
  }

  // 4. Persist recovered links to D1 if applyChanges = true
  if (applyChanges && updatedRegs.length > 0) {
    for (const u of updatedRegs) {
      await env.DB.prepare(`UPDATE registrations SET uploaded_files_json = ? WHERE id = ?`)
        .bind(u.uploaded_files_json, u.id)
        .run();
    }
  }

  const remainingOrphans = allObjects
    .filter((obj) => !usedKeys.has(obj.key))
    .map((o) => ({ key: o.key, sizeMb: o.sizeMbStr, uploaded: o.uploaded }));

  return {
    success: true,
    applied: applyChanges,
    totalR2Objects: allObjects.length,
    initialOrphanR2Objects: orphanObjects.length,
    remainingOrphanR2Objects: remainingOrphans.length,
    recoveredRegistrationsCount: updatedRegs.length,
    recoveredFilesCount: recoveredDetails.length,
    stillMissingFilesCount: stillMissingDetails.length,
    recoveredDetails,
    stillMissingDetails,
    remainingOrphans,
  };
}

export async function onRequestGet({ env }) {
  try {
    const result = await runRecovery(env, false);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost({ env }) {
  try {
    const result = await runRecovery(env, true);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
