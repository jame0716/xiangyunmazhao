Write-Host "=== C:\ 根目录 ==="
Get-ChildItem C:\ -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $sz = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1GB
    if ($sz -gt 0.1) { Write-Host ("{0,10:N1} GB  {1}" -f $sz, $_.FullName) }
}

Write-Host ""
Write-Host "=== C:\Program Files 子目录 ==="
Get-ChildItem "C:\Program Files" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $sz = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1GB
    if ($sz -gt 0.5) { Write-Host ("{0,10:N1} GB  {1}" -f $sz, $_.Name) }
}

Write-Host ""
Write-Host "=== C:\ProgramData 子目录 ==="
Get-ChildItem "C:\ProgramData" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $sz = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1GB
    if ($sz -gt 0.5) { Write-Host ("{0,10:N1} GB  {1}" -f $sz, $_.Name) }
}

Write-Host ""
Write-Host "=== AppData\Local 子目录 (>0.5GB) ==="
Get-ChildItem "$env:USERPROFILE\AppData\Local" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $sz = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1GB
    if ($sz -gt 0.5) { Write-Host ("{0,10:N1} GB  {1}" -f $sz, $_.Name) }
}

Write-Host ""
Write-Host "=== AppData\Roaming 子目录 (>0.5GB) ==="
Get-ChildItem "$env:USERPROFILE\AppData\Roaming" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $sz = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1GB
    if ($sz -gt 0.5) { Write-Host ("{0,10:N1} GB  {1}" -f $sz, $_.Name) }
}

Write-Host ""
Write-Host "=== D:\ 根目录 ==="
Get-ChildItem D:\ -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $sz = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1GB
    if ($sz -gt 0.5) { Write-Host ("{0,10:N1} GB  {1}" -f $sz, $_.FullName) }
}