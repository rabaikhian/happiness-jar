Add-Type -AssemblyName System.Drawing
$json = Get-Content -Raw -Encoding UTF8 -Path 'scratch/text.json' | ConvertFrom-Json

$bmp = [System.Drawing.Image]::FromFile('scratch/canva_design.png')
$newBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height)
$g = [System.Drawing.Graphics]::FromImage($newBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Draw original image
$g.DrawImage($bmp, 0, 0, $bmp.Width, $bmp.Height)
$bmp.Dispose()

# Fonts
$fontFamily = "Leelawadee UI"
$titleFont = New-Object System.Drawing.Font($fontFamily, 22, [System.Drawing.FontStyle]::Bold)
$bodyFont = New-Object System.Drawing.Font($fontFamily, 11, [System.Drawing.FontStyle]::Bold)
$btnFont = New-Object System.Drawing.Font($fontFamily, 9, [System.Drawing.FontStyle]::Bold)

# Brushes and Pens
$brownBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(92, 62, 53)) # #5C3E35
$orangeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(249, 115, 22)) # #F97316
$whiteBrush = [System.Drawing.Brushes]::White

# Helper to draw rounded rectangle
function Draw-RoundedRectangle($graphics, $brush, $rect, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
    $path.AddArc(($rect.X + $rect.Width - $diameter), $rect.Y, $diameter, $diameter, 270, 90)
    $path.AddArc(($rect.X + $rect.Width - $diameter), ($rect.Y + $rect.Height - $diameter), $diameter, $diameter, 0, 90)
    $path.AddArc($rect.X, ($rect.Y + $rect.Height - $diameter), $diameter, $diameter, 90, 90)
    $path.CloseAllFigures()
    $graphics.FillPath($brush, $path)
    $path.Dispose()
}

# 1. Headline box (moved slightly to the left, X=110)
$rectTitle = New-Object System.Drawing.RectangleF(110, 160, 190, 110)
$g.DrawString($json.title, $titleFont, $brownBrush, $rectTitle)

# 2. Features box
$rectBody = New-Object System.Drawing.RectangleF(110, 270, 190, 220)
$g.DrawString($json.features, $bodyFont, $brownBrush, $rectBody)

# 3. Call to Action Button with 8px corner radius
$rectBtn = New-Object System.Drawing.Rectangle(110, 495, 210, 32)
Draw-RoundedRectangle $g $orangeBrush $rectBtn 8

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString($json.button, $btnFont, $whiteBrush, [System.Drawing.RectangleF]$rectBtn, $sf)

# Save the modified image
$newBmp.Save('public/facebook_promo_canva.png', [System.Drawing.Imaging.ImageFormat]::Png)
$newBmp.Dispose()
$g.Dispose()
Write-Host "Success: Rendered updated text onto public/facebook_promo_canva.png"
