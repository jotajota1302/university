import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth';

const prisma = new PrismaClient();

type AuthenticatedRequest = FastifyRequest & { tokenId: string };

interface CreateValidationBody {
  auditId: string;
  type: 'SECURITY' | 'GDPR' | 'FULL';
}

interface ValidationParams {
  id: string;
}

function generateBadgeSvg(grade: string, type: string, revoked: boolean): string {
  const colors: Record<string, string> = {
    A: '#22c55e',
    B: '#84cc16',
    C: '#eab308',
    D: '#f97316',
    F: '#ef4444',
  };
  const color = revoked ? '#6b7280' : (colors[grade] || '#6b7280');
  const label = revoked ? 'REVOKED' : `Grade ${grade}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
  <rect width="200" height="80" rx="8" fill="#1e293b"/>
  <rect x="2" y="2" width="196" height="76" rx="7" fill="none" stroke="${color}" stroke-width="2"/>
  <text x="100" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#94a3b8">Audited & Validated by</text>
  <text x="100" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#94a3b8">OpenClaw University</text>
  <text x="100" y="65" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="bold" fill="${color}">${label}</text>
</svg>`;
}

export async function validationsRoute(app: FastifyInstance): Promise<void> {
  // POST /v1/validations — create validation from auditable result
  app.post<{ Body: CreateValidationBody }>(
    '/validations',
    { preHandler: verifyToken },
    async (request, reply) => {
      const { auditId, type } = request.body;
      const tokenId = (request as AuthenticatedRequest).tokenId;

      if (!auditId || !type) {
        return reply.code(400).send({ error: 'auditId and type are required' });
      }

      const validTypes = ['SECURITY', 'GDPR', 'FULL'];
      if (!validTypes.includes(type)) {
        return reply.code(400).send({ error: `type must be one of: ${validTypes.join(', ')}` });
      }

      const audit = await prisma.audit.findUnique({ where: { id: auditId } });

      if (!audit) {
        return reply.code(404).send({ error: 'Audit not found' });
      }

      const auditResult = JSON.parse(audit.result);
      if (!auditResult.certifiable) {
        return reply.code(400).send({ error: 'Audit is not eligible for validation. Resolve all critical issues first.' });
      }

      const existing = await prisma.validation.findUnique({ where: { auditId } });
      if (existing) {
        return reply.code(409).send({ error: 'A validation already exists for this audit' });
      }

      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 6);

      const validation = await prisma.validation.create({
        data: {
          id: uuidv4(),
          auditId,
          tokenId,
          type,
          grade: audit.grade,
          score: audit.score,
          validUntil,
        },
      });

      return reply.code(201).send({
        id: validation.id,
        auditId: validation.auditId,
        type: validation.type,
        grade: validation.grade,
        score: validation.score,
        issuedAt: validation.issuedAt.toISOString(),
        validUntil: validation.validUntil.toISOString(),
        revoked: validation.revoked,
      });
    }
  );

  // GET /v1/validations/:id — validation details (auth required)
  app.get<{ Params: ValidationParams }>(
    '/validations/:id',
    { preHandler: verifyToken },
    async (request, reply) => {
      const { id } = request.params;

      const validation = await prisma.validation.findUnique({ where: { id } });

      if (!validation) {
        return reply.code(404).send({ error: 'Validation not found' });
      }

      return reply.code(200).send({
        id: validation.id,
        auditId: validation.auditId,
        tokenId: validation.tokenId,
        type: validation.type,
        grade: validation.grade,
        score: validation.score,
        issuedAt: validation.issuedAt.toISOString(),
        validUntil: validation.validUntil.toISOString(),
        revoked: validation.revoked,
        revokedAt: validation.revokedAt?.toISOString() || null,
      });
    }
  );

  // GET /v1/validations/:id/badge — public SVG badge (no auth)
  app.get<{ Params: ValidationParams }>(
    '/validations/:id/badge',
    async (request, reply) => {
      const { id } = request.params;

      const validation = await prisma.validation.findUnique({ where: { id } });

      if (!validation) {
        return reply.code(404).send({ error: 'Validation not found' });
      }

      const svg = generateBadgeSvg(validation.grade, validation.type, validation.revoked);

      return reply.code(200).header('Content-Type', 'image/svg+xml').send(svg);
    }
  );

  // GET /v1/validations/:id/verify — public verification JSON (no auth)
  app.get<{ Params: ValidationParams }>(
    '/validations/:id/verify',
    async (request, reply) => {
      const { id } = request.params;

      const validation = await prisma.validation.findUnique({ where: { id } });

      if (!validation) {
        return reply.code(404).send({ error: 'Validation not found' });
      }

      const now = new Date();
      const isExpired = now > validation.validUntil;
      const isValid = !validation.revoked && !isExpired;

      return reply.code(200).send({
        valid: isValid,
        id: validation.id,
        type: validation.type,
        grade: validation.grade,
        score: validation.score,
        issuedAt: validation.issuedAt.toISOString(),
        validUntil: validation.validUntil.toISOString(),
        revoked: validation.revoked,
        expired: isExpired,
      });
    }
  );
}
