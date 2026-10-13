# 공문 도우미 — 설치/제거 공용 함수
#  · 자동시작은 '로그온 예약 작업'(안 되면 시작 바로가기)으로 한다. VBScript(run.vbs)는 쓰지 않는다.
#  · 호스트를 띄우는 방식은 두 가지다.
#      file    : powershell -ExecutionPolicy RemoteSigned -File host.ps1  (기본. 정책을 끄는 Bypass 가 아니다)
#      command : 로더의 내용을 읽어 명령으로 실행한다(v1.0 과 같은 방식). 실행 정책이나
#                '인터넷에서 받음' 표시(차단)와 상관없이 돈다.
#    설치할 때 실제로 한 번 띄워 보고(점검), file 이 이 PC 에서 안 되면 command 로 등록한다.
#    정한 방식은 설치 폴더의 launch.txt 에 적어 둔다.
#  · 파일은 '내용으로' 새로 써서 설치한다. 그래서 받은 zip 을 [차단 해제] 하지 않고 풀었어도
#    설치된 파일에는 '인터넷에서 받음' 표시가 남지 않는다.
#  · 인증서를 만들거나 신뢰 저장소에 넣지 않는다. (v1.1.1~1.2.0 이 만든 인증서는 Gmh-RemoveOldCert 로 정리한다.)
#  · 시험용 환경 변수: GMH_DEST(설치 폴더) · GMH_TASK(예약 작업 이름). 둘 다 없으면 실제 설치 위치를 쓴다.

$GMH_TASK   = if ($env:GMH_TASK) { $env:GMH_TASK } else { "공문도우미" }      # 로그온 예약 작업 이름
$GMH_DEST   = if ($env:GMH_DEST) { $env:GMH_DEST } else { Join-Path $env:LOCALAPPDATA "GongmunHelper" }
$GMH_STARTUP = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"
$GMH_OLD_LNK = Join-Path $GMH_STARTUP ($GMH_TASK + ".lnk")   # 시작 바로가기(예전 1.0 방식 · 예약 작업이 막힐 때 대체)
$GMH_CERT_SUBJECT = "CN=Gongmun Helper Self-Signed"          # v1.1.1~1.2.0 이 만들던 서명 인증서(정리용)
$GMH_SANDBOX = [bool]($env:GMH_TASK -or $env:GMH_DEST)       # 시험 설치(실제 설치본의 프로세스는 건드리지 않는다)

# 프로그램 파일(다시 설치할 때 지우고 새로 쓴다). 여기 없는 것 — settings.json(설정) · update.json ·
# host.log · install.log · autologin.log · inbox\ — 은 사용자 것이라 그대로 둔다.
$GMH_PROGRAM_ITEMS = @("dist", "tools", "src", "data", "edge-ext", "gmh-common.ps1", "uninstall.ps1",
                       "uninstall.cmd", "제거.bat", "run.vbs", "launch.txt", "selftest.json")

function Gmh-HostPath { return (Join-Path $GMH_DEST "tools\host.ps1") }
function Gmh-HostDir  { return (Join-Path $GMH_DEST "tools") }   # 호스트는 이 폴더에서 돈다(로더도 GMH_HOME 을 넣는다)
function Gmh-Powershell { return (Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe") }

# 설치·제거 기록(문제를 물어볼 때 보낼 수 있게). 문서 내용은 없다.
function Gmh-Log([string]$t) {
  try {
    if (-not (Test-Path -LiteralPath $GMH_DEST)) { return }
    [System.IO.File]::AppendAllText((Join-Path $GMH_DEST "install.log"),
      ((Get-Date).ToString("yyyy-MM-dd HH:mm:ss ") + $t + "`r`n"), (New-Object System.Text.UTF8Encoding($true)))
  } catch {}
}

# 떠 있는 호스트 프로세스들(파워셸 + 창 없는 콘솔)
function Gmh-HostProcesses {
  try {
    return @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='conhost.exe'" -ErrorAction Stop |
      Where-Object {
        $c = [string]$_.CommandLine
        if (-not $c -or $_.ProcessId -eq $PID) { return $false }
        if (-not ($c -like '*host.ps1*-Tray*' -or ($c -like '*GMH_HOME*' -and $c -like '*-Tray*'))) { return $false }
        if ($GMH_SANDBOX) { return ($c -like ('*' + $GMH_DEST + '*')) }
        return $true
      })
  } catch { return @() }
}

# 실행 중인 호스트를 멈추고, 완전히 끝날 때까지(파일 잠금이 풀릴 때까지) 기다린다. 남은 개수를 돌려준다.
function Gmh-StopRunning([int]$WaitMs = 8000) {
  try {
    if (-not $GMH_SANDBOX -and (Get-Command Stop-ScheduledTask -ErrorAction SilentlyContinue)) {
      Stop-ScheduledTask -TaskName $GMH_TASK -ErrorAction SilentlyContinue
    }
  } catch {}
  foreach ($p in (Gmh-HostProcesses)) {
    try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
  }
  $until = (Get-Date).AddMilliseconds($WaitMs)
  while ((Get-Date) -lt $until) {
    if (@(Gmh-HostProcesses).Count -eq 0) { break }
    Start-Sleep -Milliseconds 250
  }
  return @(Gmh-HostProcesses).Count
}

function Gmh-IsRunning {
  return @(Gmh-HostProcesses | Where-Object { $_.Name -eq 'powershell.exe' }).Count
}

# 예전 방식(시작 바로가기 + run.vbs) 흔적을 지운다
function Gmh-RemoveLegacyStartup {
  try { if (Test-Path -LiteralPath $GMH_OLD_LNK) { Remove-Item -LiteralPath $GMH_OLD_LNK -Force -ErrorAction SilentlyContinue } } catch {}
  foreach ($v in @((Join-Path $GMH_DEST "run.vbs"), (Join-Path $GMH_DEST "app\run.vbs"))) {
    try { if (Test-Path -LiteralPath $v) { Remove-Item -LiteralPath $v -Force -ErrorAction SilentlyContinue } } catch {}
  }
}

# 실행 정책이 기관 정책(GPO)으로 AllSigned·Restricted 에 잠겨 스크립트 파일을 돌릴 수 없는가
function Gmh-PolicyLocked {
  foreach ($scope in @("MachinePolicy", "UserPolicy")) {
    try {
      $p = [string](Get-ExecutionPolicy -Scope $scope -ErrorAction Stop)
      if ($p -eq "AllSigned" -or $p -eq "Restricted") { return $true }
    } catch {}
  }
  return $false
}

# 호스트를 띄우는 방식: 설치 점검이 정해 launch.txt 에 적어 둔 것, 없으면 정책 잠금 여부로 정한다
function Gmh-LaunchHow {
  try {
    $f = Join-Path $GMH_DEST "launch.txt"
    if (Test-Path -LiteralPath $f) {
      $v = ([System.IO.File]::ReadAllText($f)).Trim()
      if ($v -eq "file" -or $v -eq "command") { return $v }
    }
  } catch {}
  if (Gmh-PolicyLocked) { return "command" }
  return "file"
}
function Gmh-SetLaunchHow([string]$How) {
  try { [System.IO.File]::WriteAllText((Join-Path $GMH_DEST "launch.txt"), $How, (New-Object System.Text.UTF8Encoding($false))) } catch {}
}

# 호스트 실행 인자(예약 작업·바로가기·즉시 실행·점검이 같은 것을 쓴다). $Mode 는 -Tray(상주) · -SelfTest(점검) · -Once
function Gmh-LaunchArgs([string]$Mode = "-Tray", [string]$How = "") {
  if (-not $How) { $How = Gmh-LaunchHow }
  if ($How -ne "command") {
    return '-NoProfile -ExecutionPolicy RemoteSigned -WindowStyle Hidden -File "' + (Gmh-HostPath) + '" ' + $Mode
  }
  # 로더의 내용을 명령으로 실행한다(v1.0 과 같은 방식). 명령에는 실행 정책·차단 표시가 걸리지 않는다.
  $d = $GMH_DEST.Replace("'", "''")
  $h = (Gmh-HostPath).Replace("'", "''")
  $cmd = '$env:GMH_HOME=''' + $d + '''; & ([scriptblock]::Create([IO.File]::ReadAllText(''' + $h + ''',[Text.Encoding]::UTF8))) ' + $Mode
  return '-NoProfile -WindowStyle Hidden -Command "' + $cmd + '"'
}

# 창 없이 띄우기: Windows 11 은 콘솔을 Windows Terminal 창으로 넘기는데, powershell 의 -WindowStyle Hidden 은
# 그 창을 숨기지 못한다(v1.2.1 까지 '번들 로드' 창이 떠 있던 이유). conhost --headless 는 창이 없는 콘솔이라
# 창도 Windows Terminal 도 생기지 않는다(Windows 10 1809=빌드 17763 이상). 그보다 오래된 Windows 는 powershell 을
# 바로 실행한다(콘솔 창이 잠깐 보였다가 숨는다).
function Gmh-Conhost {
  $c = Join-Path $env:WINDIR "System32\conhost.exe"
  if ([Environment]::OSVersion.Version.Build -ge 17763 -and (Test-Path $c)) { return $c }
  return $null
}

# 예약 작업·바로가기·즉시 실행이 쓰는 실행 파일과 인자: @(실행 파일, 인자)
function Gmh-LaunchCommand([string]$Mode = "-Tray", [string]$How = "", $Headless = $null) {
  $ps = Gmh-Powershell
  $arg = Gmh-LaunchArgs -Mode $Mode -How $How
  $c = if ($null -eq $Headless) { Gmh-Conhost } elseif ($Headless) { Join-Path $env:WINDIR "System32\conhost.exe" } else { $null }
  if ($c) { return @($c, ('--headless "' + $ps + '" ' + $arg)) }
  return @($ps, $arg)
}

# ── 파일 설치 ────────────────────────────────────────────────────────────────

# 예전 판의 프로그램 파일을 지운다(설정·기록은 둔다). 못 지운 것의 목록을 돌려준다.
function Gmh-RemoveProgramFiles {
  $left = @()
  foreach ($name in $GMH_PROGRAM_ITEMS) {
    $p = Join-Path $GMH_DEST $name
    if (-not (Test-Path -LiteralPath $p)) { continue }
    for ($try = 0; $try -lt 3; $try++) {
      try { Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop } catch {}
      if (-not (Test-Path -LiteralPath $p)) { break }
      Start-Sleep -Milliseconds 500
    }
    if (Test-Path -LiteralPath $p) { $left += $name }
  }
  return $left
}

# 폴더를 '내용으로' 새로 써서 옮긴다. 복사(CopyFile)는 '인터넷에서 받음' 표시(Zone.Identifier)까지 옮기지만
# 새로 쓴 파일에는 그 표시가 없다. 쓴 파일 수를 돌려주고, 못 쓰면 예외를 던진다.
function Gmh-CopyTree([string]$Src, [string]$Dst) {
  $n = 0
  $srcFull = ([System.IO.Path]::GetFullPath($Src)).TrimEnd('\')
  [void][System.IO.Directory]::CreateDirectory($Dst)
  foreach ($f in (Get-ChildItem -LiteralPath $srcFull -Recurse -File -Force)) {
    $rel = $f.FullName.Substring($srcFull.Length + 1)
    $to = Join-Path $Dst $rel
    [void][System.IO.Directory]::CreateDirectory((Split-Path -Parent $to))
    if (Test-Path -LiteralPath $to) {
      try { Remove-Item -LiteralPath $to -Force -ErrorAction Stop }
      catch { throw ("쓰던 파일을 바꾸지 못했습니다(다른 프로그램이 쓰는 중): " + $rel) }
    }
    [System.IO.File]::WriteAllBytes($to, [System.IO.File]::ReadAllBytes($f.FullName))
    try { [System.IO.File]::SetLastWriteTime($to, $f.LastWriteTime) } catch {}
    $n++
  }
  return $n
}

# 폴더 안 파일의 '인터넷에서 받음' 표시를 지운다. 지우지 못하고 남은 개수를 돌려준다.
function Gmh-ClearMotw([string]$Dir) {
  $left = 0
  foreach ($f in (Get-ChildItem -LiteralPath $Dir -Recurse -File -Force -ErrorAction SilentlyContinue)) {
    $has = $false
    try { $has = [bool](Get-Item -LiteralPath $f.FullName -Stream Zone.Identifier -ErrorAction SilentlyContinue) } catch {}
    if (-not $has) { continue }
    try { Unblock-File -LiteralPath $f.FullName -ErrorAction Stop } catch {}
    try { Remove-Item -LiteralPath $f.FullName -Stream Zone.Identifier -ErrorAction SilentlyContinue } catch {}
    try { if (Get-Item -LiteralPath $f.FullName -Stream Zone.Identifier -ErrorAction SilentlyContinue) { $left++ } } catch {}
  }
  return $left
}

# 설치된 파일이 설치 파일과 같은지(빠짐·크기·내용). 다른 것의 목록을 돌려준다.
function Gmh-VerifyCopy([string]$Src, [string]$Dst) {
  $bad = @()
  $srcFull = ([System.IO.Path]::GetFullPath($Src)).TrimEnd('\')
  $sha = [System.Security.Cryptography.SHA256]::Create()
  foreach ($f in (Get-ChildItem -LiteralPath $srcFull -Recurse -File -Force)) {
    $rel = $f.FullName.Substring($srcFull.Length + 1)
    $to = Join-Path $Dst $rel
    try {
      if (-not (Test-Path -LiteralPath $to)) { $bad += $rel; continue }
      $a = [System.IO.File]::ReadAllBytes($f.FullName); $b = [System.IO.File]::ReadAllBytes($to)
      if ($a.Length -ne $b.Length -or ([BitConverter]::ToString($sha.ComputeHash($a)) -ne [BitConverter]::ToString($sha.ComputeHash($b)))) { $bad += $rel }
    } catch { $bad += $rel }
  }
  return $bad
}

# ── 설치 점검 ────────────────────────────────────────────────────────────────

# 호스트를 실제로(예약 작업과 같은 방법으로) 한 번 띄워 본다. 창·트레이는 만들지 않고 결과만 적고 끝난다.
# 돌려주는 것: @{ ok; how; error; version; engine; ... }
function Gmh-SelfTest([string]$How, [int]$TimeoutSec = 60) {
  $res = Join-Path $GMH_DEST "selftest.json"
  try { if (Test-Path -LiteralPath $res) { Remove-Item -LiteralPath $res -Force -ErrorAction SilentlyContinue } } catch {}
  $cmd = Gmh-LaunchCommand -Mode "-SelfTest" -How $How
  $code = $null
  try {
    $p = Start-Process -FilePath $cmd[0] -ArgumentList $cmd[1] -WindowStyle Hidden -WorkingDirectory (Gmh-HostDir) -PassThru
    if (-not $p.WaitForExit($TimeoutSec * 1000)) {
      try { $p.Kill() } catch {}
      return @{ ok = $false; how = $How; error = ("점검이 " + $TimeoutSec + "초 안에 끝나지 않았습니다(백신이 검사 중이거나 막았을 수 있습니다).") }
    }
    try { $code = $p.ExitCode } catch {}
  } catch {
    return @{ ok = $false; how = $How; error = ("호스트를 실행하지 못했습니다: " + $_.Exception.Message) }
  }
  if (Test-Path -LiteralPath $res) {
    try {
      $j = [System.IO.File]::ReadAllText($res, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
      return @{ ok = [bool]$j.ok; how = $How; error = [string]$j.error; version = [string]$j.version; rcver = [string]$j.rcver
                engine = [string]$j.engine; spell = [bool]$j.spell; settings = [bool]$j.settings; stage = [string]$j.stage }
    } catch {
      return @{ ok = $false; how = $How; error = "점검 결과 파일을 읽지 못했습니다." }
    }
  }
  $why = if ($How -eq "file") { "스크립트 파일 실행이 막혔습니다(실행 정책 · 차단 표시 · 백신)." } else { "PowerShell 명령 실행이 막혔습니다(백신 · 기관 보안 정책)." }
  return @{ ok = $false; how = $How; error = ($why + " 종료 코드 " + $code) }
}

# ── 예전 인증서 정리 ─────────────────────────────────────────────────────────

# v1.1.1~1.2.0 이 만든 서명 인증서를 정리한다. 지운 개수를 돌려준다.
#  · 개인 키가 든 '개인' 저장소와 '신뢰할 수 있는 게시자'에서는 조용히 지운다(확인 창 없음).
#    키가 없어지면 '신뢰할 수 있는 루트'에 이름이 남아도 아무것도 서명할 수 없어 효력이 없다.
#  · 루트에서 지우면 Windows 가 확인 창을 띄우므로 제거(제거.bat)할 때만 한다(-IncludeRoot).
function Gmh-RemoveOldCert([switch]$IncludeRoot) {
  $n = 0
  $stores = @("My", "TrustedPublisher")
  if ($IncludeRoot) { $stores += "Root" }
  foreach ($store in $stores) {
    try {
      Get-ChildItem ("Cert:\CurrentUser\" + $store) -ErrorAction SilentlyContinue |
        Where-Object { $_.Subject -eq $GMH_CERT_SUBJECT } |
        ForEach-Object {
          try {
            if ($store -eq "My") { Remove-Item $_.PSPath -DeleteKey -Force -ErrorAction Stop }
            else { Remove-Item $_.PSPath -Force -ErrorAction Stop }
            $n++
          } catch {}
        }
    } catch {}
  }
  return $n
}
function Gmh-HasRootCert {
  try { return [bool](Get-ChildItem Cert:\CurrentUser\Root -ErrorAction SilentlyContinue | Where-Object { $_.Subject -eq $GMH_CERT_SUBJECT }) }
  catch { return $false }
}

# ── 자동 시작 ────────────────────────────────────────────────────────────────

# 로그온 예약 작업 등록 — 로그인하면 호스트가 조용히 뜬다(관리자 권한 불필요, 현재 사용자만)
function Gmh-RegisterTask {
  $cmd = Gmh-LaunchCommand
  $exe = $cmd[0]; $arg = $cmd[1]
  try {
    if (Get-Command Register-ScheduledTask -ErrorAction SilentlyContinue) {
      $action  = New-ScheduledTaskAction -Execute $exe -Argument $arg -WorkingDirectory (Gmh-HostDir)
      $trigger = New-ScheduledTaskTrigger -AtLogOn -User ([Security.Principal.WindowsIdentity]::GetCurrent().Name)
      $set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
      try { $set.ExecutionTimeLimit = "PT0S" } catch {}   # 시간 제한 없음(상주)
      Register-ScheduledTask -TaskName $GMH_TASK -Action $action -Trigger $trigger -Settings $set -Force -ErrorAction Stop | Out-Null
      # 예약 작업이 됐으면 예전 시작 바로가기는 필요 없다(둘 다 있으면 두 번 뜨려 한다)
      try { if (Test-Path -LiteralPath $GMH_OLD_LNK) { Remove-Item -LiteralPath $GMH_OLD_LNK -Force -ErrorAction SilentlyContinue } } catch {}
      return "task"
    }
  } catch {}
  # 예약 작업이 안 되면 '시작 바로가기'로 대체(VBS 없이 실행 파일을 직접 가리킴)
  try {
    New-Item -ItemType Directory -Force -Path $GMH_STARTUP | Out-Null
    $sh = New-Object -ComObject WScript.Shell
    $s = $sh.CreateShortcut($GMH_OLD_LNK)
    $s.TargetPath = $exe
    $s.Arguments = $arg
    $s.WorkingDirectory = (Gmh-HostDir)
    $s.WindowStyle = 7                                   # 최소화로 시작
    $s.Description = "공문 도우미"
    $s.Save()
    return "shortcut"
  } catch {}
  return "none"
}

function Gmh-UnregisterTask {
  try {
    if (Get-Command Unregister-ScheduledTask -ErrorAction SilentlyContinue) {
      Unregister-ScheduledTask -TaskName $GMH_TASK -Confirm:$false -ErrorAction SilentlyContinue
    }
  } catch {}
  try { & schtasks.exe /Delete /TN $GMH_TASK /F 2>$null | Out-Null } catch {}
}

function Gmh-TaskExists {
  try {
    if (Get-Command Get-ScheduledTask -ErrorAction SilentlyContinue) {
      return [bool](Get-ScheduledTask -TaskName $GMH_TASK -ErrorAction SilentlyContinue)
    }
  } catch {}
  return $false
}

# 지금 띄운다. 예약 작업으로 먼저(로그인 때와 똑같은 길), 안 되면 직접.
function Gmh-StartNow {
  try {
    if ((Gmh-TaskExists) -and (Get-Command Start-ScheduledTask -ErrorAction SilentlyContinue)) {
      Start-ScheduledTask -TaskName $GMH_TASK -ErrorAction Stop
      return $true
    }
  } catch {}
  return (Gmh-StartDirect)
}
function Gmh-StartDirect {
  try {
    $cmd = Gmh-LaunchCommand
    Start-Process -FilePath $cmd[0] -ArgumentList $cmd[1] -WindowStyle Hidden -WorkingDirectory (Gmh-HostDir)
    return $true
  } catch { return $false }
}

# host.log 의 지금 크기(이 뒤에 붙는 줄만 보려고)
function Gmh-LogSize {
  try { $f = Join-Path $GMH_DEST "host.log"; if (Test-Path -LiteralPath $f) { return (Get-Item -LiteralPath $f).Length } } catch {}
  return 0
}

# 트레이가 실제로 준비될 때까지 기다린다. host.log 에서 $LogPos 뒤에 새로 붙은 줄을 본다.
#   "ok"     트레이 준비 완료
#   "slow"   프로세스는 떠 있는데 아직 준비 줄이 없다(느린 PC · 백신 검사 중)
#   "none"   프로세스가 없다
#   그 밖    host.log 에 적힌 오류 줄
function Gmh-WaitTray([int]$Seconds = 40, [long]$LogPos = 0) {
  $f = Join-Path $GMH_DEST "host.log"
  $until = (Get-Date).AddSeconds($Seconds)
  $seen = $false
  while ((Get-Date) -lt $until) {
    try {
      if (Test-Path -LiteralPath $f) {
        $fs = New-Object System.IO.FileStream($f, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
        try {
          if ($fs.Length -gt $LogPos) {
            [void]$fs.Seek($LogPos, [System.IO.SeekOrigin]::Begin)
            $sr = New-Object System.IO.StreamReader($fs, [System.Text.Encoding]::UTF8)
            $new = $sr.ReadToEnd()
            if ($new -match '트레이 준비 완료' -or $new -match '이미 실행 중') { return "ok" }
            $m = [regex]::Match($new, '치명 오류[^
]*')
            if ($m.Success) { return $m.Value }
          }
        } finally { $fs.Close() }
      }
    } catch {}
    if ((Gmh-IsRunning) -gt 0) { $seen = $true }
    elseif ($seen) { return "none" }                    # 떴다가 사라졌다
    Start-Sleep -Milliseconds 500
  }
  if ((Gmh-IsRunning) -gt 0) { return "slow" }
  return "none"
}

# host.log 의 마지막 몇 줄(문제 안내용)
function Gmh-LogTail([int]$Lines = 4) {
  try {
    $f = Join-Path $GMH_DEST "host.log"
    if (Test-Path -LiteralPath $f) { return @(Get-Content -LiteralPath $f -Encoding UTF8 -Tail $Lines) }
  } catch {}
  return @()
}
