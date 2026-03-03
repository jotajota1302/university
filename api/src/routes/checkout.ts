import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

export async function checkoutRoutes(app: FastifyInstance): Promise<void> {
  // Crear sesión de checkout
  app.post('/v1/checkout/create-session', async (request, reply) => {
    try {
      const { email, career } = request.body as { email: string; career: string };

      // Mapeo de carreras a precios
      const careerPrices: Record<string, { name: string; deposit: number }> = {
        'marketing-pro': { name: 'Grado en Marketing Digital', deposit: 10000 }, // 100.00 EUR en centavos
        'sales-accelerator': { name: 'Grado en Desarrollo de Negocio', deposit: 10000 },
        'devops-engineer': { name: 'Grado en Ingeniería DevOps', deposit: 10000 },
      };

      const careerInfo = careerPrices[career];
      if (!careerInfo) {
        return reply.code(400).send({ error: 'Carrera no válida' });
      }

      // Crear sesión de checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Pre-matrícula: ${careerInfo.name}`,
                description: 'Adelanto para reservar tu plaza en la primera promoción',
              },
              unit_amount: careerInfo.deposit,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: email,
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=success&career=${career}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=cancelled`,
        metadata: {
          email,
          career,
          type: 'pre-order',
        },
      });

      return reply.send({ sessionId: session.id, url: session.url });
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: 'Error al crear la sesión de pago' });
    }
  });

  // Webhook para confirmar pagos
  app.post('/v1/checkout/webhook', async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        request.body as string | Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Aquí puedes guardar el pago en la base de datos
        app.log.info({
          message: 'Pago completado',
          email: session.metadata?.email,
          career: session.metadata?.career,
          amount: session.amount_total,
        });

        // TODO: Guardar en base de datos que el usuario ha pagado
      }

      return reply.send({ received: true });
    } catch (error) {
      app.log.error(error);
      return reply.code(400).send({ error: 'Webhook signature verification failed' });
    }
  });
}
