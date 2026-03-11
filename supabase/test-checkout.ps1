# Script para probar la Edge Function de Stripe Checkout localmente (Windows)

Write-Host "🧪 Testing Stripe Checkout Edge Function..." -ForegroundColor Cyan
Write-Host ""

# URL de la función local
$functionUrl = "http://localhost:54321/functions/v1/stripe-checkout"

# Test data
$email = "test@example.com"
$career = "marketing-pro"

Write-Host "📧 Email: $email" -ForegroundColor Yellow
Write-Host "🎓 Career: $career" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Enviando request..." -ForegroundColor Green
Write-Host ""

# Preparar el body JSON
$body = @{
    email = $email
    career = $career
} | ConvertTo-Json

# Hacer la request
try {
    $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Body $body -ContentType "application/json"

    Write-Host "✅ Respuesta recibida:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host

    if ($response.url) {
        Write-Host ""
        Write-Host "🔗 URL de Checkout:" -ForegroundColor Cyan
        Write-Host $response.url -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Test completado!" -ForegroundColor Green
