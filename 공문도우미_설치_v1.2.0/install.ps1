# 공문 도우미 설치
#  · 실행정책 우회·스크립트 eval·창 숨김 VBS 를 쓰지 않는다(백신·SmartScreen 오탐을 줄임).
#  · 자동시작은 '로그온 예약 작업'으로 등록한다.
#  · 배포된 스크립트에 자체 서명을 붙인다(실패해도 설치는 계속).
param([string]$Source = "", [switch]$Silent)

$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { chcp 65001 > $null } catch {}

$root = $PSScriptRoot
if (-not $root) { $root = $env:GMH_SRC }
if (-not $root) { $root = (Get-Location).Path }
if (-not $Source) { $Source = Join-Path $root "app" }
. (Join-Path $root "gmh-common.ps1")

function Line($t, $c = "Gray") { Write-Host $t -ForegroundColor $c }

Write-Host ""
Line "  ============================================" "Cyan"
Line "     공문 도우미 v1.2.0 설치" "Cyan"
Line "  ============================================" "Cyan"
Write-Host ""
Line ("  설치 위치 : " + $GMH_DEST)
Write-Host ""

if (-not (Test-Path $Source)) {
  Line "  [오류] 설치 파일(app 폴더)을 찾지 못했습니다." "Red"
  Line ("         찾은 경로: " + $Source) "Red"
  Line "         압축을 푼 폴더 안에서 실행해 주세요." "Yellow"
  if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
  exit 1
}

# 1) 실행 중인 공문 도우미 종료
Line "  [1/5] 실행 중인 공문 도우미를 종료합니다..."
Gmh-StopRunning
Start-Sleep -Milliseconds 1200

# 2) 파일 복사
Line "  [2/5] 파일을 복사합니다..."
try {
  New-Item -ItemType Directory -Force -Path $GMH_DEST | Out-Null
  Copy-Item (Join-Path $Source "*") $GMH_DEST -Recurse -Force
  # v1.1 이 따로 붙이던 서식 모듈 — 이제 본체의 [작성] 탭에 들어 있다
  Remove-Item (Join-Path $GMH_DEST "dist\gmh-tpl.js") -Force -ErrorAction SilentlyContinue
} catch {
  Line ("  [오류] 파일 복사 실패: " + $_.Exception.Message) "Red"
  if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
  exit 1
}

# '인터넷에서 받음' 표시 제거(사용자 본인 파일). 그래야 RemoteSigned 에서 그대로 실행된다.
try { Get-ChildItem $GMH_DEST -Recurse -File -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue } catch {}

# 예전(1.0) 시작 방식(바로가기 + run.vbs) 흔적 제거
Gmh-RemoveLegacyStartup

# 3) 자체 서명
Line "  [3/5] 스크립트에 서명합니다..."
$cert = Gmh-EnsureCert
$signed = Gmh-SignScripts $cert
if ($cert -and $signed -gt 0) { Line ("        서명 완료(" + $signed + "개). 이 컴퓨터의 사용자 계정에서만 신뢰됩니다.") "DarkGray" }
else { Line "        (서명은 건너뜁니다. 설치는 계속합니다.)" "DarkGray" }

# 4) 자동 시작 등록(로그온 예약 작업)
Line "  [4/5] 자동 시작을 등록합니다(로그온 예약 작업)..."
$how = Gmh-RegisterTask
switch ($how) {
  "task"     { Line "        예약 작업으로 등록했습니다." "DarkGray" }
  "schtasks" { Line "        예약 작업으로 등록했습니다." "DarkGray" }
  "shortcut" { Line "        예약 작업이 막혀 시작 프로그램(바로가기)으로 등록했습니다." "Yellow" }
  default    { Line "        [경고] 자동 시작 등록에 실패했습니다. 컴퓨터를 켤 때 자동 실행되지 않습니다." "Yellow" }
}

# 5) 지금 실행
Line "  [5/5] 지금 실행합니다..."
[void](Gmh-StartNow)
Start-Sleep -Milliseconds 1500
$running = Gmh-IsRunning

Write-Host ""
Line "  --------------------------------------------"
Line "   설치가 끝났습니다." "Green"
Write-Host ""
if ($running -gt 0) {
  Line "   · 작업표시줄 오른쪽 아래 트레이에 파란 [공] 아이콘이 있습니다." "Green"
} else {
  Line "   · 트레이 아이콘이 바로 안 보이면, 다시 로그인(또는 재부팅)하면 자동으로 뜹니다." "Yellow"
}
Line "   · K-에듀파인에서 기안 창을 열면 [공문도우미] 탭이 자동으로 나타납니다."
Line "     [작성] 탭에서 서식으로 쓰고, [검사] 탭에서 점검합니다."
Line "   · 컴퓨터를 켤 때마다 자동으로 실행됩니다."
Write-Host ""
if ($how -eq "none") {
  Line "   ※ 백신·보안 정책이 자동 시작 등록을 막았을 수 있습니다." "Yellow"
  Line ("     그때는 " + (Gmh-HostPath) + " 를 직접 실행하거나, 사용법.txt 7번을 보세요.") "Yellow"
  Write-Host ""
}
Line "   데이터취합 확장은 따로 설치합니다. 사용법.txt 를 보세요."
Write-Host ""
Line ("   삭제하려면 " + (Join-Path $GMH_DEST "제거.bat") + " 를 실행하세요.")
Line "  --------------------------------------------"
Write-Host ""
if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
