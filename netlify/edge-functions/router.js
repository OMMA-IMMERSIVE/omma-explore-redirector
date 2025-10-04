export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Map first path segment to a target Netlify site
  // Adjust these to your real site subdomains
  const routes = [
    {
      prefix: "/models/",
      targetBase: "https://omma-models.netlify.app/", // Site A (repo: models)
      strip: "/models/" // strip this prefix when proxying
    },
    {
      prefix: "/stonefieldofficeviewer/",
      targetBase: "https://omma-stonefieldofficeviewer.netlify.app/", // Site B
      strip: "/stonefieldofficeviewer/"
    }
  ];

  for (const r of routes) {
    if (path === r.prefix || path.startsWith(r.prefix)) {
      const rest = path.slice(r.strip.length); // e.g. models/silo2/index.html -> silo2/index.html
      const target = new URL(rest || "", r.targetBase).toString();
      const upstream = await fetch(target, { headers: request.headers });

      // Add isolation headers for GS/Firefox
      const h = new Headers(upstream.headers);
      h.set("Cross-Origin-Opener-Policy", "same-origin");
      h.set("Cross-Origin-Embedder-Policy", "credentialless");
      h.set("Cross-Origin-Resource-Policy", "same-origin");

      return new Response(upstream.body, { status: upstream.status, headers: h });
    }
  }

  // Optional: a landing page or 404 for other paths
  return new Response("Not found. Try /models/<project>/ or /stonefieldofficeviewer/.", { status: 404 });
};
