import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifyToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  const tokenRecord = await prisma.token.findUnique({
    where: { token },
  });

  if (!tokenRecord) {
    reply.code(401).send({ error: 'Invalid token' });
    return;
  }

  if (!tokenRecord.active) {
    reply.code(401).send({ error: 'Token is inactive' });
    return;
  }

  if (new Date() > tokenRecord.expiresAt) {
    reply.code(401).send({ error: 'Token has expired' });
    return;
  }

  (request as FastifyRequest & { tokenId: string }).tokenId = tokenRecord.id;
}
