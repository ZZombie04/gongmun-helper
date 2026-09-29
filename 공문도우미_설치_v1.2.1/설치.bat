@echo off
setlocal
title Gongmun Helper Setup
rem  This batch only clears the "downloaded from internet" mark on our own files,
rem  then runs the installer script as a plain file under the RemoteSigned policy.
rem  No policy-bypass and no script-text-eval tricks (to reduce false positives).

rem  1) Remove Mark-of-the-Web from our files so RemoteSigned runs them as local files.
powershell.exe -NoProfile -Command "Get-ChildItem -LiteralPath '%~dp0.' -Recurse -File | Unblock-File -ErrorAction SilentlyContinue"

rem  2) Run the installer as a file under RemoteSigned.
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0install.ps1"
if not errorlevel 1 goto done

echo.
echo Setup failed. See the message above.
pause
exit /b 1

:done
exit /b 0
