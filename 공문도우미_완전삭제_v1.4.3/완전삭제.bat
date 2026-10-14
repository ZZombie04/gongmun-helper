@echo off
setlocal
title Gongmun Helper - Full Clean Uninstall
rem  Gongmun Helper full clean uninstall (standalone). Keep this file ASCII with CRLF line ends.
rem  Works even when the installed copy is broken or an old version (1.0 ~ 1.4) was installed.
rem  It removes the running helper (incl. an elevated one, via a Windows prompt), the logon task and
rem  startup shortcut, the whole install folder (settings, logs, saved presets), leftover temp folders,
rem  and old certificates - returning the PC to the state it was in before the helper was installed.
rem  The real work is done by uninstall.cmd + uninstall.ps1 next to this file.
if not exist "%~dp0uninstall.cmd" goto nofile
if not exist "%~dp0uninstall.ps1" goto nofile
echo.
call :say "|  \uACF5\uBB38 \uB3C4\uC6B0\uBBF8\uB97C \uCEF4\uD4E8\uD130\uC5D0\uC11C \uC644\uC804\uD788 \uC9C0\uC6C1\uB2C8\uB2E4.|  \uC790\uB3D9 \uC2E4\uD589 \u00B7 \uC124\uC815 \u00B7 \uAE30\uB85D \u00B7 \uC800\uC7A5\uD55C \uD504\uB9AC\uC14B\uC744 \uBAA8\uB450 \uC9C0\uC6CC \uC124\uCE58\uD558\uAE30 \uC804\uC73C\uB85C \uB418\uB3CC\uB9BD\uB2C8\uB2E4.|  \uC608\uC804 \uD310(1.0~1.4)\uC774\uB098 \uC124\uCE58\uAC00 \uB9DD\uAC00\uC9C4 PC \uC5D0\uC11C\uB3C4 \uB429\uB2C8\uB2E4.|"
echo.
call "%~dp0uninstall.cmd" %*
exit /b %errorlevel%

:nofile
echo.
echo   uninstall.cmd / uninstall.ps1 is missing next to this file.
call :say "|  \uC0AD\uC81C\uC5D0 \uD544\uC694\uD55C \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uBC1B\uC740 \uD3F4\uB354\uB97C \uD1B5\uC9F8\uB85C \uB450\uACE0 \uC2E4\uD589\uD558\uC138\uC694.|"
pause
exit /b 1

:say
rem  %1 = unicode-escaped lines separated by "|". Shown in Korean through PowerShell; the ASCII above is the fallback.
set "GMH_MSG=%~1"
powershell.exe -NoProfile -Command "[Console]::OutputEncoding=[Text.Encoding]::UTF8; foreach($l in ($env:GMH_MSG -split '\|')){ Write-Host ([regex]::Unescape($l)) -ForegroundColor Cyan }" 2>nul
exit /b 0
