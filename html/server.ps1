$port = 8888
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
$listener.Start()
Write-Host "Server running at http://localhost:$port" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop."

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".pdf"  = "application/pdf"
  ".mp4"  = "video/mp4"
  ".webm" = "video/webm"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
  ".json" = "application/json"
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $path = $req.Url.LocalPath

    if ($path -eq "/") { $path = "/index.html" }
    $filePath = Join-Path $root $path.TrimStart("/")

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($filePath).ToLower()
      $mime = $mimeTypes[$ext]
      if (-not $mime) { $mime = "application/octet-stream" }
      $res.ContentType = $mime
      $buf = [IO.File]::ReadAllBytes($filePath)
      $res.ContentLength64 = $buf.Length
      $res.OutputStream.Write($buf, 0, $buf.Length)
    } else {
      $res.StatusCode = 404
    }
    $res.Close()
  } catch {
    if ($listener.IsListening) { Write-Host "Error: $_" }
  }
}
$listener.Stop()
