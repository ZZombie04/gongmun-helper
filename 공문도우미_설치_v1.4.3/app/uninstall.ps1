# 공문 도우미 제거
#  · 이 파일 하나로 끝까지 지운다(다른 파일에 기대지 않는다). 설치가 반쯤 되다 만 PC, 파일이 일부 없어진 PC,
#    예전 판(1.0~1.3)이 깔린 PC 에서도 그대로 쓸 수 있다. 받은 설치 폴더의 제거.bat 으로도 실행된다.
#  · 하는 일: 실행 중인 도우미 종료 → 자동 시작(예약 작업·시작 바로가기) 삭제 → 예전 인증서 정리 →
#            설치 폴더 삭제 → 업데이트 때 내려받은 임시 폴더 삭제 → 남은 것이 있으면 알려 줌
#  · 관리자 권한 · 다른 계정으로 떠 있어 여기서 보이지 않는 도우미는 이름(뮤텍스)으로 알아내고,
#    Windows 확인 창을 거쳐 끈다. 못 끄면 컴퓨터를 다시 시작하라고 알린다.
#  · 시험용 환경 변수: GMH_DEST(설치 폴더) · GMH_TASK(예약 작업 이름) · GMH_MUTEX · GMH_LEGACY_MUTEX(도우미 이름) ·
#    GMH_NO_ELEVATE(확인 창을 띄우지 않음)
param([switch]$Silent, [switch]$Yes)
$ErrorActionPreference = "Continue"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { chcp 65001 > $null } catch {}

# 제거.bat 이 '제거 스크립트가 실제로 시작됐는지' 알 수 있게 표시를 남긴다
if ($env:GMH_MARK) { try { [System.IO.File]::WriteAllText($env:GMH_MARK, "started") } catch {} }

$TASK    = if ($env:GMH_TASK) { $env:GMH_TASK } else { "공문도우미" }
$TASKS   = @($TASK, ($TASK + "-시작"))      # 로그온 예약 작업 · 관리자 권한 창에서 일반 권한으로 띄울 때 잠깐 쓰는 작업
$DEST    = if ($env:GMH_DEST) { $env:GMH_DEST } else { Join-Path $env:LOCALAPPDATA "GongmunHelper" }
$SANDBOX = [bool]($env:GMH_TASK -or $env:GMH_DEST)
$LNK     = Join-Path (Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup") ($TASK + ".lnk")
$CERT    = "CN=Gongmun Helper Self-Signed"

function Line($t, $c = "Gray") { Write-Host $t -ForegroundColor $c }
function Done([int]$code) {
  if (-not $Silent) { Write-Host ""; Read-Host "  엔터를 누르면 닫힙니다" | Out-Null }
  exit $code
}

$SESS = -1
try { $SESS = (Get-Process -Id $PID).SessionId } catch {}
# 이 화면(세션)의 도우미만 센다(관리자 권한 창에서는 다른 사람 로그인의 도우미도 보이는데, 그것은 끄지 않는다)
function HostProcesses {
  try {
    return @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='conhost.exe' OR Name='wscript.exe'" -ErrorAction Stop |
      Where-Object {
        $c = [string]$_.CommandLine
        if (-not $c -or $_.ProcessId -eq $PID) { return $false }
        if ($SESS -ge 0 -and $_.SessionId -ne $SESS) { return $false }
        if (-not ($c -like '*host.ps1*-Tray*' -or ($c -like '*GMH_HOME*' -and $c -like '*-Tray*') -or $c -like '*GongmunHelper*run.vbs*')) { return $false }
        if ($SANDBOX) { return ($c -like ('*' + $DEST + '*')) }
        return $true
      })
  } catch { return @() }
}

# 일반 권한으로는 보이지 않는(관리자 권한 · 다른 계정으로 뜬) 도우미가 이 화면에 있는가 — 이름(뮤텍스)으로 본다.
#   v1.4.2 부터: 이 세션 · 이 계정마다 하나 · v1.4.1 까지: PC 전체에서 하나(다른 사람 로그인의 것일 수도 있어,
#   이 세션에 명령줄을 읽을 수 없는 PowerShell 이 있을 때만 이 화면의 것으로 본다)
function MutexExists([string]$Name) {
  if (-not $Name) { return $false }
  $m = $null
  try { $ok = [System.Threading.Mutex]::TryOpenExisting($Name, [ref]$m); if ($m) { $m.Dispose() }; return [bool]$ok }
  catch [System.UnauthorizedAccessException] { return $true }
  catch { return $false }
}
function HiddenHost {
  $ours = if ($env:GMH_MUTEX) { $env:GMH_MUTEX } else { "Local\GongmunHelperTray-" + [Security.Principal.WindowsIdentity]::GetCurrent().User.Value }
  if (MutexExists $ours) { return "ours" }
  $legacy = if ($env:GMH_LEGACY_MUTEX) { $env:GMH_LEGACY_MUTEX } elseif ($SANDBOX) { "" } else { "Global\GongmunHelperTray" }
  if ($legacy -and (MutexExists $legacy)) {
    if ($env:GMH_LEGACY_MUTEX) { return "legacy" }
    try {
      $n = @(Get-CimInstance Win32_Process -Filter ("Name='powershell.exe' AND SessionId=" + $SESS) -ErrorAction Stop |
             Where-Object { $_.ProcessId -ne $PID -and -not $_.CommandLine }).Count
      if ($n -gt 0) { return "legacy" }
    } catch {}
  }
  return ""
}
# Windows 확인 창(UAC)을 거쳐, 이 화면(세션)에 관리자 권한 · 다른 계정으로 떠 있는 도우미를 끈다
# 확인 창 뒤에서 도는 PowerShell 에 넘길 인자(설치의 gmh-common.ps1 Gmh-StopArgs 와 같다). 시험 제거에서는 그 폴더의 도우미만.
function StopArgs {
  $only = $(if ($SANDBOX) { " -and [string]`$_.CommandLine -like '*" + $DEST.Replace("'", "''") + "*'" } else { "" })
  $cmd = "Get-CimInstance Win32_Process -Filter 'SessionId=" + [Math]::Max(0, $SESS) + "' | " +
         'Where-Object { $_.ProcessId -ne $PID -and @(''powershell.exe'',''conhost.exe'',''wscript.exe'') -contains $_.Name -and ' +
         '[string]$_.CommandLine -match ''host\.ps1.*-Tray|GMH_HOME.*-Tray|GongmunHelper.*run\.vbs''' + $only + ' } | ' +
         'ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }'
  return ('-NoProfile -WindowStyle Hidden -Command "' + $cmd + '"')
}
function StopElevated {
  if ($SANDBOX -or $env:GMH_NO_ELEVATE) { return "skip" }
  $ps = Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe"
  try {
    $p = Start-Process -FilePath $ps -ArgumentList (StopArgs) -Verb RunAs -WindowStyle Hidden -PassThru -ErrorAction Stop
    [void]$p.WaitForExit(30000)
    Start-Sleep -Milliseconds 800
    return "done"
  } catch { return "cancel" }
}

# 열려 있는 K-에듀파인 기안 창에서, 그 사이트에 저장해 둔 도우미 설정(결재·수신 프리셋·패널 위치)과 화면을 지운다.
# 창을 닫아 두었으면 지울 창이 없지만, 다음에 설치할 때 '설치 번호'가 달라 자동으로 새로 시작하므로 어차피 깨끗하다.
# 지운 창 수를 돌려준다. 어떤 오류도 제거를 막지 않는다(전부 try/catch).
$GMH_WIPE_JS = "try{var g=window.__GMH__;if(g){if(g._ui)g._ui.boot=function(){};if(g.wipe)g.wipe();else if(g.teardown)g.teardown();}}catch(e){}" +
  "try{window.__RCVR__&&window.__RCVR__.teardown&&window.__RCVR__.teardown();}catch(e){}" +
  "try{window.localStorage.removeItem('GMH_SETTINGS_V1');window.localStorage.removeItem('GMH_SETTINGS_V1_probe');}catch(e){}" +
  "try{document.cookie='GMH_SETTINGS_V1=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';}catch(e){}" +
  "try{var h=document.documentElement;h.removeAttribute('data-gmh-installed');h.removeAttribute('data-gmh-build');h.removeAttribute('data-gmh-install');h.removeAttribute('data-rcver-installed');}catch(e){}" +
  "try{window.__GMH_INSTALLED__=false;window.__RCVR_INSTALLED__=false;}catch(e){}"
function ClearPageData {
  $n = 0
  try {
    if (-not ("GmhUninIE" -as [type])) {
      Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class GmhUninIE {
  public delegate bool EnumProc(IntPtr h, IntPtr p);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr p);
  [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr h, EnumProc cb, IntPtr p);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern uint RegisterWindowMessage(string s);
  [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr h, uint msg, IntPtr wp, IntPtr lp, uint flags, uint timeout, out IntPtr res);
  [DllImport("oleacc.dll", PreserveSig=false)]
  [return: MarshalAs(UnmanagedType.Interface)]
  public static extern object ObjectFromLresult(IntPtr lResult, ref Guid riid, IntPtr wParam);
  static string ClassOf(IntPtr h){ var sb=new StringBuilder(256); GetClassName(h,sb,256); return sb.ToString(); }
  public static List<IntPtr> FindServers(){
    var tops=new List<IntPtr>(); EnumWindows(delegate(IntPtr h, IntPtr p){ tops.Add(h); return true; }, IntPtr.Zero);
    var res=new List<IntPtr>();
    foreach(var t in tops){
      if(ClassOf(t)=="Internet Explorer_Server" && !res.Contains(t)) res.Add(t);
      var local=new List<IntPtr>(); EnumChildWindows(t, delegate(IntPtr c, IntPtr p){ local.Add(c); return true; }, IntPtr.Zero);
      foreach(var k in local){ if(ClassOf(k)=="Internet Explorer_Server" && !res.Contains(k)) res.Add(k); }
    }
    return res;
  }
  public static object GetDocument(IntPtr h){
    uint msg=RegisterWindowMessage("WM_HTML_GETOBJECT"); IntPtr r;
    SendMessageTimeout(h, msg, IntPtr.Zero, IntPtr.Zero, 2, 4000, out r);
    if(r==IntPtr.Zero) return null;
    Guid iid=new Guid("332C4425-26CB-11D0-B483-00C04FD90119");
    return ObjectFromLresult(r, ref iid, IntPtr.Zero);
  }
}
"@
    }
    foreach ($h in [GmhUninIE]::FindServers()) {
      $doc = $null
      try { $doc = [GmhUninIE]::GetDocument($h) } catch { continue }
      if ($null -eq $doc) { continue }
      $url = ""
      try { $url = [string]$doc.url } catch { continue }
      if ($url -notlike "*klef.goe.go.kr*") { continue }
      try { $doc.parentWindow.execScript($GMH_WIPE_JS, "JavaScript") | Out-Null; $n++ } catch {}
    }
  } catch {}
  return $n
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
# 열려 있는 K-에듀파인 창에서 도우미와 저장된 설정(프리셋·패널 위치)을 지운다(설치하기 전으로 되돌리기)
$pageWiped = ClearPageData
if ($pageWiped -gt 0) { Line ("        열려 있는 K-에듀파인 창 " + $pageWiped + "개의 저장된 설정을 지웠습니다.") "DarkGray" }
$hidden = HiddenHost
if ($hidden) {
  Line "        관리자 권한으로 떠 있는 공문 도우미가 있어 끕니다." "Yellow"
  Line "        Windows 확인 창이 뜨면 [예] 를 누르세요(관리자 암호를 모르면 [아니요])." "Yellow"
  [void](StopElevated)
  $hidden = HiddenHost
  if (-not $hidden) { Line "        껐습니다." "DarkGray" }
}

Line "  [2/5] 자동 시작 등록을 지웁니다..."
foreach ($t in $TASKS) {
  try {
    if (Get-Command Unregister-ScheduledTask -ErrorAction SilentlyContinue) {
      Unregister-ScheduledTask -TaskName $t -Confirm:$false -ErrorAction SilentlyContinue
    }
  } catch {}
  try { & schtasks.exe /Delete /TN $t /F 2>$null | Out-Null } catch {}
}
try { if (Test-Path -LiteralPath $LNK) { Remove-Item -LiteralPath $LNK -Force -ErrorAction SilentlyContinue } } catch {}
$taskLeft = $false
try { if (Get-Command Get-ScheduledTask -ErrorAction SilentlyContinue) { $taskLeft = [bool](Get-ScheduledTask -TaskName $TASK -ErrorAction SilentlyContinue) } } catch {}

Line "  [3/5] 예전 판이 만든 인증서를 정리합니다..."
$hasRoot = $false
try { $hasRoot = [bool](Get-ChildItem Cert:\CurrentUser\Root -ErrorAction SilentlyContinue | Where-Object { $_.Subject -eq $CERT }) } catch {}
if ($hasRoot -and -not $SANDBOX) { Line "        '신뢰할 수 있는 루트'에서 지울 때 Windows 확인 창이 뜹니다. [예] 를 누르세요." "Yellow" }
# 인증서 저장소는 PC 의 것이라 시험 제거(GMH_DEST · GMH_TASK)에서는 건드리지 않는다
foreach ($store in $(if ($SANDBOX) { @() } else { @("My", "TrustedPublisher", "Root") })) {
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
  Line "  제거가 끝났습니다. 설치하기 전으로 되돌렸습니다." "Green"
  if ($pageWiped -gt 0) {
    Line "  열려 있던 K-에듀파인 창의 저장된 설정(프리셋·패널 위치)도 지웠습니다."
  } else {
    Line "  (K-에듀파인 창을 닫아 두셨다면, 저장된 설정은 다음에 설치할 때 자동으로 새로 시작됩니다.)"
  }
}
if ($taskLeft) {
  $code = 1
  Line "  [주의] 예약 작업 '공문도우미'를 지우지 못했습니다. 작업 스케줄러에서 직접 지워 주세요." "Yellow"
}
if ($hidden) {
  Line "  [주의] 관리자 권한으로 떠 있는 공문 도우미를 끄지 못했습니다. 컴퓨터를 다시 시작하면 사라집니다." "Yellow"
}
Write-Host ""
Line "  브라우저 확장 '공문 도우미'를 넣으셨다면 edge://extensions (크롬은 chrome://extensions) 에서 직접 제거해 주세요."
Done $code
