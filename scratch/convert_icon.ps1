Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('public/app_icon.jpg')
$img.Save('public/app_icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Write-Host "Success: Converted app_icon.jpg to app_icon.png"
