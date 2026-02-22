import { FastifyInstance } from 'fastify';

export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    return reply.code(200).send({
      status: 'ok',
      version: '1.0.0',
      service: 'openclaw-university',
    });
  });
}
