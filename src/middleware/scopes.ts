import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function checkScope(
  request: FastifyRequest & { tokenId?: string; tokenData?: { scopes: string; auditCount: number; auditLimit: number; tier: string } },
  reply: FastifyReply,
  requiredScope: string
): Promise<boolean> {
  const tokenId = (request as any).tokenId;
  if (!tokenId) {
    reply.code(401).send({ error: 'Unauthorized', message: 'No token provided', statusCode: 401 });
    return false;
  }

  const token = await prisma.token.findUnique({ where: { id: tokenId } });
  if (!token) {
    reply.code(401).send({ error: 'Unauthorized', message: 'Token not found', statusCode: 401 });
    return false;
  }

  const tokenScopes = token.scopes.split(',').map((s) => s.trim());
  if (!tokenScopes.includes(requiredScope) && !tokenScopes.includes('*')) {
    reply.code(403).send({
      error: 'Forbidden',
      message: `This action requires the '${requiredScope}' scope. Upgrade your plan to access this feature.`,
      statusCode: 403,
      upgradeUrl: 'https://openclaw-university-api.onrender.com/v1/billing/checkout',
    });
    return false;
  }

  // Rate limit check for audit scopes
  if (requiredScope.startsWith('audit:') && token.auditCount >= token.auditLimit) {
    reply.code(429).send({
      error: 'Too Many Requests',
      message: `You have reached your audit limit (${token.auditLimit}/month) for the ${token.tier} plan. Upgrade to continue.`,
      statusCode: 429,
      auditCount: token.auditCount,
      auditLimit: token.auditLimit,
      tier: token.tier,
      upgradeUrl: 'https://openclaw-university-api.onrender.com/v1/billing/checkout',
    });
    return false;
  }

  // Increment audit count after passing checks
  if (requiredScope.startsWith('audit:')) {
    await prisma.token.update({
      where: { id: tokenId },
      data: { auditCount: { increment: 1 } },
    });
  }

  return true;
}
