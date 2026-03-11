# Test de la Edge Function de Stripe Checkout en Supabase

Write-Host "🧪 Testing Supabase Edge Function: stripe-checkout" -ForegroundColor Cyan
Write-Host ""

# URL de tu Edge Function
$functionUrl = "https://wijjvyjmpipekxsolocq.supabase.co/functions/v1/stripe-checkout"

# Test data
$email = "test@openclaw.edu"
$career = "marketing-pro"

Write-Host "📧 Email: $email" -ForegroundColor Yellow
Write-Host "🎓 Career: $career" -ForegroundColor Yellow
Write-Host "🔗 URL: $functionUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Enviando request a Supabase..." -ForegroundColor Green
Write-Host ""

# Preparar el body JSON
$body = @{
    email = $email
    career = $career
} | ConvertTo-Json

# Hacer la request
try {
    $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop

    Write-Host "✅ Respuesta recibida exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host

    if ($response.url) {
        Write-Host ""
        Write-Host "🎉 ¡Stripe Checkout URL generada!" -ForegroundColor Green
        Write-Host "🔗 URL de Checkout:" -ForegroundColor Cyan
        Write-Host $response.url -ForegroundColor Blue
        Write-Host ""
        Write-Host "✨ Puedes abrir esta URL en el navegador para probar el pago" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "✅ TEST EXITOSO - La integración funciona correctamente!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al llamar a la Edge Function:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "📄 Response body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "💡 Verifica:" -ForegroundColor Yellow
    Write-Host "   1. Que las Edge Functions estén deployed: supabase functions list" -ForegroundColor Gray
    Write-Host "   2. Que los secrets estén configurados: supabase secrets list" -ForegroundColor Gray
    Write-Host "   3. Los logs: supabase functions logs stripe-checkout" -ForegroundColor Gray
}

Write-Host ""
