Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('scratch/canva_design.png')
Write-Host "Width: $($img.Width) Height: $($img.Height)"
$img.Dispose()
