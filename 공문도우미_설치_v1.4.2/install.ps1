# 공문 도우미 설치
#  · 받은 zip 을 [차단 해제] 하지 않고 풀었어도 설치되도록, 파일을 '내용으로' 새로 써서 설치한다
#    (설치된 파일에는 '인터넷에서 받음' 표시가 남지 않는다).
#  · 예전 판의 프로그램 파일을 먼저 지우고 새로 넣는다(설정 settings.json 은 그대로 둔다).
#  · 설치한 뒤 실제로 한 번 띄워 보고(점검), 이 PC 에서 되는 방식으로 자동 시작을 등록한다.
#  · 트레이가 정말 떴는지 확인하고, 안 떴으면 이유를 알려 준다.
#  · 지금 로그인한 사람의 계정으로만 설치하고, 도우미는 언제나 일반 권한으로 띄운다.
#    ('관리자 권한으로 실행' 에 관리자 계정 암호를 넣으면 그 계정에 설치되어 이 사람의 기안 창에 붙지 않는다.)
#    관리자 권한 · 다른 계정으로 남아 있는 예전 도우미는 Windows 확인 창을 거쳐 끈다.
#  · 창 숨김 VBS 를 쓰지 않는다. 인증서를 만들거나 신뢰 저장소에 넣지 않는다.
param([string]$Source = "", [switch]$Silent, [switch]$Check)   # -Check: 설치하지 않고 이 PC 에서 설치할 수 있는지만 본다

$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { chcp 65001 > $null } catch {}

# 설치.bat 이 '설치 스크립트가 실제로 시작됐는지' 알 수 있게 표시를 남긴다(못 시작했으면 다른 방법으로 다시 돌린다)
if ($env:GMH_MARK) { try { [System.IO.File]::WriteAllText($env:GMH_MARK, "started") } catch {} }

$root = $PSScriptRoot
if (-not $root -and $env:GMH_SRC) { $root = $env:GMH_SRC.TrimEnd('\') }
if (-not $root) { $root = (Get-Location).Path }
if (-not $Source) { $Source = Join-Path $root "app" }

# 공용 함수: 파일로 불러오고, 실행 정책·차단 표시에 걸리면 내용을 읽어 올린다
$commonPath = Join-Path $root "gmh-common.ps1"
$commonOk = $false
try { . $commonPath; $commonOk = $true } catch {}
if (-not $commonOk) {
  try { . ([scriptblock]::Create([System.IO.File]::ReadAllText($commonPath, [System.Text.Encoding]::UTF8))); $commonOk = $true } catch {}
}

$VER = "1.4.2"
function Line($t, $c = "Gray") { Write-Host $t -ForegroundColor $c }
function Done([int]$code) {
  if (-not $Silent -and -not $Check) { Write-Host ""; Read-Host "  엔터를 누르면 닫힙니다" | Out-Null }
  exit $code
}

Write-Host ""
Line "  ============================================" "Cyan"
Line ("     공문 도우미 v" + $VER + " 설치") "Cyan"
Line "  ============================================" "Cyan"
Write-Host ""

if (-not $commonOk) {
  Line "  [오류] 설치 파일(gmh-common.ps1)을 읽지 못했습니다." "Red"
  Line "         zip 을 [모두 압축 풀기] 한 폴더 안에서 설치.bat 을 실행해 주세요." "Yellow"
  Done 1
}
Line ("  설치 위치 : " + $GMH_DEST)
Write-Host ""

if (-not (Test-Path -LiteralPath $Source) -or -not (Test-Path -LiteralPath (Join-Path $Source "tools\host.ps1"))) {
  Line "  [오류] 설치 파일(app 폴더)을 찾지 못했습니다." "Red"
  Line ("         찾은 경로: " + $Source) "Red"
  Line "         zip 을 [모두 압축 풀기] 한 폴더 안에서 설치.bat 을 실행해 주세요." "Yellow"
  Line "         (zip 을 연 창에서 바로 실행하면 나머지 파일을 찾지 못합니다)" "Yellow"
  Done 1
}

# 0) 이 PC 에서 도우미가 돌 수 있는지 먼저 본다(지금 도는 도우미를 멈추기 전에).
#    기관 정책(WDAC·AppLocker)이 PowerShell 을 '제한 모드'로 두면 트레이 프로그램이 동작하지 않는다.
$langMode = [string]$ExecutionContext.SessionState.LanguageMode
$sacState = $null
try { $sacState = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy" -Name VerifiedAndReputablePolicyState -ErrorAction Stop).VerifiedAndReputablePolicyState } catch {}
if ($langMode -ne "FullLanguage") {
  Line ("  [중지] 이 PC 는 보안 정책으로 PowerShell 이 제한 모드(" + $langMode + ")라 공문 도우미가 동작하지 않습니다.") "Red"
  if ($sacState -eq 1) {
    Line "         '스마트 앱 컨트롤'이 켜져 있습니다. 설정 → 개인정보 및 보안 → Windows 보안 →" "Yellow"
    Line "         앱 및 브라우저 컨트롤 → 스마트 앱 컨트롤 설정에서 끈 뒤 다시 설치하세요." "Yellow"
  } else {
    Line "         학교(기관) 정보 담당자에게 PowerShell 스크립트 실행 허용을 문의하세요." "Yellow"
  }
  Line "         (설치된 것은 없고, 이 PC 는 바뀐 것이 없습니다.)" "DarkGray"
  Done 1
}
# 0-1) 누구의 화면에 설치하는가. 도우미는 지금 로그인한 사람의 계정으로 설치하고 띄워야 그 사람의 기안 창에 붙는다.
$who = Gmh-Who
if (Gmh-OtherUser $who) {
  Line ("  [중지] 다른 계정(" + $who.User + ")으로 실행되었습니다. 지금 로그인한 계정은 " + $who.SessionUser + " 입니다.") "Red"
  Line "         이대로 설치하면 그 계정에 설치되어, 이 화면의 기안 창에는 [공문도우미] 탭이 뜨지 않습니다." "Yellow"
  Line "         이 창을 닫고 설치.bat 을 마우스로 그냥 두 번 눌러 실행하세요. 관리자 권한은 필요 없습니다." "Yellow"
  Line "         ([관리자 권한으로 실행] 을 고르거나 관리자 계정 암호를 넣지 마세요.)" "Yellow"
  Line "         트레이의 공문 도우미가 기안 창에 붙지 않던 PC 라면 컴퓨터를 먼저 다시 시작하세요." "Yellow"
  Line ("         (설치 파일: " + $root + ")") "DarkGray"
  Line "         (설치된 것은 없고, 이 PC 는 바뀐 것이 없습니다.)" "DarkGray"
  Gmh-Log ("다른 계정으로 실행되어 설치하지 않음: " + $who.User + " · 로그인 " + $who.SessionUser)
  Done 1
}
if ($Check) {
  Line ("  점검 통과: 이 PC 에 설치할 수 있습니다. (LanguageMode=" + $langMode + ", 스마트 앱 컨트롤=" + $(if ($null -eq $sacState) { "없음" } else { $sacState }) +
        ", 계정=" + $who.User + $(if ($who.Elevated) { ", 관리자 권한" } else { "" }) + ")") "Green"
  exit 0
}

try {
# 1) 실행 중인 공문 도우미 종료
Line "  [1/5] 실행 중인 공문 도우미를 종료합니다..."
if ($who.Elevated) { Line "        (관리자 권한으로 실행됐습니다. 설치는 그대로 하고, 도우미는 일반 권한으로 띄웁니다.)" "DarkGray" }
$stillUp = Gmh-StopRunning
if ($stillUp -gt 0) { Line "        [주의] 끝나지 않은 프로세스가 있습니다. 파일을 바꾸지 못할 수 있습니다." "Yellow" }
# 관리자 권한 · 다른 계정으로 떠 있어 여기서는 보이지 않는 도우미(v1.4.1 까지 '실행 중인데 탭이 안 뜬다' 의 원인).
# 그대로 두면 트레이 아이콘이 두 개가 되고, 같은 기안 창을 두고 새 도우미와 엇갈릴 수 있다.
$hidden = Gmh-HiddenHost
$hiddenStop = ""
if ($hidden) {
  Line "        관리자 권한으로 떠 있는 예전 공문 도우미가 있어 끕니다." "Yellow"
  Line "        Windows 확인 창이 뜨면 [예] 를 누르세요(관리자 암호를 모르면 [아니요] — 설치는 계속됩니다)." "Yellow"
  $hiddenStop = Gmh-StopElevated
  $hidden = Gmh-HiddenHost
  if ($hidden) { Line "        끄지 못했습니다. 설치가 끝난 뒤 컴퓨터를 다시 시작하면 사라집니다." "Yellow" }
  else { Line "        껐습니다." "DarkGray" }
}

# 2) 파일 설치
Line "  [2/5] 파일을 설치합니다..."
try {
  [void][System.IO.Directory]::CreateDirectory($GMH_DEST)
  Gmh-Log ("설치 시작 v" + $VER + " · 원본 " + $root + " · 계정 " + $who.User + $(if ($who.Elevated) { " · 관리자 권한" } else { "" }) +
           $(if ($hiddenStop) { " · 숨은 도우미 끄기 " + $hiddenStop + $(if ($hidden) { "(남음)" } else { "" }) } else { "" }))
  # 예전 판의 프로그램 파일을 지운다(설정·기록은 그대로). 여러 판이 섞여 오동작하는 것을 막는다.
  $leftOld = @(Gmh-RemoveProgramFiles)
  $count = Gmh-CopyTree $Source $GMH_DEST
  # v1.1 이 따로 붙이던 서식 모듈 — 이제 본체의 [작성] 탭에 들어 있다
  Remove-Item -LiteralPath (Join-Path $GMH_DEST "dist\gmh-tpl.js") -Force -ErrorAction SilentlyContinue
} catch {
  Line ("  [오류] 파일 설치 실패: " + $_.Exception.Message) "Red"
  Line "         · 트레이의 공문 도우미를 [종료] 하고, 기안 창과 브라우저를 닫은 뒤 다시 실행해 보세요." "Yellow"
  Line "         · 백신이 파일을 막았다면 백신 알림을 확인하고 예외로 등록한 뒤 다시 설치하세요." "Yellow"
  Gmh-Log ("파일 설치 실패: " + $_.Exception.Message)
  Done 1
}

# '인터넷에서 받음' 표시가 남았으면 지운다(내용으로 새로 썼으므로 보통은 없다)
$motwLeft = 0
try { $motwLeft = Gmh-ClearMotw $GMH_DEST } catch {}

# 설치된 파일이 온전한지 본다(백신이 지우거나 바꾸지 않았는지)
$bad = @(Gmh-VerifyCopy $Source $GMH_DEST)
if ($bad.Count -gt 0) {
  Line ("  [오류] 설치된 파일 " + $bad.Count + "개가 없거나 다릅니다: " + (($bad | Select-Object -First 4) -join ", ")) "Red"
  Line "         백신(V3 · 알약 · Windows 보안)이 파일을 지웠을 수 있습니다. 백신의 '검역소/차단 기록'을 확인해" "Yellow"
  Line ("         복원하고, " + $GMH_DEST + " 폴더를 예외로 등록한 뒤 설치.bat 을 다시 실행하세요.") "Yellow"
  Gmh-Log ("파일 확인 실패: " + ($bad -join ", "))
  Done 1
}
Line ("        파일 " + $count + "개 설치 · 확인 완료") "DarkGray"
if ($leftOld.Count -gt 0) { Line ("        (예전 파일 일부를 지우지 못해 덮어썼습니다: " + ($leftOld -join ", ") + ")") "DarkGray" }

# 예전(1.0) 시작 방식(바로가기 + run.vbs) 흔적 제거
Gmh-RemoveLegacyStartup

# 예전 판(1.1.1~1.2.0)이 만든 서명 인증서의 키를 조용히 지운다(확인 창 없음)
[void](Gmh-RemoveOldCert)
$oldRoot = Gmh-HasRootCert

# 3) 점검: 이 PC 에서 실제로 뜨는지 한 번 띄워 본다(창·트레이는 만들지 않는다)
Line "  [3/5] 이 PC 에서 동작하는지 점검합니다(10초쯤 걸릴 수 있습니다)..."
$firstHow = if (Gmh-PolicyLocked) { "command" } else { "file" }
$test = Gmh-SelfTest $firstHow
if (-not $test.ok -and -not $test.version) {
  # 아예 뜨지 못했다 — 다른 방식으로 한 번 더
  $otherHow = if ($firstHow -eq "file") { "command" } else { "file" }
  $test2 = Gmh-SelfTest $otherHow
  if ($test2.ok -or $test2.version) { $test = $test2 }
}
Gmh-Log ("점검: ok=" + $test.ok + " how=" + $test.how + " engine=" + $test.engine + " error=" + $test.error)
if (-not $test.ok) {
  Write-Host ""
  Line "  [오류] 설치는 했지만 이 PC 에서 공문 도우미가 뜨지 못합니다." "Red"
  Line ("         이유: " + $test.error) "Red"
  foreach ($l in (Gmh-LogTail 3)) { Line ("         기록: " + $l) "DarkGray" }
  Write-Host ""
  Line "         이렇게 해 보세요." "Yellow"
  Line "          1) 백신(V3 · 알약 · Windows 보안) 알림에 '차단'이 떴는지 보고, 떴다면" "Yellow"
  Line ("             " + $GMH_DEST + " 폴더를 예외(검사 제외)로 등록한 뒤 설치.bat 을 다시 실행") "Yellow"
  Line "          2) Windows 11 '스마트 앱 컨트롤'이 켜져 있으면 끈 뒤 다시 설치(사용법.txt 2번)" "Yellow"
  Line "          3) 그래도 안 되면 아래 두 파일을 제작자에게 보내 주세요." "Yellow"
  Line ("             " + (Join-Path $GMH_DEST "host.log")) "Yellow"
  Line ("             " + (Join-Path $GMH_DEST "install.log")) "Yellow"
  Write-Host ""
  Line ("         지우려면 " + (Join-Path $GMH_DEST "제거.bat") + " 를 실행하세요(이 폴더의 제거.bat 도 됩니다).") "DarkGray"
  Done 2
}
Gmh-SetLaunchHow $test.how
Line ("        점검 통과 (v" + $test.version + " · " + $test.engine + ")") "DarkGray"
if ($test.how -eq "command") { Line "        이 PC 는 스크립트 파일 실행이 막혀 있어, 내용을 읽어 실행하는 방식으로 등록합니다." "DarkGray" }
if ($test.engine -like "엔진 적재 실패*") {
  Line "        [주의] 첨부 분석 · 오타 검사 엔진을 불러오지 못했습니다. 나머지 기능은 동작합니다." "Yellow"
}

# 4) 자동 시작 등록(로그온 예약 작업)
Line "  [4/5] 자동 시작을 등록합니다(로그온 예약 작업)..."
$how = Gmh-RegisterTask
switch ($how) {
  "task"     { Line "        예약 작업으로 등록했습니다." "DarkGray" }
  "shortcut" { Line "        예약 작업이 막혀 시작 프로그램(바로가기)으로 등록했습니다." "Yellow" }
  default    { Line "        [경고] 자동 시작 등록에 실패했습니다. 컴퓨터를 켤 때 자동 실행되지 않습니다." "Yellow" }
}
# [설정]에서 '윈도우 시작 시 자동 실행'을 꺼 둔 PC 는 그대로 꺼 둔다
try {
  $sf = Join-Path $GMH_DEST "settings.json"
  if ($how -eq "task" -and (Test-Path -LiteralPath $sf)) {
    $sj = [System.IO.File]::ReadAllText($sf, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    if ($null -ne $sj.autoStart -and -not [bool]$sj.autoStart) {
      Disable-ScheduledTask -TaskName $GMH_TASK -ErrorAction SilentlyContinue | Out-Null
      Line "        (설정에서 자동 실행을 꺼 두셔서, 예약 작업은 '사용 안 함'으로 둡니다.)" "DarkGray"
    }
  }
} catch {}

# 5) 지금 실행하고, 정말 떴는지 확인한다
# (도우미는 언제나 이 계정의 일반 권한으로 띄운다 — gmh-common.ps1 의 Gmh-StartNow)
Line "  [5/5] 지금 실행합니다..."
$running = $false; $tray = "none"; $started = ""
if ($env:GMH_NOSTART) {
  Line "        (시험 설치: 실행하지 않습니다)" "DarkGray"
} else {
  $logPos = Gmh-LogSize
  $started = Gmh-StartNow
  $tray = Gmh-WaitTray 60 $logPos
  if ($tray -eq "none" -and $started -eq "task") {          # 예약 작업으로 안 뜨면 직접(관리자 권한 창이면 일반 권한 예약 작업으로)
    $started = Gmh-StartNow -SkipTask
    $tray = Gmh-WaitTray 40 $logPos
  }
  if ($tray -eq "busy") {
    # 보이지 않는 도우미가 이 계정의 이름을 잡고 있어 새 도우미가 그냥 끝났다 — 끄고 한 번 더 띄운다
    Line "        관리자 권한으로 떠 있는 공문 도우미가 새 도우미를 막고 있어 끕니다." "Yellow"
    Line "        Windows 확인 창이 뜨면 [예] 를 누르세요." "Yellow"
    $r = Gmh-StopElevated
    Gmh-Log ("막는 도우미 끄기: " + $r)
    if ($r -eq "done") { $logPos = Gmh-LogSize; $started = Gmh-StartNow; $tray = Gmh-WaitTray 60 $logPos }
  }
  $running = ($tray -eq "ok" -or $tray -eq "slow")
}
Gmh-Log ("설치 끝: 자동시작=" + $how + " 실행방식=" + $test.how + " 띄움=" + $started + " 트레이=" + $tray + " 차단표시남음=" + $motwLeft +
         $(if ($hidden) { " 숨은도우미=" + $hidden } else { "" }))

} catch {
  Write-Host ""
  Line ("  [오류] 설치하다 예상하지 못한 오류가 났습니다: " + $_.Exception.Message) "Red"
  Line ("         (" + $_.InvocationInfo.PositionMessage.Split("`n")[0].Trim() + ")") "DarkGray"
  Line "         설치.bat 을 한 번 더 실행해 보고, 같으면 이 화면을 찍어 제작자에게 보내 주세요." "Yellow"
  try { Gmh-Log ("예상 못 한 오류: " + $_.Exception.Message) } catch {}
  Done 3
}

Write-Host ""
Line "  --------------------------------------------"
if ($running -or $env:GMH_NOSTART) {
  Line ("   설치가 끝났습니다. (공문 도우미 v" + $VER + ")") "Green"
  Write-Host ""
  if ($running) { Line "   · 작업표시줄 오른쪽 아래 트레이에 파란 문서 아이콘이 있습니다(안 보이면 ∧ 를 누르세요)." "Green" }
  if ($hidden) {
    Write-Host ""
    Line "   ※ 관리자 권한으로 떠 있던 예전 공문 도우미 하나가 남아 있습니다(트레이 아이콘이 두 개일 수 있습니다)." "Yellow"
    Line "     새 도우미는 지금 동작합니다. 컴퓨터를 다시 시작하면 남은 것이 사라집니다." "Yellow"
  }
} else {
  Line "   설치는 됐지만 지금 실행되지 않았습니다." "Yellow"
  Write-Host ""
  if ($tray -eq "busy") {
    Line "   · 관리자 권한으로 떠 있는 공문 도우미 때문에 새 도우미가 뜨지 못했습니다." "Yellow"
    Line "   · 컴퓨터를 다시 시작하면 새 도우미가 저절로 뜹니다." "Yellow"
  } else {
    if ($tray -ne "none") { Line ("   · 이유: " + $tray) "Yellow" }
    Line "   · 로그아웃했다가 다시 로그인(또는 재부팅)하면 자동으로 뜹니다." "Yellow"
    Line "   · 그래도 트레이 아이콘이 없으면 사용법.txt 7번 '설치했는데 동작하지 않는다'를 보세요." "Yellow"
  }
  foreach ($l in (Gmh-LogTail 2)) { Line ("     기록: " + $l) "DarkGray" }
}
Line "   · K-에듀파인에서 기안 창을 열면 [공문도우미] 탭이 자동으로 나타납니다."
Line "     [작성] 탭에서 서식으로 쓰고, [검사] 탭에서 점검합니다."
Line "   · 컴퓨터를 켤 때마다 자동으로 실행됩니다."
Write-Host ""
if ($how -eq "none") {
  Line "   ※ 백신·보안 정책이 자동 시작 등록을 막았을 수 있습니다. 사용법.txt 7번을 보세요." "Yellow"
  Write-Host ""
}
if ($oldRoot) {
  Line "   ※ 예전 판이 넣은 인증서 이름이 '신뢰할 수 있는 루트' 목록에 남아 있습니다." "DarkGray"
  Line "     서명 키를 지웠으므로 효력이 없고, 제거.bat 을 쓰면 함께 지웁니다." "DarkGray"
  Write-Host ""
}
if ($who.Elevated) {
  Line "   ※ 다음부터는 설치.bat 을 그냥 두 번 눌러 실행하세요. 관리자 권한은 필요 없습니다." "DarkGray"
  Write-Host ""
}
Line "   브라우저 확장(데이터취합 · 장바구니 품의)은 따로 넣습니다. 사용법.txt 5번을 보세요."
Write-Host ""
Line ("   삭제하려면 " + (Join-Path $GMH_DEST "제거.bat") + " 를 실행하세요.")
Line "  --------------------------------------------"
Done 0
