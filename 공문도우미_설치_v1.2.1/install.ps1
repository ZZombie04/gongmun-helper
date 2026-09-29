# 공문 도우미 설치
#  · 창 숨김 VBS 를 쓰지 않는다. 자동시작은 '로그온 예약 작업'으로 등록한다(gmh-common.ps1).
#  · 인증서를 만들거나 신뢰 저장소에 넣지 않는다(Windows 보안 경고가 뜨지 않게).
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
Line "     공문 도우미 v1.2.1 설치" "Cyan"
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
Line "  [1/4] 실행 중인 공문 도우미를 종료합니다..."
Gmh-StopRunning
Start-Sleep -Milliseconds 1200

# 2) 파일 복사
Line "  [2/4] 파일을 복사합니다..."
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

# 예전 판(1.1.1~1.2.0)이 만든 서명 인증서의 키를 조용히 지운다(확인 창 없음)
[void](Gmh-RemoveOldCert)
$oldRoot = Gmh-HasRootCert

# 3) 자동 시작 등록(로그온 예약 작업)
Line "  [3/4] 자동 시작을 등록합니다(로그온 예약 작업)..."
$locked = Gmh-PolicyLocked
$how = Gmh-RegisterTask
switch ($how) {
  "task"     { Line "        예약 작업으로 등록했습니다." "DarkGray" }
  "shortcut" { Line "        예약 작업이 막혀 시작 프로그램(바로가기)으로 등록했습니다." "Yellow" }
  default    { Line "        [경고] 자동 시작 등록에 실패했습니다. 컴퓨터를 켤 때 자동 실행되지 않습니다." "Yellow" }
}
if ($locked) { Line "        기관 정책으로 PowerShell 스크립트 실행이 잠긴 PC 라 v1.0 과 같은 방식으로 실행합니다." "DarkGray" }

# 4) 지금 실행
Line "  [4/4] 지금 실행합니다..."
[void](Gmh-StartNow)
Start-Sleep -Milliseconds 1500
$running = Gmh-IsRunning

Write-Host ""
Line "  --------------------------------------------"
Line "   설치가 끝났습니다." "Green"
Write-Host ""
if ($running -gt 0) {
  Line "   · 작업표시줄 오른쪽 아래 트레이에 파란 문서 아이콘이 있습니다." "Green"
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
if ($oldRoot) {
  Line "   ※ 예전 판이 넣은 인증서 이름이 '신뢰할 수 있는 루트' 목록에 남아 있습니다." "DarkGray"
  Line "     서명 키를 지웠으므로 효력이 없고, 제거.bat 을 쓰면 함께 지웁니다." "DarkGray"
  Write-Host ""
}
Line "   데이터취합 확장은 따로 설치합니다. 사용법.txt 를 보세요."
Write-Host ""
Line ("   삭제하려면 " + (Join-Path $GMH_DEST "제거.bat") + " 를 실행하세요.")
Line "  --------------------------------------------"
Write-Host ""
if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
