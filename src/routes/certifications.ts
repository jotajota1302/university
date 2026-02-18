import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth';

const prisma = new PrismaClient();

type AuthenticatedRequest = FastifyRequest & { tokenId: string };

interface CreateCertBody {
  auditId: string;
  type: 'SECURITY' | 'GDPR' | 'FULL';
}

interface CertParams {
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
  <text x="100" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#94a3b8">OpenClaw ${type}</text>
  <text x="100" y="55" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="bold" fill="${color}">${label}</text>
</svg>`;
}

export async function certificationsRoute(app: FastifyInstance): Promise<void> {
  // POST /v1/certifications — create certificate from certifiable audit
  app.post<{ Body: CreateCertBody }>(
    '/certifications',
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
        return reply.code(400).send({ error: 'Audit is not certifiable. Resolve all certification blockers first.' });
      }

      const existing = await prisma.certificate.findUnique({ where: { auditId } });
      if (existing) {
        return reply.code(409).send({ error: 'A certificate already exists for this audit' });
      }

      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 6);

      const certificate = await prisma.certificate.create({
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
        id: certificate.id,
        auditId: certificate.auditId,
        type: certificate.type,
        grade: certificate.grade,
        score: certificate.score,
        issuedAt: certificate.issuedAt.toISOString(),
        validUntil: certificate.validUntil.toISOString(),
        revoked: certificate.revoked,
      });
    }
  );

  // GET /v1/certifications/:id — certificate details (auth required)
  app.get<{ Params: CertParams }>(
    '/certifications/:id',
    { preHandler: verifyToken },
    async (request, reply) => {
      const { id } = request.params;

      const certificate = await prisma.certificate.findUnique({ where: { id } });

      if (!certificate) {
        return reply.code(404).send({ error: 'Certificate not found' });
      }

      return reply.code(200).send({
        id: certificate.id,
        auditId: certificate.auditId,
        tokenId: certificate.tokenId,
        type: certificate.type,
        grade: certificate.grade,
        score: certificate.score,
        issuedAt: certificate.issuedAt.toISOString(),
        validUntil: certificate.validUntil.toISOString(),
        revoked: certificate.revoked,
        revokedAt: certificate.revokedAt?.toISOString() || null,
      });
    }
  );

  // GET /v1/certifications/:id/badge — public SVG badge (no auth)
  app.get<{ Params: CertParams }>(
    '/certifications/:id/badge',
    async (request, reply) => {
      const { id } = request.params;

      const certificate = await prisma.certificate.findUnique({ where: { id } });

      if (!certificate) {
        return reply.code(404).send({ error: 'Certificate not found' });
      }

      const svg = generateBadgeSvg(certificate.grade, certificate.type, certificate.revoked);

      return reply.code(200).header('Content-Type', 'image/svg+xml').send(svg);
    }
  );

  // GET /v1/certifications/:id/verify — public verification JSON (no auth)
  app.get<{ Params: CertParams }>(
    '/certifications/:id/verify',
    async (request, reply) => {
      const { id } = request.params;

      const certificate = await prisma.certificate.findUnique({ where: { id } });

      if (!certificate) {
        return reply.code(404).send({ error: 'Certificate not found' });
      }

      const now = new Date();
      const isExpired = now > certificate.validUntil;
      const isValid = !certificate.revoked && !isExpired;

      return reply.code(200).send({
        valid: isValid,
        id: certificate.id,
        type: certificate.type,
        grade: certificate.grade,
        score: certificate.score,
        issuedAt: certificate.issuedAt.toISOString(),
        validUntil: certificate.validUntil.toISOString(),
        revoked: certificate.revoked,
        expired: isExpired,
      });
    }
  );
}
