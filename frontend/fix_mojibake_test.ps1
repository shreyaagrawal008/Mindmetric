$path = "D:\mindmetric\frontend\public\assets\images\word-nebula\cosmic-net.svg"
$content = [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8)
$win1252 = [Text.Encoding]::GetEncoding(1252)
$bytes = $win1252.GetBytes($content)
$fixed = [Text.Encoding]::UTF8.GetString($bytes)
[IO.File]::WriteAllText($path, $fixed, [Text.Encoding]::UTF8)
