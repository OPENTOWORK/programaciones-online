import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const STORAGE_URL =
  "https://nsdurlikkuoxqobabixr.supabase.co/storage/v1/object/public/public-legal/privacy.html";

function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function buildSvgWrapper(html: string) {
  const dataUri = `data:text/html;base64,${toBase64(html)}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 900 5200" preserveAspectRatio="xMinYMin meet">
  <foreignObject width="900" height="5200">
    <iframe xmlns="http://www.w3.org/1999/xhtml"
      src="${dataUri}"
      width="900"
      height="5200"
      style="border:0;background:#0f1419;"
      title="Política de privacidad" />
  </foreignObject>
</svg>`;
}

Deno.serve(async () => {
  const storageResponse = await fetch(STORAGE_URL);

  if (!storageResponse.ok) {
    return new Response("Política de privacidad no disponible.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const html = await storageResponse.text();
  const svg = buildSvgWrapper(html);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
