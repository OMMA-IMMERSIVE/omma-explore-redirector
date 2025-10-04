export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  const routes = [
    {
      prefix: "/models/",
      targetBase: "https://omma-models.netlify.app/",
      strip: "/models/"
    },
    {
      prefix: "/stonefieldOfficeViewer/",
      targetBase: "https://omma-stonefieldofficeviewer.netlify.app/",
      strip: "/stonefieldOfficeViewer/"
    }
  ];

  for (const r of routes) {
    if (path === r.prefix || path.startsWith(r.prefix)) {
      const rest = path.slice(r.strip.length);
      const target = new URL(rest || "", r.targetBase).toString();
      const upstream = await fetch(target, { headers: request.headers });

      const h = new Headers(upstream.headers);
      h.set("Cross-Origin-Opener-Policy", "same-origin");
      h.set("Cross-Origin-Embedder-Policy", "credentialless");
      h.set("Cross-Origin-Resource-Policy", "same-origin");

      return new Response(upstream.body, {
        status: upstream.status,
        headers: h
      });
    }
  }

  return new Response("Not found. Try /models/... or /stonefieldofficeviewer/...", {
    status: 404
  });
};
