# 공문 도우미 설치
#  · 한글 메시지는 여기(PowerShell)에서 출력한다.
#    배치 파일에 한글을 넣으면 cmd 의 코드페이지 문제로 깨진다.
param([string]$Source = "", [switch]$Silent)

$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { chcp 65001 > $null } catch {}

$DEST    = Join-Path $env:LOCALAPPDATA "GongmunHelper"
$STARTUP = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"
$LNK     = Join-Path $STARTUP "공문도우미.lnk"

# Invoke-Expression 으로 돌릴 때는 $PSScriptRoot 가 비어 있다. 배치가 넘겨준 경로를 쓴다.
$root = $PSScriptRoot
if (-not $root) { $root = $env:GMH_SRC }
if (-not $root) { $root = (Get-Location).Path }
if (-not $Source) { $Source = Join-Path $root "app" }

function Line($t, $c = "Gray") { Write-Host $t -ForegroundColor $c }

Write-Host ""
Line "  ============================================" "Cyan"
Line "     공문 도우미 v1.1.0 설치" "Cyan"
Line "  ============================================" "Cyan"
Write-Host ""
Line ("  설치 위치 : " + $DEST)
Write-Host ""

if (-not (Test-Path $Source)) {
  Line "  [오류] 설치 파일(app 폴더)을 찾지 못했습니다." "Red"
  Line ("         찾은 경로: " + $Source) "Red"
  Line "         압축을 푼 폴더 안에서 실행해 주세요." "Yellow"
  if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
  exit 1
}

# 1) 실행 중인 프로그램 종료
Line "  [1/4] 실행 중인 공문 도우미를 종료합니다..."
try {
  Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
    Where-Object { $_.CommandLine -like '*host.ps1*-Tray*' -or $_.CommandLine -like '*GMH_HOME*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
} catch {}
Start-Sleep -Milliseconds 1200

# 2) 파일 복사
Line "  [2/4] 파일을 복사합니다..."
try {
  New-Item -ItemType Directory -Force -Path $DEST | Out-Null
  Copy-Item (Join-Path $Source "*") $DEST -Recurse -Force
  # 이전 시험판이 남긴 번들 백업이 있으면 지운다
  Remove-Item (Join-Path $DEST "dist\gmh-bundle.v1.0.bak.js") -Force -ErrorAction SilentlyContinue
} catch {
  Line ("  [오류] 파일 복사 실패: " + $_.Exception.Message) "Red"
  if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
  exit 1
}

# 3) 시작 프로그램 등록
# 압축을 받아서 푸면 '인터넷에서 받음' 표시가 붙어 실행이 막힐 수 있다.
try {
  Get-ChildItem $DEST -Recurse -File -ErrorAction SilentlyContinue |
    Unblock-File -ErrorAction SilentlyContinue
} catch {}

Line "  [3/4] 시작 프로그램에 등록합니다..."
try {
  New-Item -ItemType Directory -Force -Path $STARTUP | Out-Null
  $sh = New-Object -ComObject WScript.Shell
  $s = $sh.CreateShortcut($LNK)
  $s.TargetPath = "wscript.exe"
  $s.Arguments = '"' + (Join-Path $DEST "run.vbs") + '"'
  $s.WorkingDirectory = $DEST
  $s.Description = "공문 도우미"
  $s.Save()
} catch {
  Line ("  [경고] 시작 프로그램 등록 실패: " + $_.Exception.Message) "Yellow"
  Line "         설치는 계속합니다. 컴퓨터를 켤 때 자동 실행되지 않습니다." "Yellow"
}

# 4) 실행
Line "  [4/4] 지금 실행합니다..."
try {
  Start-Process "wscript.exe" -ArgumentList ('"' + (Join-Path $DEST "run.vbs") + '"')
} catch {
  Line ("  [경고] 자동 실행 실패: " + $_.Exception.Message) "Yellow"
}

Start-Sleep -Milliseconds 1500
$running = @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
             Where-Object { $_.CommandLine -like '*host.ps1*-Tray*' -or $_.CommandLine -like '*GMH_HOME*' }).Count

Write-Host ""
Line "  --------------------------------------------"
Line "   설치가 끝났습니다." "Green"
Write-Host ""
if ($running -gt 0) {
  Line "   · 작업표시줄 오른쪽 아래 트레이에 파란 [공] 아이콘이 있습니다." "Green"
} else {
  Line "   · 트레이 아이콘이 보이지 않으면 아래 파일을 직접 실행하세요:" "Yellow"
  Line ("     " + (Join-Path $DEST "run.vbs")) "Yellow"
}
Line "   · K-에듀파인에서 기안 창을 열면 오른쪽에 [공문도우미] 탭,"
Line "     왼쪽에 [서식] 탭(공문 서식 자동완성)이 자동으로 나타납니다."
Line "   · 컴퓨터를 켤 때마다 자동으로 실행됩니다."
Write-Host ""
Line "   데이터취합 확장은 따로 설치합니다. 사용법.txt 를 보세요."
Write-Host ""
Line ("   삭제하려면 " + (Join-Path $DEST "제거.bat") + " 를 실행하세요.")
Line "  --------------------------------------------"
Write-Host ""
if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
