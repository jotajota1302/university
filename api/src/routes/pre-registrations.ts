import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function preRegistrationsRoutes(fastify: FastifyInstance) {
  // POST /v1/pre-registrations
  fastify.post('/v1/pre-registrations', async (request, reply) => {
    const { email, career } = request.body as { email: string; career: string };

    if (!email || !career) {
      return reply.code(400).send({ error: 'Email and career are required' });
    }

    try {
      const result = await prisma.preRegistration.create({
        data: {
          email,
          career,
        },
      });

      return reply.code(201).send({
        id: result.id,
        email: result.email,
        career: result.career,
        createdAt: result.createdAt,
      });
    } catch (error: any) {
      // Si el email ya existe (unique constraint)
      if (error.code === 'P2002') {
        return reply.code(409).send({ error: 'Email already registered' });
      }
      
      console.error('Error creating pre-registration:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /v1/pre-registrations (admin only - opcional por ahora)
  fastify.get('/v1/pre-registrations', async (request, reply) => {
    try {
      const results = await prisma.preRegistration.findMany({
        orderBy: { createdAt: 'desc' },
      });
      
      return reply.send({ preRegistrations: results });
    } catch (error) {
      console.error('Error fetching pre-registrations:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
