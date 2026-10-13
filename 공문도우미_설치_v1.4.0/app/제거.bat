@echo off
rem  Gongmun Helper uninstall. Keep this file ASCII with CRLF line ends. The work is done by uninstall.cmd.
if not exist "%~dp0uninstall.cmd" goto nofile
call "%~dp0uninstall.cmd" %*
exit /b %errorlevel%

:nofile
echo.
echo   uninstall.cmd is missing next to this file.
echo   Download the setup zip again, extract it, and run the uninstall batch file in that folder.
echo.
pause
exit /b 1
