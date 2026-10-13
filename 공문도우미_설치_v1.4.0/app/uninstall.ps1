# 공문 도우미 제거
#  · 이 파일 하나로 끝까지 지운다(다른 파일에 기대지 않는다). 설치가 반쯤 되다 만 PC, 파일이 일부 없어진 PC,
#    예전 판(1.0~1.3)이 깔린 PC 에서도 그대로 쓸 수 있다. 받은 설치 폴더의 제거.bat 으로도 실행된다.
#  · 하는 일: 실행 중인 도우미 종료 → 자동 시작(예약 작업·시작 바로가기) 삭제 → 예전 인증서 정리 →
#            설치 폴더 삭제 → 업데이트 때 내려받은 임시 폴더 삭제 → 남은 것이 있으면 알려 줌
#  · 시험용 환경 변수: GMH_DEST(설치 폴더) · GMH_TASK(예약 작업 이름)
param([switch]$Silent, [switch]$Yes)
$ErrorActionPreference = "Continue"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { chcp 65001 > $null } catch {}

# 제거.bat 이 '제거 스크립트가 실제로 시작됐는지' 알 수 있게 표시를 남긴다
if ($env:GMH_MARK) { try { [System.IO.File]::WriteAllText($env:GMH_MARK, "started") } catch {} }

$TASK    = if ($env:GMH_TASK) { $env:GMH_TASK } else { "공문도우미" }
$DEST    = if ($env:GMH_DEST) { $env:GMH_DEST } else { Join-Path $env:LOCALAPPDATA "GongmunHelper" }
$SANDBOX = [bool]($env:GMH_TASK -or $env:GMH_DEST)
$LNK     = Join-Path (Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup") ($TASK + ".lnk")
$CERT    = "CN=Gongmun Helper Self-Signed"

function Line($t, $c = "Gray") { Write-Host $t -ForegroundColor $c }
function Done([int]$code) {
  if (-not $Silent) { Write-Host ""; Read-Host "  엔터를 누르면 닫힙니다" | Out-Null }
  exit $code
}

function HostProcesses {
  try {
    return @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='conhost.exe' OR Name='wscript.exe'" -ErrorAction Stop |
      Where-Object {
        $c = [string]$_.CommandLine
        if (-not $c -or $_.ProcessId -eq $PID) { return $false }
        if (-not ($c -like '*host.ps1*-Tray*' -or ($c -like '*GMH_HOME*' -and $c -like '*-Tray*') -or $c -like '*GongmunHelper*run.vbs*')) { return $false }
        if ($SANDBOX) { return ($c -like ('*' + $DEST + '*')) }
        return $true
      })
  } catch { return @() }
}

Write-Host ""
Line "  ============================================" "Cyan"
Line "     공문 도우미 제거" "Cyan"
Line "  ============================================" "Cyan"
Write-Host ""
Line ("  " + $DEST + " 를 삭제하고")
Line "  자동 시작(예약 작업)을 지웁니다. 설정(자동 로그인용 인증서 암호 포함)도 함께 지워집니다."
Write-Host ""
$ans = if ($Yes) { "Y" } else { Read-Host "  정말 제거할까요? (Y/N)" }
if ($ans -notmatch '^[Yy]') {
  Write-Host ""
  Line "  취소했습니다."
  Done 0
}

# 이 창(과 이 창을 띄운 창)이 설치 폴더 안에 서 있으면 폴더를 지울 수 없다. 임시 폴더로 옮겨 선다.
try { Set-Location -LiteralPath $env:TEMP } catch {}
try { [Environment]::CurrentDirectory = $env:TEMP } catch {}

Write-Host ""
Line "  [1/5] 실행 중인 프로그램을 종료합니다..."
try { if (-not $SANDBOX -and (Get-Command Stop-ScheduledTask -ErrorAction SilentlyContinue)) { Stop-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue } } catch {}
foreach ($p in (HostProcesses)) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue } catch {} }
$until = (Get-Date).AddSeconds(8)
while ((Get-Date) -lt $until -and @(HostProcesses).Count -gt 0) { Start-Sleep -Milliseconds 250 }
$up = @(HostProcesses).Count
if ($up -gt 0) { Line ("        [주의] 끝나지 않은 프로세스 " + $up + "개가 있습니다.") "Yellow" }

Line "  [2/5] 자동 시작 등록을 지웁니다..."
try {
  if (Get-Command Unregister-ScheduledTask -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TASK -Confirm:$false -ErrorAction SilentlyContinue
  }
} catch {}
try { & schtasks.exe /Delete /TN $TASK /F 2>$null | Out-Null } catch {}
try { if (Test-Path -LiteralPath $LNK) { Remove-Item -LiteralPath $LNK -Force -ErrorAction SilentlyContinue } } catch {}
$taskLeft = $false
try { if (Get-Command Get-ScheduledTask -ErrorAction SilentlyContinue) { $taskLeft = [bool](Get-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue) } } catch {}

Line "  [3/5] 예전 판이 만든 인증서를 정리합니다..."
$hasRoot = $false
try { $hasRoot = [bool](Get-ChildItem Cert:\CurrentUser\Root -ErrorAction SilentlyContinue | Where-Object { $_.Subject -eq $CERT }) } catch {}
if ($hasRoot) { Line "        '신뢰할 수 있는 루트'에서 지울 때 Windows 확인 창이 뜹니다. [예] 를 누르세요." "Yellow" }
foreach ($store in @("My", "TrustedPublisher", "Root")) {
  try {
    Get-ChildItem ("Cert:\CurrentUser\" + $store) -ErrorAction SilentlyContinue | Where-Object { $_.Subject -eq $CERT } | ForEach-Object {
      try {
        if ($store -eq "My") { Remove-Item $_.PSPath -DeleteKey -Force -ErrorAction Stop }
        else { Remove-Item $_.PSPath -Force -ErrorAction Stop }
      } catch {}
    }
  } catch {}
}

Line "  [4/5] 설치 폴더를 지웁니다..."
$left = @()
if (Test-Path -LiteralPath $DEST) {
  for ($try = 0; $try -lt 5; $try++) {
    try { Remove-Item -LiteralPath $DEST -Recurse -Force -ErrorAction SilentlyContinue } catch {}
    if (-not (Test-Path -LiteralPath $DEST)) { break }
    # 읽기 전용·숨김 표시나 잠깐의 잠금 때문에 남았으면 cmd 로 한 번 더
    try { & cmd.exe /d /c ('rd /s /q "' + $DEST + '"') 2>$null | Out-Null } catch {}
    if (-not (Test-Path -LiteralPath $DEST)) { break }
    Start-Sleep -Milliseconds 700
  }
  if (Test-Path -LiteralPath $DEST) {
    try { $left = @(Get-ChildItem -LiteralPath $DEST -Recurse -File -Force -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName.Substring($DEST.Length + 1) }) } catch {}
  }
}

Line "  [5/5] 내려받아 둔 임시 파일을 지웁니다..."
if (-not $SANDBOX) {
  try {
    Get-ChildItem -LiteralPath $env:TEMP -Directory -Filter "GongmunHelper-update-*" -ErrorAction SilentlyContinue |
      ForEach-Object { try { Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue } catch {} }
  } catch {}
}

Write-Host ""
$code = 0
if (Test-Path -LiteralPath $DEST) {
  $code = 1
  if ($left.Count -eq 0) {
    Line "  프로그램 파일은 모두 지웠고, 빈 폴더만 남았습니다(다른 창이 그 폴더를 열고 있습니다)." "Yellow"
    Line ("  탐색기에서 " + $DEST + " 폴더를 닫은 뒤 직접 지우면 됩니다.") "Yellow"
  } else {
    Line ("  파일 " + $left.Count + "개를 지우지 못했습니다: " + (($left | Select-Object -First 4) -join ", ")) "Yellow"
    Line "  · 엣지·크롬에 넣은 확장 '공문 도우미'가 이 폴더(edge-ext)를 쓰고 있으면 브라우저를 닫고 다시 실행하세요." "Yellow"
    Line "  · 그래도 남으면 컴퓨터를 다시 켠 뒤 이 제거.bat 을 한 번 더 실행하세요." "Yellow"
    Line ("    남은 폴더: " + $DEST) "Yellow"
  }
} else {
  Line "  제거가 끝났습니다." "Green"
  Line "  결재·수신 프리셋과 패널 위치는 K-에듀파인 창의 저장소에 남아 있어, 다시 설치하면 그대로 쓸 수 있습니다."
}
if ($taskLeft) {
  $code = 1
  Line "  [주의] 예약 작업 '공문도우미'를 지우지 못했습니다. 작업 스케줄러에서 직접 지워 주세요." "Yellow"
}
Write-Host ""
Line "  브라우저 확장 '공문 도우미'를 넣으셨다면 edge://extensions (크롬은 chrome://extensions) 에서 직접 제거해 주세요."
Done $code
