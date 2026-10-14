@echo off
setlocal
title Gongmun Helper Uninstall
rem  Gongmun Helper uninstall launcher. Keep this file ASCII with CRLF line ends.
rem  A folder cannot be removed while a batch file inside it is running or while a console stands in it.
rem  So this file copies itself and uninstall.ps1 to a temp folder and continues from there in a new window.
rem  uninstall.ps1 is run as a plain file first; if the script file could not even start (execution policy,
rem  "downloaded from the internet" mark, security software) it is run from its text instead.
set "GMH_HERE=%~dp0"
set "GMH_TMP=%TEMP%\GongmunHelper-uninstall"
if /i "%GMH_HERE%"=="%GMH_TMP%\" goto intemp
if not exist "%GMH_HERE%uninstall.ps1" goto nofile
if defined GMH_INPLACE goto direct

if exist "%GMH_TMP%" rd /s /q "%GMH_TMP%" >nul 2>&1
mkdir "%GMH_TMP%" >nul 2>&1
copy /y /b "%GMH_HERE%uninstall.ps1" "%GMH_TMP%\uninstall.ps1" >nul 2>&1
copy /y /b "%~f0" "%GMH_TMP%\uninstall.cmd" >nul 2>&1
if not exist "%GMH_TMP%\uninstall.cmd" goto direct
if not exist "%GMH_TMP%\uninstall.ps1" goto direct
cd /d "%TEMP%"
start "Gongmun Helper Uninstall" /d "%TEMP%" cmd.exe /d /c ""%GMH_TMP%\uninstall.cmd" %*"
exit /b 0

:direct
rem  No temp copy (or asked to run in place): the files are removed, the empty folder itself may stay behind.
set "GMH_UNINST=%GMH_HERE%"
goto run

:intemp
set "GMH_UNINST=%GMH_TMP%\"

:run
cd /d "%TEMP%"
powershell.exe -NoProfile -Command "Unblock-File -LiteralPath ($env:GMH_UNINST + 'uninstall.ps1') -ErrorAction SilentlyContinue" >nul 2>&1
set "GMH_MARK=%TEMP%\gmh-uninst-%RANDOM%%RANDOM%.mark"
if exist "%GMH_MARK%" del "%GMH_MARK%" >nul 2>&1
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%GMH_UNINST%uninstall.ps1" %* 2>nul
set "GMH_RC=%errorlevel%"
if exist "%GMH_MARK%" goto ran
powershell.exe -NoProfile -Command "& ([scriptblock]::Create([IO.File]::ReadAllText($env:GMH_UNINST + 'uninstall.ps1', [Text.Encoding]::UTF8))) %*"
set "GMH_RC=%errorlevel%"
if exist "%GMH_MARK%" goto ran
goto nostart

:ran
del "%GMH_MARK%" >nul 2>&1
rem  Remove the temp copy a moment after this file has finished (this file is inside it).
if /i "%GMH_UNINST%"=="%GMH_TMP%\" start "" /b cmd.exe /d /c "ping -n 3 127.0.0.1 >nul & rd /s /q "%GMH_TMP%""
exit /b %GMH_RC%

:nostart
echo.
echo   Uninstall could not start PowerShell on this PC.
echo   Security software or an organisation policy may be blocking it.
call :say "|  \uC81C\uAC70 \uD504\uB85C\uADF8\uB7A8(PowerShell)\uC744 \uC2DC\uC791\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.|  \uBC31\uC2E0\uC774\uB098 \uAE30\uAD00 \uBCF4\uC548 \uC815\uCC45\uC774 PowerShell \uC2E4\uD589\uC744 \uB9C9\uACE0 \uC788\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.|  \uC9C1\uC811 \uC9C0\uC6B0\uB824\uBA74: \uD2B8\uB808\uC774\uC758 \uACF5\uBB38 \uB3C4\uC6B0\uBBF8\uB97C [\uC885\uB8CC] \uD558\uACE0,|  \uC791\uC5C5 \uC2A4\uCF00\uC904\uB7EC\uC5D0\uC11C [\uACF5\uBB38\uB3C4\uC6B0\uBBF8] \uC791\uC5C5\uC744 \uC9C0\uC6B4 \uB4A4, \uC544\uB798 \uD3F4\uB354\uB97C \uC9C0\uC6B0\uBA74 \uB429\uB2C8\uB2E4.|"
echo   %LOCALAPPDATA%\GongmunHelper
echo.
pause
exit /b 1

:nofile
echo.
echo   uninstall.ps1 is missing next to this file.
call :say "|  \uC81C\uAC70\uC5D0 \uD544\uC694\uD55C \uD30C\uC77C(uninstall.ps1)\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.|  \uC124\uCE58 zip \uC744 \uB2E4\uC2DC \uBC1B\uC544 \uD480\uACE0, \uADF8 \uD3F4\uB354 \uC548\uC758 \uC81C\uAC70.bat \uC744 \uC2E4\uD589\uD558\uC138\uC694.|"
pause
exit /b 1

:say
rem  %1 = unicode-escaped lines separated by "|". Shown in Korean through PowerShell; the ASCII text above is the fallback.
set "GMH_MSG=%~1"
powershell.exe -NoProfile -Command "[Console]::OutputEncoding=[Text.Encoding]::UTF8; foreach($l in ($env:GMH_MSG -split '\|')){ Write-Host ([regex]::Unescape($l)) -ForegroundColor Yellow }" 2>nul
exit /b 0
