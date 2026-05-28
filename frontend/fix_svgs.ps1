$dir = "D:\mindmetric\frontend\public\assets\images\word-nebula"
Get-ChildItem -Path $dir -Filter "*.svg" | ForEach-Object {
    $lines = Get-Content $_.FullName
    $filtered = $lines | Where-Object { $_ -notmatch 'rect x="28" y="112"' -and $_ -notmatch 'text x="80" y="130"' }
    [IO.File]::WriteAllLines($_.FullName, $filtered)
}
