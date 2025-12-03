const MODELS_SITE = "https://omma-models.netlify.app/";
const OFFICE_SITE = "https://omma-stonefieldofficeviewer.netlify.app/";
const HISTORICVILLAGE_SITE = "https://historicvillageatallaire.netlify.app/";

const ABS_ASSET_RE = /^\/(?:(?:lib|media|assets|static|scripts?|js|css|img|images)\/|.+\.(?:bin|wasm|data|mp3|mp4|webm|json|glb|gltf|jpg|jpeg|png|gif|svg|ico))$/i;

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const referer = request.headers.get("referer") || "";

  // 0) Add trailing slash for folder roots (prevents Firefox relative-path breakage)
  if (path === "/models" || path === "/models/") {
    return Response.redirect(`${url.origin}/models/`, 301);
  }
  const m = path.match(/^\/models\/([^/]+)$/); // e.g. /models/silo2
  if (m) {
    return Response.redirect(`${url.origin}/models/${m[1]}/`, 301);
  }

  if (path === "/StonefieldOfficeViewer") {
    return Response.redirect(`${url.origin}/sStonefieldOfficeViewer/`, 301);
  }

  if (path === "/historicvillageatallaire" || path === "/historicvillageatallaire/") {
    return Response.redirect(`${url.origin}/historicvillageatallaire/`, 301);
  }

  // 1) Direct mounts
  if (path.startsWith("/models/")) {
    const rest = path.slice("/models/".length);
    return proxy(MODELS_SITE + rest + url.search, request);
  }
  if (path.startsWith("/StonefieldOfficeViewer/")) {
    const rest = path.slice("/StonefieldOfficeViewer/".length);
    return proxy(OFFICE_SITE + rest + url.search, request);
  }
  if (path.startsWith("/historicvillageatallaire/")) {
    const rest = path.slice("/historicvillageatallaire/".length);
    return proxy(HISTORICVILLAGE_SITE + rest + url.search, request);
  }

  // 2) Asset catch for absolute URLs used by pages under /models/
  if (ABS_ASSET_RE.test(path) && referer.includes("/models/")) {
    const rest = path.replace(/^\//, "");
    return proxy(MODELS_SITE + rest + url.search, request);
  }

  return new Response("Not found.", { status: 404 });
};

async function proxy(target, req) {
  const upstream = await fetch(target, { headers: req.headers, redirect: "follow" });
  const h = new Headers(upstream.headers);
  // Firefox / WASM friendliness
  h.set("Cross-Origin-Opener-Policy", "same-origin");
  h.set("Cross-Origin-Embedder-Policy", "credentialless");
  h.set("Cross-Origin-Resource-Policy", "same-origin");
  return new Response(upstream.body, { status: upstream.status, headers: h });
}
