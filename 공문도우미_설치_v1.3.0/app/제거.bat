@echo off
setlocal
title Gongmun Helper Uninstall
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0uninstall.ps1"
