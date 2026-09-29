# 공문 도우미 — 설치/제거 공용 함수
#  · 자동시작은 '로그온 예약 작업'(안 되면 시작 바로가기)으로 한다. VBScript(run.vbs)는 쓰지 않는다.
#  · 호스트는 이 프로세스에만 실행 정책 RemoteSigned 를 주어 실행한다(-ExecutionPolicy RemoteSigned).
#    Windows 기본값(Restricted)인 PC 에서도 뜨게 하려는 것으로, 정책을 끄는 Bypass 가 아니다.
#  · 기관 정책(GPO)으로 실행 정책이 AllSigned·Restricted 로 잠긴 PC 는 스크립트 파일을 돌릴 수 없으므로,
#    그런 PC 에서만 v1.0 과 같은 방식(스크립트 내용을 명령으로 실행)으로 띄운다.
#  · 인증서를 만들거나 신뢰 저장소에 넣지 않는다. (v1.1.1~1.2.0 은 서명용 인증서를 '신뢰할 수 있는 루트'에
#    넣으려다 Windows 보안 경고를 띄웠다. 그때 만든 인증서는 아래 Gmh-RemoveOldCert 로 정리한다.)

$GMH_TASK   = "공문도우미"                                   # 로그온 예약 작업 이름
$GMH_DEST   = if ($env:GMH_DEST) { $env:GMH_DEST } else { Join-Path $env:LOCALAPPDATA "GongmunHelper" }
$GMH_STARTUP = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"
$GMH_OLD_LNK = Join-Path $GMH_STARTUP "공문도우미.lnk"       # 시작 바로가기(예전 1.0 방식 · 예약 작업이 막힐 때 대체)
$GMH_CERT_SUBJECT = "CN=Gongmun Helper Self-Signed"          # v1.1.1~1.2.0 이 만들던 서명 인증서(정리용)

function Gmh-HostPath { return (Join-Path $GMH_DEST "tools\host.ps1") }
function Gmh-HostDir  { return (Join-Path $GMH_DEST "tools") }   # 호스트는 이 폴더에서 돈다(로더도 GMH_HOME 을 넣는다)
function Gmh-Powershell { return (Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe") }

# 실행 중인 호스트를 멈춘다
function Gmh-StopRunning {
  try {
    Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
      Where-Object { $_.CommandLine -like '*host.ps1*-Tray*' -or $_.CommandLine -like '*GMH_HOME*' } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  } catch {}
}

# 예전 방식(시작 바로가기 + run.vbs) 흔적을 지운다
function Gmh-RemoveLegacyStartup {
  try { if (Test-Path $GMH_OLD_LNK) { Remove-Item $GMH_OLD_LNK -Force -ErrorAction SilentlyContinue } } catch {}
  foreach ($v in @((Join-Path $GMH_DEST "run.vbs"), (Join-Path $GMH_DEST "app\run.vbs"))) {
    try { if (Test-Path $v) { Remove-Item $v -Force -ErrorAction SilentlyContinue } } catch {}
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

# 호스트 실행 인자(예약 작업·바로가기·즉시 실행이 같은 것을 쓴다). $Mode 는 -Tray(상주) 또는 -Once(시험)
function Gmh-LaunchArgs([string]$Mode = "-Tray", $Locked = $null) {
  if ($null -eq $Locked) { $Locked = Gmh-PolicyLocked }
  if (-not $Locked) {
    return '-NoProfile -ExecutionPolicy RemoteSigned -WindowStyle Hidden -File "' + (Gmh-HostPath) + '" ' + $Mode
  }
  # 기관 정책으로 잠긴 PC: 로더의 내용을 명령으로 실행한다(v1.0 과 같은 방식). 명령에는 실행 정책이 걸리지 않는다.
  $d = $GMH_DEST.Replace("'", "''")
  $h = (Gmh-HostPath).Replace("'", "''")
  $cmd = '$env:GMH_HOME=''' + $d + '''; & ([scriptblock]::Create([IO.File]::ReadAllText(''' + $h + ''',[Text.Encoding]::UTF8))) ' + $Mode
  return '-NoProfile -WindowStyle Hidden -Command "' + $cmd + '"'
}

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

# 로그온 예약 작업 등록 — 로그인하면 호스트가 조용히 뜬다(관리자 권한 불필요, 현재 사용자만)
function Gmh-RegisterTask {
  $ps = Gmh-Powershell
  $arg = Gmh-LaunchArgs
  try {
    if (Get-Command Register-ScheduledTask -ErrorAction SilentlyContinue) {
      $action  = New-ScheduledTaskAction -Execute $ps -Argument $arg -WorkingDirectory (Gmh-HostDir)
      $trigger = New-ScheduledTaskTrigger -AtLogOn -User ([Security.Principal.WindowsIdentity]::GetCurrent().Name)
      $set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
      try { $set.ExecutionTimeLimit = "PT0S" } catch {}   # 시간 제한 없음(상주)
      Register-ScheduledTask -TaskName $GMH_TASK -Action $action -Trigger $trigger -Settings $set -Force -ErrorAction Stop | Out-Null
      return "task"
    }
  } catch {}
  # 예약 작업이 안 되면 '시작 바로가기'로 대체(VBS 없이 powershell 을 직접 가리킴)
  try {
    New-Item -ItemType Directory -Force -Path $GMH_STARTUP | Out-Null
    $sh = New-Object -ComObject WScript.Shell
    $s = $sh.CreateShortcut($GMH_OLD_LNK)
    $s.TargetPath = $ps
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

function Gmh-StartNow {
  try {
    if (Get-Command Start-ScheduledTask -ErrorAction SilentlyContinue) {
      Start-ScheduledTask -TaskName $GMH_TASK -ErrorAction Stop
      return $true
    }
  } catch {}
  try {
    Start-Process (Gmh-Powershell) -ArgumentList (Gmh-LaunchArgs) -WindowStyle Hidden -WorkingDirectory (Gmh-HostDir)
    return $true
  } catch { return $false }
}

function Gmh-IsRunning {
  return @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
           Where-Object { $_.CommandLine -like '*host.ps1*-Tray*' -or $_.CommandLine -like '*GMH_HOME*' }).Count
}
