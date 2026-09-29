# 공문 도우미 — 설치/제거 공용 함수
#  · 자동시작은 '로그온 예약 작업'으로 한다(Windows 11 표준). VBScript(run.vbs)·시작 바로가기 방식은 버린다.
#  · 실행정책 우회·스크립트 eval·창 숨김 체인을 쓰지 않는다(백신·SmartScreen 오탐을 줄이기 위함).
#  · 스크립트에 자체 서명을 붙인다(선택·실패해도 설치는 계속). 자체 서명은 이 사용자 저장소 안에서만 신뢰된다.

$GMH_TASK   = "공문도우미"                                   # 로그온 예약 작업 이름
$GMH_DEST   = if ($env:GMH_DEST) { $env:GMH_DEST } else { Join-Path $env:LOCALAPPDATA "GongmunHelper" }
$GMH_STARTUP = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"
$GMH_OLD_LNK = Join-Path $GMH_STARTUP "공문도우미.lnk"       # 예전(1.0) 방식의 시작 바로가기
$GMH_CERT_SUBJECT = "CN=Gongmun Helper Self-Signed"

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

# 자체 서명 인증서 — 있으면 재사용, 없으면 만들어 이 사용자 저장소에서 신뢰시킨다. 반환: 인증서 또는 $null
function Gmh-EnsureCert {
  try {
    $existing = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert -ErrorAction SilentlyContinue |
                Where-Object { $_.Subject -eq $GMH_CERT_SUBJECT } | Select-Object -First 1
    if ($existing) { return $existing }
    if (-not (Get-Command New-SelfSignedCertificate -ErrorAction SilentlyContinue)) { return $null }
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject $GMH_CERT_SUBJECT `
              -CertStoreLocation Cert:\CurrentUser\My -KeyUsage DigitalSignature `
              -KeyExportPolicy NonExportable -NotAfter (Get-Date).AddYears(10) -ErrorAction Stop
    # Authenticode 서명이 '유효'하려면 서명자 인증서가 신뢰 루트·게시자에 있어야 한다(이 사용자 범위에만).
    $tmp = Join-Path $env:TEMP ("gmh-cert-" + [guid]::NewGuid().ToString("N") + ".cer")
    Export-Certificate -Cert $cert -FilePath $tmp -Force | Out-Null
    Import-Certificate -FilePath $tmp -CertStoreLocation Cert:\CurrentUser\Root | Out-Null
    Import-Certificate -FilePath $tmp -CertStoreLocation Cert:\CurrentUser\TrustedPublisher | Out-Null
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    return $cert
  } catch { return $null }
}

# 인증서를 세 저장소에서 지운다(제거 시)
function Gmh-RemoveCert {
  foreach ($store in @("My", "Root", "TrustedPublisher")) {
    try {
      Get-ChildItem ("Cert:\CurrentUser\" + $store) -ErrorAction SilentlyContinue |
        Where-Object { $_.Subject -eq $GMH_CERT_SUBJECT } |
        ForEach-Object { Remove-Item $_.PSPath -Force -ErrorAction SilentlyContinue }
    } catch {}
  }
}

# 배포된 .ps1 에 서명(있는 것만, 실패해도 무시)
function Gmh-SignScripts($cert) {
  if (-not $cert) { return 0 }
  $n = 0
  foreach ($rel in @("tools\host.ps1", "tools\settings-lib.ps1")) {
    $p = Join-Path $GMH_DEST $rel
    if (Test-Path $p) {
      try {
        $r = Set-AuthenticodeSignature -FilePath $p -Certificate $cert -HashAlgorithm SHA256 -ErrorAction Stop
        if ($r.Status -eq "Valid") { $n++ }
      } catch {}
    }
  }
  return $n
}

# 로그온 예약 작업 등록 — 로그인하면 호스트가 조용히 뜬다(관리자 권한 불필요, 현재 사용자만)
function Gmh-RegisterTask {
  $hostPath = Gmh-HostPath
  $ps = Gmh-Powershell
  $arg = '-NoProfile -WindowStyle Hidden -File "' + $hostPath + '" -Tray'
  try {
    if (Get-Command Register-ScheduledTask -ErrorAction SilentlyContinue) {
      $action  = New-ScheduledTaskAction -Execute $ps -Argument $arg -WorkingDirectory (Gmh-HostDir)
      $trigger = New-ScheduledTaskTrigger -AtLogOn
      $set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
      try { $set.ExecutionTimeLimit = "PT0S" } catch {}   # 시간 제한 없음(상주)
      Register-ScheduledTask -TaskName $GMH_TASK -Action $action -Trigger $trigger -Settings $set -Force -ErrorAction Stop | Out-Null
      return "task"
    }
  } catch {}
  # 예약 작업이 안 되면 schtasks 로 시도
  try {
    $tr = '"' + $ps + '" ' + $arg
    & schtasks.exe /Create /TN $GMH_TASK /TR $tr /SC ONLOGON /F /RL LIMITED 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { return "schtasks" }
  } catch {}
  # 그래도 안 되면 '시작 바로가기'로 대체(단, VBS·우회 없이 powershell 을 직접 가리킴)
  try {
    New-Item -ItemType Directory -Force -Path $GMH_STARTUP | Out-Null
    $sh = New-Object -ComObject WScript.Shell
    $s = $sh.CreateShortcut($GMH_OLD_LNK)
    $s.TargetPath = $ps
    $s.Arguments = $arg
    $s.WorkingDirectory = (Gmh-HostDir)
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
    Start-Process (Gmh-Powershell) -ArgumentList ('-NoProfile -WindowStyle Hidden -File "' + (Gmh-HostPath) + '" -Tray') -WindowStyle Hidden -WorkingDirectory (Gmh-HostDir)
    return $true
  } catch { return $false }
}

function Gmh-IsRunning {
  return @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
           Where-Object { $_.CommandLine -like '*host.ps1*-Tray*' -or $_.CommandLine -like '*GMH_HOME*' }).Count
}
