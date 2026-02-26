import type { FastifyInstance } from 'fastify';

interface RecommendationRequest {
  security_score?: number;
  gdpr_score?: number;
  audit_type?: string;
}

interface SkillRecommendation {
  skill: string;
  namespace: string;
  tier: 'free' | 'pro' | 'enterprise';
  reason: string;
  skillia_url: string;
  priority: 'high' | 'medium' | 'low';
}

export async function recommendationsRoute(app: FastifyInstance) {
  app.post<{ Body: RecommendationRequest }>('/v1/recommendations', async (request, reply) => {
    const { security_score, gdpr_score, audit_type } = request.body;
    
    const recommendations: SkillRecommendation[] = [];

    // Security recommendations
    if (security_score !== undefined && security_score < 80) {
      recommendations.push({
        skill: 'ai-governance-audit',
        namespace: 'skillia',
        tier: 'enterprise',
        reason: 'Improve AI governance, prompt safety, and model versioning',
        skillia_url: 'https://skills-registry-flax.vercel.app/skills/skillia/ai-governance-audit',
        priority: 'high',
      });
    }

    if (security_score !== undefined && security_score < 70) {
      recommendations.push({
        skill: 'security-baseline-audit',
        namespace: 'skillia',
        tier: 'enterprise',
        reason: 'Establish security baseline: secrets handling, permissions, exposure surface',
        skillia_url: 'https://skills-registry-flax.vercel.app/skills/skillia/security-baseline-audit',
        priority: 'high',
      });
    }

    // GDPR recommendations
    if (gdpr_score !== undefined && gdpr_score < 70) {
      recommendations.push({
        skill: 'gdpr-readiness-check',
        namespace: 'skillia',
        tier: 'enterprise',
        reason: 'Ensure GDPR compliance: data handling, consent, retention policies',
        skillia_url: 'https://skills-registry-flax.vercel.app/skills/skillia/gdpr-readiness-check',
        priority: 'high',
      });
    }

    // General improvements
    if (audit_type === 'security' || (security_score !== undefined && security_score < 90)) {
      recommendations.push({
        skill: 'observability-readiness-audit',
        namespace: 'skillia',
        tier: 'enterprise',
        reason: 'Improve monitoring, logging, and alerting capabilities',
        skillia_url: 'https://skills-registry-flax.vercel.app/skills/skillia/observability-readiness-audit',
        priority: 'medium',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return {
      recommendations,
      count: recommendations.length,
      message: recommendations.length > 0 
        ? 'Based on your audit, we recommend these skills to improve your OpenClaw instance'
        : 'Your OpenClaw instance is in great shape! No immediate recommendations.',
    };
  });

  // Get recommendation by audit ID
  app.get<{ Params: { auditId: string } }>('/v1/recommendations/:auditId', async (request, reply) => {
    const { auditId } = request.params;
    
    // TODO: Fetch audit from DB and generate recommendations
    // For now, return sample recommendations
    
    return {
      audit_id: auditId,
      recommendations: [
        {
          skill: 'ai-governance-audit',
          namespace: 'skillia',
          tier: 'enterprise',
          reason: 'Detected gaps in AI governance framework',
          skillia_url: 'https://skills-registry-flax.vercel.app/skills/skillia/ai-governance-audit',
          priority: 'high',
        },
      ],
    };
  });
}
