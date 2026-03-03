const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const careerPrices = {
  'marketing-pro': { name: 'Grado en Marketing Digital', deposit: 9900 },
  'sales-accelerator': { name: 'Grado en Desarrollo de Negocio', deposit: 9900 },
  'devops-engineer': { name: 'Grado en Ingeniería DevOps', deposit: 9900 },
};

module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    // Parse body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const { email, career } = JSON.parse(Buffer.concat(chunks).toString());

    const careerInfo = careerPrices[career];
    if (!careerInfo) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Carrera no válida' }));
    }

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
      metadata: { email, career, type: 'pre-order' },
    });

    res.statusCode = 200;
    res.end(JSON.stringify({ sessionId: session.id, url: session.url }));
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Error al crear la sesión de pago' }));
  }
};
