import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface TokenRequestBody {
  clientId: string;
  secret: string;
}

export async function authRoute(app: FastifyInstance): Promise<void> {
  app.post<{ Body: TokenRequestBody }>('/auth/token', async (request, reply) => {
    const { clientId, secret } = request.body;

    if (!clientId || !clientId.trim() || !secret || !secret.trim()) {
      return reply.code(400).send({
        error: 'clientId and secret are required and cannot be empty',
      });
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.token.create({
      data: {
        clientId: clientId.trim(),
        token,
        active: true,
        expiresAt,
      },
    });

    return reply.code(200).send({
      token,
      expiresAt: expiresAt.toISOString(),
    });
  });
}
