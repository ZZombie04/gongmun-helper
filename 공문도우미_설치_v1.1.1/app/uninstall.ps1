# 공문 도우미 제거 (v1.1)
param([switch]$Silent, [switch]$Yes)
$ErrorActionPreference = "Continue"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { chcp 65001 > $null } catch {}

$here = $PSScriptRoot
if (-not $here) { $here = (Get-Location).Path }
. (Join-Path $here "gmh-common.ps1")

function Line($t, $c = "Gray") { Write-Host $t -ForegroundColor $c }

Write-Host ""
Line "  ============================================" "Cyan"
Line "     공문 도우미 제거" "Cyan"
Line "  ============================================" "Cyan"
Write-Host ""
Line ("  " + $GMH_DEST + " 를 삭제하고")
Line "  자동 시작(예약 작업)과 서명 인증서를 지웁니다."
Write-Host ""
$ans = if ($Yes) { "Y" } else { Read-Host "  정말 제거할까요? (Y/N)" }
if ($ans -notmatch '^[Yy]') {
  Write-Host ""
  Line "  취소했습니다."
  if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
  exit 0
}

Write-Host ""
Line "  [1/4] 실행 중인 프로그램을 종료합니다..."
Gmh-StopRunning
Start-Sleep -Seconds 2

Line "  [2/4] 자동 시작 등록을 지웁니다..."
Gmh-UnregisterTask
Gmh-RemoveLegacyStartup

Line "  [3/4] 서명 인증서를 지웁니다..."
Gmh-RemoveCert

Line "  [4/4] 설치 폴더를 지웁니다..."
Set-Location $env:TEMP
if (Test-Path $GMH_DEST) { Remove-Item $GMH_DEST -Recurse -Force -ErrorAction SilentlyContinue }

Write-Host ""
if (Test-Path $GMH_DEST) {
  Line "  일부 파일이 남아 있습니다. 컴퓨터를 다시 켠 뒤" "Yellow"
  Line ("  " + $GMH_DEST + " 폴더를 직접 지워 주세요.") "Yellow"
} else {
  Line "  제거가 끝났습니다." "Green"
  Line "  설정과 프리셋은 브라우저 저장소에 남아 있어, 다시 설치하면 그대로 쓸 수 있습니다."
}
Write-Host ""
Line "  데이터취합 확장을 설치하셨다면 edge://extensions 에서 직접 제거해 주세요."
Write-Host ""
if (-not $Silent) { Read-Host "  엔터를 누르면 닫힙니다" }
