// Router for explore.ommaimmersive.com
// - /models/<anything>/* => omma-models site
// - /stonefieldofficeviewer/* => that site
// - Also catch absolute asset paths like /lib/... if Referer was under /models/

const MODELS_SITE = "https://omma-models.netlify.app/";
const OFFICE_SITE = "https://omma-stonefieldofficeviewer.netlify.app/";

const ABS_ASSET_RE = /^\/(?:(?:lib|media|assets|static|scripts?|js|css|img|images)\/|.+\.(?:bin|wasm|data|mp3|mp4|webm|json|glb|gltf|jpg|jpeg|png|gif|svg|ico))$/i;

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const referer = request.headers.get("referer") || "";

  // 1) Direct mounts by prefix
  if (path.startsWith("/models/")) {
    const rest = path.slice("/models/".length); // keep subfolders like silo2/...
    return proxy(MODELS_SITE + rest + url.search, request);
  }
  if (path.startsWith("/stonefieldofficeviewer/")) {
    const rest = path.slice("/stonefieldofficeviewer/".length);
    return proxy(OFFICE_SITE + rest + url.search, request);
  }

  // 2) Asset catch: absolute URLs requested by pages under /models/
  if (ABS_ASSET_RE.test(path) && referer.includes("/models/")) {
    const rest = path.replace(/^\//, "");
    return proxy(MODELS_SITE + rest + url.search, request);
  }

  // 3) Fallback
  return new Response("Not found. Try /models/<project>/ or /stonefieldofficeviewer/.", { status: 404 });
};

async function proxy(target, req) {
  const upstream = await fetch(target, { headers: req.headers });
  const h = new Headers(upstream.headers);
  // Firefox / WASM friendliness
  h.set("Cross-Origin-Opener-Policy", "same-origin");
  h.set("Cross-Origin-Embedder-Policy", "credentialless");
  h.set("Cross-Origin-Resource-Policy", "same-origin");
  return new Response(upstream.body, { status: upstream.status, headers: h });
}
