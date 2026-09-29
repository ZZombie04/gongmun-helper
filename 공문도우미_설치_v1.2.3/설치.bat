@echo off
setlocal
title Gongmun Helper Setup
rem  Clears the "downloaded from internet" mark on our own files, then runs the installer
rem  script as a plain file under the RemoteSigned policy (no policy bypass, no script-text eval).
rem  The folder goes to PowerShell in an environment variable, so no path is quoted inside code.
rem  Keep this file ASCII with CRLF line ends (cmd reads it in the OEM code page).
set "GMH_SRC=%~dp0"

rem  0) Started from inside the zip (not extracted)? Then the other files are not next to this one.
if not exist "%~dp0install.ps1" goto notextracted
if not exist "%~dp0app\tools\host.ps1" goto notextracted

rem  1) Remove Mark-of-the-Web from our files so RemoteSigned runs them as local files.
powershell.exe -NoProfile -Command "Get-ChildItem -LiteralPath $env:GMH_SRC -Recurse -File | Unblock-File -ErrorAction SilentlyContinue"

rem  2) Run the installer as a file under RemoteSigned (arguments such as -Check are passed on).
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0install.ps1" %*
if not errorlevel 1 goto done

echo.
echo Setup failed. See the message above.
pause
exit /b 1

:notextracted
powershell.exe -NoProfile -Command "[Console]::OutputEncoding=[Text.Encoding]::UTF8; foreach($l in @('','  \uC555\uCD95\uC744 \uBA3C\uC800 \uD480\uC5B4 \uC8FC\uC138\uC694.','','  \uBC1B\uC740 zip \uD30C\uC77C\uC744 \uB9C8\uC6B0\uC2A4 \uC624\uB978\uCABD \uB2E8\uCD94\uB85C \uB204\uB974\uACE0 [\uBAA8\uB450 \uC555\uCD95 \uD480\uAE30] \uB97C \uD55C \uB4A4,','  \uD480\uB9B0 \uD3F4\uB354 \uC548\uC758 \uC124\uCE58.bat \uC744 \uC2E4\uD589\uD558\uC138\uC694.','  (zip \uC744 \uC5F0 \uCC3D\uC5D0\uC11C \uBC14\uB85C \uC2E4\uD589\uD558\uBA74 \uB098\uBA38\uC9C0 \uC124\uCE58 \uD30C\uC77C\uC744 \uCC3E\uC9C0 \uBABB\uD569\uB2C8\uB2E4)','')){ Write-Host ([regex]::Unescape($l)) -ForegroundColor Yellow }"
pause
exit /b 1

:done
exit /b 0
