import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse request body
    const { email, career } = await req.json();

    if (!email || !career) {
      return new Response(
        JSON.stringify({ error: 'Email and career are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Career pricing mapping
    const careerPrices: Record<string, { name: string; nameEn: string; deposit: number }> = {
      'marketing-pro': {
        name: 'Grado en Marketing Digital',
        nameEn: 'Digital Marketing Degree',
        deposit: 9900, // 99.00 EUR in cents
      },
      'sales-accelerator': {
        name: 'Grado en Desarrollo de Negocio',
        nameEn: 'Business Development Degree',
        deposit: 9900,
      },
      'devops-engineer': {
        name: 'Grado en Ingeniería DevOps',
        nameEn: 'DevOps Engineering Degree',
        deposit: 9900,
      },
    };

    const careerInfo = careerPrices[career];
    if (!careerInfo) {
      return new Response(
        JSON.stringify({ error: 'Invalid career selection' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get frontend URL from environment or use default
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';

    // Create Stripe Checkout Session
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
      success_url: `${frontendUrl}/?payment=success&career=${career}`,
      cancel_url: `${frontendUrl}/?payment=cancelled`,
      metadata: {
        email,
        career,
        type: 'pre-order',
        careerName: careerInfo.name,
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
