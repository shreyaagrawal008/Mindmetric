$dir = "D:\mindmetric\frontend\public\assets\images\word-nebula"
Get-ChildItem -Path $dir -Filter "*.svg" | ForEach-Object {
    $content = [IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8)
    $win1252 = [Text.Encoding]::GetEncoding(1252)
    $bytes = $win1252.GetBytes($content)
    $fixed = [Text.Encoding]::UTF8.GetString($bytes)
    [IO.File]::WriteAllText($_.FullName, $fixed, [Text.Encoding]::UTF8)
}
