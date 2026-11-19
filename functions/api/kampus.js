// GET /api/kampus?q=...&province=...
// Server-side proxy for API Indonesia Kampus (https://apiindonesia.id/produk/kampus)
// Uses env.API_INDONESIA_KEY securely when configured, with curated official PTN fallback dataset.

const PROVINCE_CODE_MAP = {
  'dki jakarta': '31',
  'jawa barat': '32',
  'jawa tengah': '33',
  'di yogyakarta': '34',
  'yogyakarta': '34',
  'jawa timur': '35',
  'banten': '36',
  'sumatera utara': '12',
  'sumatera barat': '13',
  'riau': '14',
  'sumatera selatan': '16',
  'lampung': '18',
  'sulawesi selatan': '73',
  'aceh': '11',
  'jambi': '15',
  'bengkulu': '17',
  'kepulauan bangka belitung': '19',
  'kepulauan riau': '21',
  'bali': '51',
  'nusa tenggara barat': '52',
  'nusa tenggara timur': '53',
  'kalimantan barat': '61',
  'kalimantan tengah': '62',
  'kalimantan selatan': '63',
  'kalimantan timur': '64',
  'kalimantan utara': '65',
  'sulawesi utara': '71',
  'sulawesi tengah': '72',
  'sulawesi tenggara': '74',
  'gorontalo': '75',
  'sulawesi barat': '76',
  'maluku': '81',
  'maluku utara': '82',
  'papua': '91',
  'papua barat': '92',
};

// Curated official PTN / UIN / Politeknik Negeri across all 12 BUKTY provinces (instant fallback)
const FALLBACK_PTN_LIST = [
  // DKI Jakarta
  { name: 'Universitas Indonesia', short_name: 'UI', province_name: 'DKI Jakarta', regency_name: 'Kota Depok / DKI Jakarta' },
  { name: 'Universitas Negeri Jakarta', short_name: 'UNJ', province_name: 'DKI Jakarta', regency_name: 'Kota Jakarta Timur' },
  { name: 'Universitas Pembangunan Nasional Veteran Jakarta', short_name: 'UPNVJ', province_name: 'DKI Jakarta', regency_name: 'Kota Jakarta Selatan' },
  { name: 'Politeknik Negeri Jakarta', short_name: 'PNJ', province_name: 'DKI Jakarta', regency_name: 'Kota Depok / DKI Jakarta' },
  { name: 'Politeknik Negeri Media Kreatif', short_name: 'Polimedia', province_name: 'DKI Jakarta', regency_name: 'Kota Jakarta Selatan' },
  { name: 'Universitas Terbuka', short_name: 'UT', province_name: 'Banten', regency_name: 'Kota Tangerang Selatan' },

  // Banten
  { name: 'Universitas Sultan Ageng Tirtayasa', short_name: 'UNTIRTA', province_name: 'Banten', regency_name: 'Kota Serang' },
  { name: 'UIN Syarif Hidayatullah Jakarta', short_name: 'UIN Jakarta', province_name: 'Banten', regency_name: 'Kota Tangerang Selatan' },
  { name: 'UIN Sultan Maulana Hasanuddin Banten', short_name: 'UIN SMH Banten', province_name: 'Banten', regency_name: 'Kota Serang' },

  // Jawa Barat
  { name: 'Institut Teknologi Bandung', short_name: 'ITB', province_name: 'Jawa Barat', regency_name: 'Kota Bandung' },
  { name: 'IPB University (Institut Pertanian Bogor)', short_name: 'IPB', province_name: 'Jawa Barat', regency_name: 'Kab. Bogor' },
  { name: 'Universitas Padjadjaran', short_name: 'UNPAD', province_name: 'Jawa Barat', regency_name: 'Kab. Sumedang' },
  { name: 'Universitas Pendidikan Indonesia', short_name: 'UPI', province_name: 'Jawa Barat', regency_name: 'Kota Bandung' },
  { name: 'UIN Sunan Gunung Djati Bandung', short_name: 'UIN SGD Bandung', province_name: 'Jawa Barat', regency_name: 'Kota Bandung' },
  { name: 'Universitas Siliwangi', short_name: 'UNSIL', province_name: 'Jawa Barat', regency_name: 'Kota Tasikmalaya' },
  { name: 'Universitas Singaperbangsa Karawang', short_name: 'UNSIKA', province_name: 'Jawa Barat', regency_name: 'Kab. Karawang' },
  { name: 'Institut Seni Budaya Indonesia Bandung', short_name: 'ISBI Bandung', province_name: 'Jawa Barat', regency_name: 'Kota Bandung' },
  { name: 'Politeknik Negeri Bandung', short_name: 'POLBAN', province_name: 'Jawa Barat', regency_name: 'Kab. Bandung Barat' },
  { name: 'Politeknik Manufaktur Bandung', short_name: 'POLMAN Bandung', province_name: 'Jawa Barat', regency_name: 'Kota Bandung' },
  { name: 'Politeknik Negeri Indramayu', short_name: 'POLINDRA', province_name: 'Jawa Barat', regency_name: 'Kab. Indramayu' },
  { name: 'Politeknik Negeri Subang', short_name: 'POLSUB', province_name: 'Jawa Barat', regency_name: 'Kab. Subang' },
  { name: 'UIN Siber Syekh Nurjati Cirebon', short_name: 'UIN SSC Cirebon', province_name: 'Jawa Barat', regency_name: 'Kota Cirebon' },

  // Jawa Tengah
  { name: 'Universitas Diponegoro', short_name: 'UNDIP', province_name: 'Jawa Tengah', regency_name: 'Kota Semarang' },
  { name: 'Universitas Sebelas Maret', short_name: 'UNS', province_name: 'Jawa Tengah', regency_name: 'Kota Surakarta' },
  { name: 'Universitas Jenderal Soedirman', short_name: 'UNSOED', province_name: 'Jawa Tengah', regency_name: 'Kab. Banyumas' },
  { name: 'Universitas Negeri Semarang', short_name: 'UNNES', province_name: 'Jawa Tengah', regency_name: 'Kota Semarang' },
  { name: 'Universitas Tidar', short_name: 'UNTIDAR', province_name: 'Jawa Tengah', regency_name: 'Kota Magelang' },
  { name: 'Institut Seni Indonesia Surakarta', short_name: 'ISI Surakarta', province_name: 'Jawa Tengah', regency_name: 'Kota Surakarta' },
  { name: 'UIN Walisongo Semarang', short_name: 'UIN Walisongo', province_name: 'Jawa Tengah', regency_name: 'Kota Semarang' },
  { name: 'UIN Raden Mas Said Surakarta', short_name: 'UIN Surakarta', province_name: 'Jawa Tengah', regency_name: 'Kab. Sukoharjo' },
  { name: 'UIN Prof. K.H. Saifuddin Zuhri Purwokerto', short_name: 'UIN SAIZU', province_name: 'Jawa Tengah', regency_name: 'Kab. Banyumas' },
  { name: 'UIN Salatiga', short_name: 'UIN Salatiga', province_name: 'Jawa Tengah', regency_name: 'Kota Salatiga' },
  { name: 'UIN K.H. Abdurrahman Wahid Pekalongan', short_name: 'UIN Gus Dur', province_name: 'Jawa Tengah', regency_name: 'Kab. Pekalongan' },
  { name: 'Politeknik Negeri Semarang', short_name: 'POLINES', province_name: 'Jawa Tengah', regency_name: 'Kota Semarang' },
  { name: 'Politeknik Negeri Cilacap', short_name: 'PNC', province_name: 'Jawa Tengah', regency_name: 'Kab. Cilacap' },
  { name: 'Politeknik Maritim Negeri Indonesia', short_name: 'POLIMARIN', province_name: 'Jawa Tengah', regency_name: 'Kota Semarang' },

  // DI Yogyakarta
  { name: 'Universitas Gadjah Mada', short_name: 'UGM', province_name: 'DI Yogyakarta', regency_name: 'Kab. Sleman' },
  { name: 'Universitas Negeri Yogyakarta', short_name: 'UNY', province_name: 'DI Yogyakarta', regency_name: 'Kab. Sleman' },
  { name: 'UIN Sunan Kalijaga Yogyakarta', short_name: 'UIN SUKA', province_name: 'DI Yogyakarta', regency_name: 'Kab. Sleman' },
  { name: 'Universitas Pembangunan Nasional Veteran Yogyakarta', short_name: 'UPNVY', province_name: 'DI Yogyakarta', regency_name: 'Kab. Sleman' },
  { name: 'Institut Seni Indonesia Yogyakarta', short_name: 'ISI Yogyakarta', province_name: 'DI Yogyakarta', regency_name: 'Kab. Bantul' },

  // Jawa Timur
  { name: 'Universitas Airlangga', short_name: 'UNAIR', province_name: 'Jawa Timur', regency_name: 'Kota Surabaya' },
  { name: 'Institut Teknologi Sepuluh Nopember', short_name: 'ITS', province_name: 'Jawa Timur', regency_name: 'Kota Surabaya' },
  { name: 'Universitas Brawijaya', short_name: 'UB', province_name: 'Jawa Timur', regency_name: 'Kota Malang' },
  { name: 'Universitas Negeri Malang', short_name: 'UM', province_name: 'Jawa Timur', regency_name: 'Kota Malang' },
  { name: 'Universitas Negeri Surabaya', short_name: 'UNESA', province_name: 'Jawa Timur', regency_name: 'Kota Surabaya' },
  { name: 'Universitas Jember', short_name: 'UNEJ', province_name: 'Jawa Timur', regency_name: 'Kab. Jember' },
  { name: 'Universitas Trunojoyo Madura', short_name: 'UTM', province_name: 'Jawa Timur', regency_name: 'Kab. Bangkalan' },
  { name: 'Universitas Pembangunan Nasional Veteran Jawa Timur', short_name: 'UPNVJT', province_name: 'Jawa Timur', regency_name: 'Kota Surabaya' },
  { name: 'UIN Maulana Malik Ibrahim Malang', short_name: 'UIN Malang', province_name: 'Jawa Timur', regency_name: 'Kota Malang' },
  { name: 'UIN Sunan Ampel Surabaya', short_name: 'UINSA', province_name: 'Jawa Timur', regency_name: 'Kota Surabaya' },
  { name: 'UIN Sayyid Ali Rahmatullah Tulungagung', short_name: 'UIN SATU', province_name: 'Jawa Timur', regency_name: 'Kab. Tulungagung' },
  { name: 'UIN Kiai Haji Achmad Siddiq Jember', short_name: 'UIN KHAS Jember', province_name: 'Jawa Timur', regency_name: 'Kab. Jember' },
  { name: 'Politeknik Elektronika Negeri Surabaya', short_name: 'PENS', province_name: 'Jawa Timur', regency_name: 'Kota Surabaya' },
  { name: 'Politeknik Perkapalan Negeri Surabaya', short_name: 'PPNS', province_name: 'Jawa Timur', regency_name: 'Kota Surabaya' },
  { name: 'Politeknik Negeri Malang', short_name: 'POLINEMA', province_name: 'Jawa Timur', regency_name: 'Kota Malang' },
  { name: 'Politeknik Negeri Jember', short_name: 'POLIJE', province_name: 'Jawa Timur', regency_name: 'Kab. Jember' },
  { name: 'Politeknik Negeri Madiun', short_name: 'PNM', province_name: 'Jawa Timur', regency_name: 'Kota Madiun' },
  { name: 'Politeknik Negeri Banyuwangi', short_name: 'POLIWANGI', province_name: 'Jawa Timur', regency_name: 'Kab. Banyuwangi' },
  { name: 'Politeknik Negeri Madura', short_name: 'POLTERA', province_name: 'Jawa Timur', regency_name: 'Kab. Sampang' },

  // Sumatera Utara
  { name: 'Universitas Sumatera Utara', short_name: 'USU', province_name: 'Sumatera Utara', regency_name: 'Kota Medan' },
  { name: 'Universitas Negeri Medan', short_name: 'UNIMED', province_name: 'Sumatera Utara', regency_name: 'Kab. Deli Serdang' },
  { name: 'UIN Sumatera Utara Medan', short_name: 'UINSU', province_name: 'Sumatera Utara', regency_name: 'Kota Medan' },
  { name: 'UIN Syekh Ali Hasan Ahmad Addary Padangsidimpuan', short_name: 'UIN SYAHADA', province_name: 'Sumatera Utara', regency_name: 'Kota Padangsidimpuan' },
  { name: 'Politeknik Negeri Medan', short_name: 'POLMED', province_name: 'Sumatera Utara', regency_name: 'Kota Medan' },

  // Sumatera Barat
  { name: 'Universitas Andalas', short_name: 'UNAND', province_name: 'Sumatera Barat', regency_name: 'Kota Padang' },
  { name: 'Universitas Negeri Padang', short_name: 'UNP', province_name: 'Sumatera Barat', regency_name: 'Kota Padang' },
  { name: 'Institut Seni Indonesia Padangpanjang', short_name: 'ISI Padangpanjang', province_name: 'Sumatera Barat', regency_name: 'Kota Padang Panjang' },
  { name: 'UIN Imam Bonjol Padang', short_name: 'UIN IB Padang', province_name: 'Sumatera Barat', regency_name: 'Kota Padang' },
  { name: 'UIN Sjech M. Djamil Djambek Bukittinggi', short_name: 'UIN Bukittinggi', province_name: 'Sumatera Barat', regency_name: 'Kota Bukittinggi' },
  { name: 'UIN Mahmud Yunus Batusangkar', short_name: 'UIN Batusangkar', province_name: 'Sumatera Barat', regency_name: 'Kab. Tanah Datar' },
  { name: 'Politeknik Negeri Padang', short_name: 'PNP', province_name: 'Sumatera Barat', regency_name: 'Kota Padang' },
  { name: 'Politeknik Pertanian Negeri Payakumbuh', short_name: 'PPNP', province_name: 'Sumatera Barat', regency_name: 'Kab. Lima Puluh Kota' },

  // Riau
  { name: 'Universitas Riau', short_name: 'UNRI', province_name: 'Riau', regency_name: 'Kota Pekanbaru' },
  { name: 'UIN Sultan Syarif Kasim Riau', short_name: 'UIN SUSKA Riau', province_name: 'Riau', regency_name: 'Kota Pekanbaru' },
  { name: 'Politeknik Negeri Bengkalis', short_name: 'POLBENG', province_name: 'Riau', regency_name: 'Kab. Bengkalis' },

  // Sumatera Selatan
  { name: 'Universitas Sriwijaya', short_name: 'UNSRI', province_name: 'Sumatera Selatan', regency_name: 'Kab. Ogan Ilir' },
  { name: 'UIN Raden Fatah Palembang', short_name: 'UIN RF Palembang', province_name: 'Sumatera Selatan', regency_name: 'Kota Palembang' },
  { name: 'Politeknik Negeri Sriwijaya', short_name: 'POLSRI', province_name: 'Sumatera Selatan', regency_name: 'Kota Palembang' },

  // Lampung
  { name: 'Universitas Lampung', short_name: 'UNILA', province_name: 'Lampung', regency_name: 'Kota Bandar Lampung' },
  { name: 'Institut Teknologi Sumatera', short_name: 'ITERA', province_name: 'Lampung', regency_name: 'Kab. Lampung Selatan' },
  { name: 'UIN Raden Intan Lampung', short_name: 'UIN RIL', province_name: 'Lampung', regency_name: 'Kota Bandar Lampung' },
  { name: 'Politeknik Negeri Lampung', short_name: 'POLINELA', province_name: 'Lampung', regency_name: 'Kota Bandar Lampung' },

  // Sulawesi Selatan
  { name: 'Universitas Hasanuddin', short_name: 'UNHAS', province_name: 'Sulawesi Selatan', regency_name: 'Kota Makassar' },
  { name: 'Universitas Negeri Makassar', short_name: 'UNM', province_name: 'Sulawesi Selatan', regency_name: 'Kota Makassar' },
  { name: 'UIN Alauddin Makassar', short_name: 'UINAM', province_name: 'Sulawesi Selatan', regency_name: 'Kab. Gowa' },
  { name: 'Institut Teknologi Bacharuddin Jusuf Habibie', short_name: 'ITH', province_name: 'Sulawesi Selatan', regency_name: 'Kota Parepare' },
  { name: 'Politeknik Negeri Ujung Pandang', short_name: 'PNUP', province_name: 'Sulawesi Selatan', regency_name: 'Kota Makassar' },
  { name: 'Politeknik Pertanian Negeri Pangkajene Kepulauan', short_name: 'POLIPANGKEP', province_name: 'Sulawesi Selatan', regency_name: 'Kab. Pangkajene dan Kepulauan' },
];

function toReadableTitleCase(str) {
  if (!str) return '';
  if (str !== str.toUpperCase()) return str;
  const keepUpper = new Set(['UIN', 'IAIN', 'STAIN', 'ITB', 'IPB', 'ITS', 'UI', 'UGM', 'UNY', 'UNJ', 'UPI', 'UNP', 'UNM', 'USU', 'UNRI', 'UNAIR', 'UNDIP', 'UNPAD', 'UNAND', 'UNSRI', 'UNHAS', 'UNILA', 'ITERA', 'UNTIRTA', 'UPN', 'UPNVJ', 'UPNVY', 'UPNVJT', 'ISI', 'ISBI', 'PENS', 'PPNS', 'PNJ', 'PNP', 'PNUP', 'POLBAN', 'POLINES', 'POLINEMA', 'POLSRI', 'POLMED', 'POLINELA', 'DKI', 'DI', 'K.H.', 'KH', 'M.', 'H.']);
  const keepLower = new Set(['dan', 'di', 'ke', 'dari', 'untuk', 'yang']);
  return str
    .split(/\s+/)
    .map((word, idx) => {
      const upper = word.toUpperCase();
      if (keepUpper.has(upper)) return upper;
      const lower = word.toLowerCase();
      if (idx > 0 && keepLower.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function searchFallback(query, province) {
  const q = (query || '').trim().toLowerCase();
  const provNorm = (province || '').trim().toLowerCase();

  let pool = FALLBACK_PTN_LIST;
  if (q) {
    pool = FALLBACK_PTN_LIST.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.short_name || '').toLowerCase().includes(q) ||
        item.province_name.toLowerCase().includes(q)
    );
  } else if (provNorm) {
    const provMatches = FALLBACK_PTN_LIST.filter((item) => item.province_name.toLowerCase() === provNorm);
    if (provMatches.length > 0) pool = provMatches;
  }

  // Prioritize campuses in the applicant's selected province
  if (provNorm) {
    pool = [...pool].sort((a, b) => {
      const aMatch = a.province_name.toLowerCase() === provNorm ? 0 : 1;
      const bMatch = b.province_name.toLowerCase() === provNorm ? 0 : 1;
      return aMatch - bMatch;
    });
  }

  return pool.slice(0, 20).map((item, idx) => ({
    id: `ptn_fallback_${idx}`,
    name: item.name,
    short_name: item.short_name,
    kelompok: 'PTN',
    province_name: item.province_name,
    regency_name: item.regency_name,
  }));
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const province = (url.searchParams.get('province') || '').trim();

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=86400',
  };

  const apiKey = env.API_INDONESIA_KEY;

  // If API_INDONESIA_KEY is configured, query live API Indonesia Kampus (filtered to PTN)
  if (apiKey && q.length >= 2) {
    try {
      const params = new URLSearchParams({
        group: 'PTN',
        q,
        per_page: '20',
      });

      const provCode = PROVINCE_CODE_MAP[province.toLowerCase()];
      if (provCode) {
        params.set('province', provCode);
      }

      const fetchUpstream = async (searchParams) => {
        const res = await fetch(`https://use.apiindonesia.id/api/v1/kampus?${searchParams.toString()}`, {
          headers: {
            'x-api-key': apiKey,
            Accept: 'application/json',
          },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : null;
      };

      let items = await fetchUpstream(params);

      // If province-scoped search returned empty (e.g., applicant lives in Prov A but studies in Prov B), retry across all PTN
      if (items && items.length === 0 && provCode) {
        params.delete('province');
        items = await fetchUpstream(params);
      }

      if (items) {
        const normalized = items.map((c) => ({
          id: c.id,
          name: toReadableTitleCase(c.name || ''),
          short_name: c.short_name || '',
          kelompok: c.kelompok || 'PTN',
          province_name: toReadableTitleCase(c.province_name || ''),
          regency_name: toReadableTitleCase(c.regency_name || ''),
        }));

        return new Response(
          JSON.stringify({
            success: true,
            source: 'apiindonesia',
            data: normalized,
          }),
          { status: 200, headers }
        );
      }
    } catch (err) {
      // Fall through cleanly to local official PTN fallback dataset
    }
  }

  const fallbackResults = searchFallback(q, province);
  return new Response(
    JSON.stringify({
      success: true,
      source: 'fallback_ptn',
      data: fallbackResults,
    }),
    { status: 200, headers }
  );
}
