# 공문 도우미 — 설정
# 이 파일은 로더입니다. 실제 코드는 settings-lib.dat 안에 압축·인코딩되어 있습니다.
# 무단 복제 · 역분석 · 위변조를 금합니다. 제작 · 평택교육지원청 장학사 강주원

$here = $PSScriptRoot
if (-not $here -and $env:GMH_HOME) { $here = Join-Path $env:GMH_HOME 'tools' }
if (-not $here) { $here = (Get-Location).Path }
$dat = Join-Path $here 'settings-lib.dat'
$b64 = [System.IO.File]::ReadAllText($dat, [System.Text.Encoding]::UTF8)
$raw = [Convert]::FromBase64String($b64)
$msi = New-Object System.IO.MemoryStream(,$raw)
$gzi = New-Object System.IO.Compression.GzipStream($msi, [System.IO.Compression.CompressionMode]::Decompress)
$sri = New-Object System.IO.StreamReader($gzi, [System.Text.Encoding]::UTF8)
$code = $sri.ReadToEnd(); $sri.Close()
. ([scriptblock]::Create($code))