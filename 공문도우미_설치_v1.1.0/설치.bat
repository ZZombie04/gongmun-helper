@echo off
setlocal
title Gongmun Helper Setup

set "GMH_SRC=%~dp0"

rem  1) Normal path: run the script file with Bypass.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
if not errorlevel 1 goto done

rem  2) Some sites force an execution policy by group policy, which makes
rem     -ExecutionPolicy Bypass useless and reports "script is not signed".
rem     An inline command is not governed by that policy, so read the file
rem     and run its text instead.
echo.
echo Retrying in policy-safe mode...
powershell.exe -NoProfile -Command "$ErrorActionPreference='Stop'; $p=Join-Path $env:GMH_SRC 'install.ps1'; $t=[System.IO.File]::ReadAllText($p,[System.Text.Encoding]::UTF8); Invoke-Expression $t"
if not errorlevel 1 goto done

echo.
echo Setup failed. See the message above.
pause
exit /b 1

:done
exit /b 0
