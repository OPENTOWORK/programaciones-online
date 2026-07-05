const INNERTUBE_KEY = 'AIzaSyAO_FJ2SlhU77Z0Vkq78Kw0Lwdm7a1-8C9';

const CLIENT = {
  clientName: 'WEB',
  clientVersion: '2.20240401.00.00',
  hl: 'es',
  gl: 'ES',
};

function walk(node, fn) {
  if (!node || typeof node !== 'object') return;
  fn(node);
  if (Array.isArray(node)) return node.forEach((item) => walk(item, fn));
  Object.values(node).forEach((value) => walk(value, fn));
}

function extractLockupVideos(root) {
  const videos = new Map();
  walk(root, (node) => {
    const lockup = node.lockupViewModel;
    if (!lockup) return;
    const videoId = lockup.contentId;
    const title = lockup.metadata?.lockupMetadataViewModel?.title?.content;
    if (videoId && title) videos.set(videoId, title.trim());
  });
  return videos;
}

function findContinuationToken(root) {
  let token = null;
  walk(root, (node) => {
    if (token) return;
    if (node.continuationCommand?.token) token = node.continuationCommand.token;
  });
  return token;
}

function parseYtInitialData(html) {
  const marker = 'var ytInitialData = ';
  const start = html.indexOf(marker);
  if (start === -1) return null;

  let i = start + marker.length;
  if (html[i] !== '{') return null;

  let depth = 0;
  let end = i;
  for (; end < html.length; end += 1) {
    if (html[end] === '{') depth += 1;
    if (html[end] === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return JSON.parse(html.slice(i, end));
}

async function innertubeRequest(endpoint, payload) {
  const response = await fetch(`https://www.youtube.com/youtubei/v1/${endpoint}?key=${INNERTUBE_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: { client: CLIENT },
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`YouTube ${endpoint} respondió ${response.status}`);
  }

  return response.json();
}

export async function fetchChannelVideos(channelId, { maxPages = 20 } = {}) {
  const pageUrl = `https://www.youtube.com/channel/${channelId}/videos`;
  const response = await fetch(pageUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    },
  });

  const html = await response.text();
  const initialData = parseYtInitialData(html);
  if (!initialData) return [];

  const videos = extractLockupVideos(initialData);
  let token = findContinuationToken(initialData);
  let pages = 0;

  while (token && pages < maxPages) {
    const data = await innertubeRequest('browse', { continuation: token });
    const batch = extractLockupVideos(data);
    for (const [videoId, title] of batch) videos.set(videoId, title);
    token = findContinuationToken(data);
    pages += 1;
  }

  return [...videos.entries()].map(([videoId, title]) => ({ videoId, title, source: 'channel' }));
}

function extractSearchVideos(root) {
  const videos = [];

  walk(root, (node) => {
    const renderer = node.videoRenderer ?? node.richItemRenderer?.content?.videoRenderer;
    if (!renderer?.videoId) return;

    const title =
      renderer.title?.simpleText ??
      renderer.title?.runs?.map((run) => run.text).join('') ??
      '';

    if (!title) return;

    videos.push({
      videoId: renderer.videoId,
      title: title.trim(),
      source: 'search',
    });
  });

  return videos;
}

export async function searchYoutubeVideos(query, { channelId = null, limit = 5 } = {}) {
  const params = channelId
    ? `EgQQARgBIAE%3D` // type video - may need channel filter in query instead
    : 'EgIQAQ%3D%3D';

  const searchQuery = channelId ? `${query} #${channelId}` : query;

  const data = await innertubeRequest('search', {
    query: channelId ? query : searchQuery,
    params: 'EgIQAQ%3D%3D',
  });

  let results = extractSearchVideos(data);

  if (channelId) {
    results = results.filter((item) => true);
  }

  return results.slice(0, limit);
}

export async function searchYoutubeVideosViaHtml(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    },
  });

  const html = await response.text();
  const data = parseYtInitialData(html);
  if (!data) return [];

  return extractSearchVideos(data).slice(0, 8);
}

export async function fetchChannelVideosViaApi(apiKey, channelId) {
  const uploadsPlaylistId = `UU${channelId.slice(2)}`;
  const videos = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: '50',
      key: apiKey,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    for (const item of data.items ?? []) {
      videos.push({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        source: 'channel-api',
      });
    }

    pageToken = data.nextPageToken ?? '';
  } while (pageToken);

  return videos;
}

export async function searchYoutubeVideosViaApi(apiKey, query, { channelId = null, limit = 5 } = {}) {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: String(limit),
    relevanceLanguage: 'es',
    key: apiKey,
  });

  if (channelId) params.set('channelId', channelId);

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  return (data.items ?? []).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    source: channelId ? 'channel-api-search' : 'search-api',
  }));
}
