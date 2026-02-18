import Fastify from 'fastify';
import { healthRoute } from './routes/health';
import { authRoute } from './routes/auth';
import { auditRoute } from './routes/audit';
import { gdprRoute } from './routes/gdpr';
import { certificationsRoute } from './routes/certifications';
import { billingRoutes } from './routes/billing';
import { auditsRoutes } from './routes/audits';

export function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  app.register(healthRoute, { prefix: '/v1' });
  app.register(authRoute, { prefix: '/v1' });
  app.register(auditRoute, { prefix: '/v1' });
  app.register(gdprRoute, { prefix: '/v1' });
  app.register(certificationsRoute, { prefix: '/v1' });
  app.register(billingRoutes);
  app.register(auditsRoutes);

  return app;
}

async function start() {
  const app = buildApp();
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`OpenClaw University API running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
