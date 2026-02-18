import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';

const prisma = new PrismaClient();

const TIER_CONFIG: Record<string, { scopes: string; auditLimit: number; price: string }> = {
  pro: {
    scopes: 'audit:security,audit:gdpr,certify',
    auditLimit: 10,
    price: '49€/month',
  },
  enterprise: {
    scopes: 'audit:security,audit:gdpr,certify,*',
    auditLimit: 999,
    price: '199€/month',
  },
};

export async function billingRoutes(fastify: FastifyInstance) {
  // POST /v1/billing/checkout - Create Stripe checkout session
  fastify.post('/v1/billing/checkout', {
    preHandler: [verifyToken],
    handler: async (request: FastifyRequest & { tokenId?: string }, reply) => {
      const { plan } = request.body as { plan: 'pro' | 'enterprise' };

      if (!plan || !['pro', 'enterprise'].includes(plan)) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: "plan must be 'pro' or 'enterprise'",
          statusCode: 400,
        });
      }

      const token = await prisma.token.findUnique({ where: { id: request.tokenId } });
      if (!token) {
        return reply.code(401).send({ error: 'Unauthorized', statusCode: 401 });
      }

      const stripeKey = process.env.STRIPE_SECRET_KEY;

      // Mock mode when no Stripe key is configured
      if (!stripeKey || stripeKey === 'not_configured') {
        return reply.code(200).send({
          url: `https://checkout.stripe.com/mock?plan=${plan}&clientId=${token.clientId}`,
          plan,
          price: TIER_CONFIG[plan].price,
          mock: true,
          message: 'Stripe not configured — returning mock checkout URL',
        });
      }

      // Real Stripe integration
      try {
        const stripe = require('stripe')(stripeKey);
        const priceId = plan === 'pro'
          ? process.env.STRIPE_PRO_PRICE_ID
          : process.env.STRIPE_ENTERPRISE_PRICE_ID;

        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `https://openclaw-university-api.onrender.com/v1/billing/success?tokenId=${token.id}`,
          cancel_url: `https://openclaw-university-api.onrender.com/v1/billing/cancel`,
          metadata: { tokenId: token.id, plan },
        });

        return reply.code(200).send({ url: session.url, plan, price: TIER_CONFIG[plan].price });
      } catch (err: any) {
        return reply.code(500).send({ error: 'Stripe error', message: err.message, statusCode: 500 });
      }
    },
  });

  // POST /v1/billing/webhook - Stripe webhook
  fastify.post('/v1/billing/webhook', {
    handler: async (request, reply) => {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!stripeKey || !webhookSecret) {
        return reply.code(200).send({ received: true, mock: true });
      }

      try {
        const stripe = require('stripe')(stripeKey);
        const sig = request.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(
          (request as any).rawBody || JSON.stringify(request.body),
          sig,
          webhookSecret
        );

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const { tokenId, plan } = session.metadata;
          const config = TIER_CONFIG[plan];

          if (tokenId && config) {
            await prisma.token.update({
              where: { id: tokenId },
              data: {
                tier: plan,
                scopes: config.scopes,
                auditLimit: config.auditLimit,
                auditCount: 0,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
              },
            });
          }
        }

        if (event.type === 'customer.subscription.deleted') {
          const subscription = event.data.object;
          const token = await prisma.token.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });
          if (token) {
            await prisma.token.update({
              where: { id: token.id },
              data: { tier: 'free', scopes: 'audit:security', auditLimit: 1, auditCount: 0 },
            });
          }
        }

        return reply.code(200).send({ received: true });
      } catch (err: any) {
        return reply.code(400).send({ error: err.message });
      }
    },
  });

  // GET /v1/billing/subscription - Current subscription status
  fastify.get('/v1/billing/subscription', {
    preHandler: [verifyToken],
    handler: async (request: FastifyRequest & { tokenId?: string }, reply) => {
      const token = await prisma.token.findUnique({ where: { id: request.tokenId } });
      if (!token) {
        return reply.code(401).send({ error: 'Unauthorized', statusCode: 401 });
      }

      return reply.code(200).send({
        tier: token.tier,
        scopes: token.scopes.split(',').map((s) => s.trim()),
        auditCount: token.auditCount,
        auditLimit: token.auditLimit,
        stripeSubscriptionId: token.stripeSubscriptionId ?? null,
        active: token.active,
      });
    },
  });
}
