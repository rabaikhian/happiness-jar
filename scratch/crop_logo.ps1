Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile('public/logo.png')
# Crop rect: start X=50, Y=137, width=400, height=225
$rect = New-Object System.Drawing.Rectangle(50, 137, 400, 225)
$bmp = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.DrawImage($src, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$src.Dispose()
$graph.Dispose()

# Save temporary cropped PNG
$bmp.Save('public/logo_cropped.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# Overwrite logo.png
Copy-Item 'public/logo_cropped.png' 'public/logo.png' -Force
Remove-Item 'public/logo_cropped.png'
Write-Host "Success: Cropped logo.png to 400x225"
