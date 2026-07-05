export function normalizeExerciseName(name) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function isLikelyYoutubeVideoId(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return false;
  if (/^[A-Z0-9-]+$/.test(trimmed) && trimmed.includes('-')) return false;
  return true;
}

export function extractYoutubeVideoId(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && isLikelyYoutubeVideoId(match[1])) return match[1];
  }

  if (isLikelyYoutubeVideoId(trimmed)) return trimmed;

  return null;
}

const VIDEO_FIELD_NAMES = new Set([
  'videoId',
  'videoid',
  'youtubeVideoId',
  'youtubeId',
  'urlVideo',
  'videoUrl',
  'youtube',
]);

function upsertEntry(map, entry) {
  const key = entry.ejerId ?? entry.nameKey;
  if (key == null || !entry.youtubeVideoId) return;
  map.set(String(key), entry);
}

function entryFromExerciseNode(node) {
  const ejerId = node.ejerId ?? node.ejerid ?? node.idEjercicio ?? null;
  const name = node.ejerName ?? node.nombre ?? node.name ?? null;
  if (ejerId == null && !name) return null;

  let youtubeVideoId = null;
  for (const [key, value] of Object.entries(node)) {
    if (!VIDEO_FIELD_NAMES.has(key)) continue;
    if (value == null || value === '') continue;
    youtubeVideoId = extractYoutubeVideoId(String(value));
    if (youtubeVideoId) break;
  }

  if (!youtubeVideoId) return null;

  return {
    ejerId: ejerId != null ? Number(ejerId) : null,
    name: name ?? `Ejercicio ${ejerId}`,
    nameKey: name ? normalizeExerciseName(name) : null,
    youtubeVideoId,
  };
}

export function collectExerciseCatalog(calendar) {
  const catalog = new Map();

  for (const day of Object.values(calendar.workouts ?? {})) {
    for (const rateExercises of Object.values(day.rates ?? {})) {
      if (!Array.isArray(rateExercises)) continue;
      for (const exercise of rateExercises) {
        if (!exercise?.ejerId || !exercise?.ejerName) continue;
        catalog.set(Number(exercise.ejerId), {
          ejerId: Number(exercise.ejerId),
          name: exercise.ejerName,
          nameKey: normalizeExerciseName(exercise.ejerName),
        });
      }
    }
  }

  return catalog;
}

export function extractVideosFromAimHarderData(root) {
  const entries = new Map();

  function visit(node) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    const fromExercise = entryFromExerciseNode(node);
    if (fromExercise) upsertEntry(entries, fromExercise);

    for (const [key, value] of Object.entries(node)) {
      if (typeof value !== 'string') continue;
      if (!VIDEO_FIELD_NAMES.has(key)) continue;
      const youtubeVideoId = extractYoutubeVideoId(value);
      if (!youtubeVideoId) continue;

      const ejerId = node.ejerId ?? node.ejerid ?? node.idEjercicio ?? null;
      const name = node.ejerName ?? node.nombre ?? node.name ?? null;
      upsertEntry(entries, {
        ejerId: ejerId != null ? Number(ejerId) : null,
        name: name ?? `Ejercicio ${ejerId ?? key}`,
        nameKey: name ? normalizeExerciseName(name) : null,
        youtubeVideoId,
      });
    }

    Object.values(node).forEach(visit);
  }

  visit(root);

  return [...entries.values()].filter((entry) => entry.nameKey || entry.ejerId != null);
}

function buildRequestHeaders(cookie) {
  return {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Cookie: cookie,
    'X-Requested-With': 'XMLHttpRequest',
    Referer: `https://${process.env.AIMHARDER_BOX || 'opentowork'}.aimharder.com/app`,
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };
}

async function postControl({ box, cookie, endpoint, body }) {
  const response = await fetch(`https://${box}.aimharder.com/control/${endpoint}`, {
    method: 'POST',
    headers: buildRequestHeaders(cookie),
    body,
  });

  if (!response.ok) return null;

  const text = await response.text();
  if (!text || text.includes('reload?url')) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const CATALOG_ENDPOINTS = [
  ['getAllEjercicios', ''],
  ['getEjercicios', ''],
  ['getEjerciciosBox', ''],
  ['getListEjercicios', ''],
  ['getListaEjercicios', ''],
  ['loadEjercicios', ''],
  ['getCatalogoEjercicios', ''],
  ['getEjerciciosList', ''],
];

export async function fetchExerciseCatalogFromApi({ box, cookie }) {
  for (const [endpoint, body] of CATALOG_ENDPOINTS) {
    const data = await postControl({ box, cookie, endpoint, body });
    if (!data) continue;

    const entries = extractVideosFromAimHarderData(data);
    if (entries.length > 0) {
      return { endpoint, entries };
    }
  }

  return null;
}

const DETAIL_ENDPOINTS = [
  (id) => ['getEjercicio', `ejerId=${id}`],
  (id) => ['getEjercicioData', `ejerId=${id}`],
  (id) => ['getEjercicioInfo', `ejerId=${id}`],
  (id) => ['getExerciseInfo', `ejerId=${id}`],
  (id) => ['loadEjercicio', `ejerId=${id}`],
  (id) => ['getVideoEjercicio', `ejerId=${id}`],
  (id) => ['getEjercicioVideo', `ejerId=${id}`],
  (id) => ['getFullExercise', `ejerId=${id}`],
];

const LOAD_ACTIVITY_TIPOS = [
  'EJER',
  'EJERCICIO',
  'Ejercicio',
  'ejercicio',
  'EXERCISE',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
];

let cachedLoadActivityTipo = null;

async function fetchExerciseVideoViaLoadActivity({ box, cookie, ejerId }) {
  const tipos = cachedLoadActivityTipo ? [cachedLoadActivityTipo] : LOAD_ACTIVITY_TIPOS;

  for (const tipo of tipos) {
    const body = new URLSearchParams({
      ID: String(ejerId),
      TIPO: tipo,
      modalPref: '0',
    });

    const response = await fetch(`https://${box}.aimharder.com/Util/loadActivity.php`, {
      method: 'POST',
      headers: buildRequestHeaders(cookie),
      body,
    });

    if (!response.ok || response.status === 403) continue;

    const text = await response.text();
    if (!text || text.includes('reload?url')) continue;

    const youtubeVideoId = extractYoutubeVideoId(text);
    if (youtubeVideoId) {
      cachedLoadActivityTipo = tipo;
      return youtubeVideoId;
    }
  }

  return null;
}

export async function fetchExerciseVideoFromApi({ box, cookie, ejerId }) {
  for (const build of DETAIL_ENDPOINTS) {
    const [endpoint, body] = build(ejerId);
    const data = await postControl({ box, cookie, endpoint, body });
    if (!data) continue;

    if (typeof data === 'string') {
      const id = extractYoutubeVideoId(data);
      if (id) return id;
      continue;
    }

    const found = extractVideosFromAimHarderData(data);
    if (found[0]?.youtubeVideoId) {
      return found[0].youtubeVideoId;
    }
  }

  return fetchExerciseVideoViaLoadActivity({ box, cookie, ejerId });
}

export async function fetchExerciseVideosForCatalog({
  box,
  cookie,
  catalog,
  limit = null,
  onProgress = null,
}) {
  const entries = new Map();
  const catalogResult = await fetchExerciseCatalogFromApi({ box, cookie });

  if (catalogResult) {
    for (const entry of catalogResult.entries) {
      entries.set(String(entry.ejerId ?? entry.nameKey), entry);
    }
    if (onProgress) {
      onProgress({ phase: 'catalog', endpoint: catalogResult.endpoint, count: entries.size });
    }
  }

  const targets = [...catalog.entries()];
  const slice = limit ? targets.slice(0, limit) : targets;

  for (const [ejerId, meta] of slice) {
    if (entries.has(String(ejerId))) continue;

    const youtubeVideoId = await fetchExerciseVideoFromApi({ box, cookie, ejerId });
    if (!youtubeVideoId) continue;

    entries.set(String(ejerId), {
      ejerId,
      name: meta.name,
      nameKey: meta.nameKey ?? normalizeExerciseName(meta.name),
      youtubeVideoId,
    });

    if (onProgress) {
      onProgress({ phase: 'exercise', ejerId, name: meta.name });
    }
  }

  return [...entries.values()];
}
