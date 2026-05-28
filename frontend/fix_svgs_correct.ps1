$source = "D:\mindmetric\frontend\dist\assets\images\word-nebula\*.svg"
$dest = "D:\mindmetric\frontend\public\assets\images\word-nebula"
Copy-Item -Path $source -Destination $dest -Force

Get-ChildItem -Path $dest -Filter "*.svg" | ForEach-Object {
    $lines = Get-Content $_.FullName -Encoding UTF8
    $filtered = $lines | Where-Object { $_ -notmatch 'rect x="28" y="112"' -and $_ -notmatch 'text x="80" y="130"' }
    Set-Content -Path $_.FullName -Value $filtered -Encoding UTF8
}
