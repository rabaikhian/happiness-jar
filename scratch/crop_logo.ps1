Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile('public/logo.jpg')
# Crop rect: start at X=80, Y=220, width=640, height=360
$rect = New-Object System.Drawing.Rectangle(80, 220, 640, 360)
$bmp = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.DrawImage($src, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$src.Dispose()
$graph.Dispose()

# Save temporary cropped image
$bmp.Save('public/logo_cropped.jpg', [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()

# Overwrite logo.jpg
Copy-Item 'public/logo_cropped.jpg' 'public/logo.jpg' -Force
Remove-Item 'public/logo_cropped.jpg'
Write-Host "Success: Cropped logo.jpg to 640x360"
