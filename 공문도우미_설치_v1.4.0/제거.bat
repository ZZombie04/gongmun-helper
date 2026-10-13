@echo off
rem  Gongmun Helper uninstall, run from the downloaded setup folder. Keep this file ASCII with CRLF line ends.
rem  Use this when the installed copy is broken or its own uninstall file does not work.
if not exist "%~dp0app\uninstall.cmd" goto nofile
call "%~dp0app\uninstall.cmd" %*
exit /b %errorlevel%

:nofile
echo.
echo   Please extract the zip file first, then run this file from the extracted folder.
echo.
pause
exit /b 1
