import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth';
import { checkSecurityIssues } from '../services/securityAudit';

const prisma = new PrismaClient();

interface AuditFiles {
  'SOUL.md'?: string;
  'AGENTS.md'?: string;
  'TOOLS.md'?: string;
  config?: string;
}

interface AuditRequestBody {
  files: AuditFiles;
}

type AuthenticatedRequest = FastifyRequest & { tokenId: string };

export async function auditRoute(app: FastifyInstance): Promise<void> {
  app.post<{ Body: AuditRequestBody }>(
    '/audit/security',
    { preHandler: verifyToken },
    async (request, reply) => {
      const { files } = request.body;
      const tokenId = (request as AuthenticatedRequest).tokenId;

      const auditId = uuidv4();
      const timestamp = new Date().toISOString();

      const checks = checkSecurityIssues(files);

      let score = 100;
      const certificationBlockers: string[] = [];

      for (const check of checks) {
        if (check.status === 'FAIL') {
          switch (check.severity) {
            case 'CRITICAL':
              score -= 25;
              certificationBlockers.push(check.id);
              break;
            case 'HIGH':
              score -= 15;
              certificationBlockers.push(check.id);
              break;
            case 'MEDIUM':
              score -= 10;
              break;
            case 'LOW':
              score -= 5;
              break;
          }
        }
      }

      score = Math.max(0, score);

      let grade: string;
      if (score >= 90) grade = 'A';
      else if (score >= 75) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 40) grade = 'D';
      else grade = 'F';

      const certifiable = certificationBlockers.length === 0 && score >= 75;

      const recommendations = buildRecommendations(checks);

      const result = {
        auditId,
        timestamp,
        score,
        grade,
        checks,
        recommendations,
        certifiable,
        certificationBlockers,
      };

      await prisma.audit.create({
        data: {
          id: auditId,
          tokenId,
          score,
          grade,
          result: JSON.stringify(result),
        },
      });

      return reply.code(200).send(result);
    }
  );
}

function buildRecommendations(checks: ReturnType<typeof checkSecurityIssues>): string[] {
  const recs: string[] = [];

  for (const check of checks) {
    if (check.status === 'FAIL' && check.fix) {
      recs.push(`[${check.id}] ${check.fix}`);
    }
  }

  if (recs.length === 0) {
    recs.push('All security checks passed. Your agent configuration is secure.');
  }

  return recs;
}
