#!/bin/bash

# Script para probar la Edge Function de Stripe Checkout localmente

echo "🧪 Testing Stripe Checkout Edge Function..."
echo ""

# URL de la función local
FUNCTION_URL="http://localhost:54321/functions/v1/stripe-checkout"

# Test data
EMAIL="test@example.com"
CAREER="marketing-pro"

echo "📧 Email: $EMAIL"
echo "🎓 Career: $CAREER"
echo ""
echo "🚀 Enviando request..."
echo ""

# Hacer la request
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"career\":\"$CAREER\"}" \
  | jq .

echo ""
echo "✅ Test completado!"
