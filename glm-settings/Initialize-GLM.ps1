# سكربت تهيئة GLM-4.5 التلقائي
Write-Host "=== جاري تهيئة GLM-4.5 ===" -ForegroundColor Cyan

# انتظر حتى يصبح GLM جاهزًا
Start-Sleep -Seconds 2

# تفعيل المزايا
try {
    Write-Host "تفعيل وضع التفكير..." -ForegroundColor Yellow
    /glm set reasoning=true -ErrorAction Stop
    
    Write-Host "تفعيل السياق الطويل..." -ForegroundColor Yellow
    /glm set long-context=true -ErrorAction Stop
    
    Write-Host "تفعيل أدوات البرمجة..." -ForegroundColor Yellow
    /glm enable-tools programming -ErrorAction Stop
    
    Write-Host "تفعيل أدوات البحث..." -ForegroundColor Yellow
    /glm enable-tools search -ErrorAction Stop
    
    Write-Host "تطبيق الإعدادات..." -ForegroundColor Yellow
    /glm config import "C:\Users\llu77\Desktop\orign\glm-settings\glm_config.json" -ErrorAction Stop
    
    Write-Host "حفظ الإعدادات..." -ForegroundColor Yellow
    /glm config save -ErrorAction Stop
    
    Write-Host "✓ تم تهيئة GLM-4.5 بنجاح!" -ForegroundColor Green
} catch {
    Write-Host "خطأ في التهيئة: $($_.Exception.Message)" -ForegroundColor Red
}
