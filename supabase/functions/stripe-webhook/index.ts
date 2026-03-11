import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createSupabaseClient } from '../_shared/supabase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing signature or webhook secret' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get raw body as text for signature verification
    const body = await req.text();

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('Payment completed:', {
          sessionId: session.id,
          email: session.metadata?.email,
          career: session.metadata?.career,
          careerName: session.metadata?.careerName,
          amount: session.amount_total,
          currency: session.currency,
          paymentStatus: session.payment_status,
        });

        // Save to Supabase database
        try {
          const supabase = createSupabaseClient();

          const { data, error } = await supabase
            .from('pre_orders')
            .insert({
              email: session.metadata?.email || session.customer_email,
              career_id: session.metadata?.career || '',
              career_name: session.metadata?.careerName || '',
              amount: session.amount_total || 0,
              currency: session.currency || 'eur',
              payment_status: 'completed',
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_customer_id: session.customer as string,
              metadata: {
                mode: session.mode,
                payment_method_types: session.payment_method_types,
              },
            });

          if (error) {
            console.error('Error saving to database:', error);
          } else {
            console.log('Successfully saved to database:', data);
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Don't fail the webhook if database save fails
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', {
          sessionId: session.id,
          email: session.metadata?.email,
        });
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error,
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
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
