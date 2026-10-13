# 공문 도우미 — 호스트
# 이 파일은 로더입니다. 실제 코드는 host.dat 안에 압축·인코딩되어 있습니다.
# 무단 복제 · 역분석 · 위변조를 금합니다. 제작 · 평택교육지원청 장학사 강주원
param(
  [switch]$Once,
  [switch]$Tray,            # 트레이 아이콘으로 조용히 상주
  [int]$IntervalMs = 1200,
  [int]$MaxLoops = 0,
  [switch]$SelfTest,         # 설치 점검(창 없이 한 번 떠 보고 selftest.json 에 적는다)
  [switch]$Verbose
)
$here = $PSScriptRoot
if (-not $here -and $env:GMH_HOME) { $here = Join-Path $env:GMH_HOME 'tools' }
if (-not $here) { $here = (Get-Location).Path }
$env:GMH_HOME = Split-Path -Parent $here    # 이 로더가 있는 tools 의 상위(설치 폴더)
$dat = Join-Path $here 'host.dat'
$code = $null
try {
  $b64 = [System.IO.File]::ReadAllText($dat, [System.Text.Encoding]::UTF8)
  $raw = [Convert]::FromBase64String($b64)
  $msi = New-Object System.IO.MemoryStream(,$raw)
  $gzi = New-Object System.IO.Compression.GzipStream($msi, [System.IO.Compression.CompressionMode]::Decompress)
  $sri = New-Object System.IO.StreamReader($gzi, [System.Text.Encoding]::UTF8)
  $code = $sri.ReadToEnd(); $sri.Close()
} catch {
  # host.dat 이 없거나 깨졌다(백신이 지웠을 수 있다). 창이 없으니 기록으로 남긴다.
  try {
    [System.IO.File]::AppendAllText((Join-Path $env:GMH_HOME 'host.log'),
      ((Get-Date).ToString('MM-dd HH:mm:ss ') + '로더 오류: ' + $_.Exception.Message + "`r`n"), (New-Object System.Text.UTF8Encoding($true)))
  } catch {}
  exit 1
}
& ([scriptblock]::Create($code)) @PSBoundParameters