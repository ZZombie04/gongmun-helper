@echo off
setlocal
title Gongmun Helper Uninstall

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"
