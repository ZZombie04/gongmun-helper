@echo off
setlocal
title Gongmun Helper Setup
rem  Gongmun Helper setup launcher. Keep this file ASCII with CRLF line ends (cmd reads it in the OEM code page).
rem   1) Clears the "downloaded from the internet" mark on our own files (best effort - setup works without it,
rem      because the installer writes the installed files anew instead of copying them).
rem   2) Runs install.ps1 as a plain file under the RemoteSigned policy (no policy bypass).
rem   3) If the script file could not even start (execution policy locked by the organisation, the mark could
rem      not be cleared, security software), runs the same script from its text, which depends on neither.
rem  The folder goes to PowerShell in an environment variable, so no path is quoted inside code.
set "GMH_SRC=%~dp0"

rem  0) Started from inside the zip (not extracted)? Then the other files are not next to this one.
if not exist "%~dp0install.ps1" goto notextracted
if not exist "%~dp0app\tools\host.ps1" goto notextracted

rem  1)
powershell.exe -NoProfile -Command "Get-ChildItem -LiteralPath $env:GMH_SRC -Recurse -File | Unblock-File -ErrorAction SilentlyContinue" >nul 2>&1

rem  2) install.ps1 writes the mark file as its first action, so we can tell "could not start" from "ran and failed".
set "GMH_MARK=%TEMP%\gmh-setup-%RANDOM%%RANDOM%.mark"
if exist "%GMH_MARK%" del "%GMH_MARK%" >nul 2>&1
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0install.ps1" %* 2>nul
set "GMH_RC=%errorlevel%"
if exist "%GMH_MARK%" goto ran

rem  3)
powershell.exe -NoProfile -Command "& ([scriptblock]::Create([IO.File]::ReadAllText($env:GMH_SRC + 'install.ps1', [Text.Encoding]::UTF8))) %*"
set "GMH_RC=%errorlevel%"
if exist "%GMH_MARK%" goto ran
goto nostart

:ran
del "%GMH_MARK%" >nul 2>&1
exit /b %GMH_RC%

:nostart
echo.
echo   Setup could not start PowerShell on this PC.
echo   Security software or an organisation policy may be blocking it.
call :say "|  \uC124\uCE58 \uD504\uB85C\uADF8\uB7A8(PowerShell)\uC744 \uC2DC\uC791\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.|  \uBC31\uC2E0\uC774\uB098 \uAE30\uAD00 \uBCF4\uC548 \uC815\uCC45\uC774 PowerShell \uC2E4\uD589\uC744 \uB9C9\uACE0 \uC788\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.|  \uBC31\uC2E0 \uC54C\uB9BC(\uCC28\uB2E8 \uAE30\uB85D)\uC744 \uD655\uC778\uD558\uACE0, \uC0AC\uC6A9\uBC95.txt 7\uBC88 [\uC124\uCE58\uAC00 \uC548 \uB41C\uB2E4]\uB97C \uBCF4\uC138\uC694.|"
pause
exit /b 1

:notextracted
echo.
echo   Please extract the zip file first, then run this file from the extracted folder.
call :say "|  \uC555\uCD95\uC744 \uBA3C\uC800 \uD480\uC5B4 \uC8FC\uC138\uC694.||  \uBC1B\uC740 zip \uD30C\uC77C\uC744 \uB9C8\uC6B0\uC2A4 \uC624\uB978\uCABD \uB2E8\uCD94\uB85C \uB204\uB974\uACE0 [\uC18D\uC131] - \uC544\uB798 [\uCC28\uB2E8 \uD574\uC81C] \uC5D0 \uCCB4\uD06C - [\uD655\uC778] \uC744 \uD55C \uB4A4,|  \uB2E4\uC2DC \uC624\uB978\uCABD \uB2E8\uCD94\uB85C \uB20C\uB7EC [\uBAA8\uB450 \uC555\uCD95 \uD480\uAE30] \uB97C \uD558\uACE0, \uD480\uB9B0 \uD3F4\uB354 \uC548\uC758 \uC124\uCE58.bat \uC744 \uC2E4\uD589\uD558\uC138\uC694.|  (zip \uC744 \uC5F0 \uCC3D\uC5D0\uC11C \uBC14\uB85C \uC2E4\uD589\uD558\uBA74 \uB098\uBA38\uC9C0 \uC124\uCE58 \uD30C\uC77C\uC744 \uCC3E\uC9C0 \uBABB\uD569\uB2C8\uB2E4)|"
pause
exit /b 1

:say
rem  %1 = unicode-escaped lines separated by "|". Shown in Korean through PowerShell; the ASCII text above is the fallback.
set "GMH_MSG=%~1"
powershell.exe -NoProfile -Command "[Console]::OutputEncoding=[Text.Encoding]::UTF8; foreach($l in ($env:GMH_MSG -split '\|')){ Write-Host ([regex]::Unescape($l)) -ForegroundColor Yellow }" 2>nul
exit /b 0
