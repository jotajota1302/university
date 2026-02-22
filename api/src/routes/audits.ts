import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';

const prisma = new PrismaClient();

export async function auditsRoutes(fastify: FastifyInstance) {
  // GET /v1/audits - Audit history for the current token
  fastify.get('/v1/audits', {
    preHandler: [verifyToken],
    handler: async (request: FastifyRequest & { tokenId?: string }, reply) => {
      const { limit = '10', offset = '0' } = request.query as { limit?: string; offset?: string };
      const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
      const offsetNum = parseInt(offset, 10) || 0;

      const [audits, total] = await Promise.all([
        prisma.audit.findMany({
          where: { tokenId: request.tokenId },
          orderBy: { createdAt: 'desc' },
          take: limitNum,
          skip: offsetNum,
        }),
        prisma.audit.count({ where: { tokenId: request.tokenId } }),
      ]);

      return reply.code(200).send({
        audits: audits.map((a) => ({
          id: a.id,
          score: a.score,
          grade: a.grade,
          createdAt: a.createdAt,
          result: JSON.parse(a.result),
        })),
        total,
        limit: limitNum,
        offset: offsetNum,
      });
    },
  });
}
