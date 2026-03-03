const { buildApp } = require('../dist/server');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = buildApp();
    await app.ready();
  }

  // Collect request body
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString();

  // Use Fastify's inject to handle the request in serverless
  const response = await app.inject({
    method: req.method,
    url: req.url,
    headers: req.headers,
    payload: body || undefined,
  });

  // Forward status, headers, and body to Vercel's response
  res.writeHead(response.statusCode, response.headers);
  res.end(response.rawPayload);
};
