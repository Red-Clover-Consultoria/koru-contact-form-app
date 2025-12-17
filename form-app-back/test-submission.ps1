# Test de Envio de Formulario
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST: Envio de Formulario (Submission)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$url = "http://localhost:3001/api/forms/submit"
$body = @{
    app_id = "test-form-001"
    website_id = "example.com"
    data = @{
        "Nombre Completo" = "Juan Perez"
        "Correo Electronico" = "juan@example.com"
        "Mensaje" = "Este es un mensaje de prueba"
    }
    metadata = @{
        ip_address = "127.0.0.1"
        user_agent = "TestBrowser/1.0"
        url = "http://example.com/contacto"
        _trap = ""
    }
} | ConvertTo-Json -Depth 10

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "Payload:" -ForegroundColor Yellow
Write-Host $body -ForegroundColor Gray
Write-Host "`n"

try {
    Write-Host "Enviando request..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body $body -ErrorAction Stop
    
    Write-Host "SUCCESS - Submission procesada correctamente`n" -ForegroundColor Green
    Write-Host "Respuesta del servidor:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
    
    Write-Host "`nEstado del envio de email:" -ForegroundColor Cyan
    if ($response.mail_log.success) {
        Write-Host "  Emails enviados: $($response.mail_log.count)" -ForegroundColor Green
    } else {
        Write-Host "  Error en envio de email: $($response.mail_log.error)" -ForegroundColor Yellow
        Write-Host "  La submission fue guardada correctamente en la base de datos" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "ERROR - La request fallo`n" -ForegroundColor Red
    Write-Host "Detalles del error:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "`nRespuesta del servidor:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
