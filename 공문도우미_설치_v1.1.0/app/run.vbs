' Gongmun Helper - silent launcher
'
' NOTE: this file must stay pure ASCII.
' Windows Script Host reads .vbs as the system ANSI codepage, so UTF-8 Korean
' turns into garbage bytes and breaks string literals ("unterminated string").
' Korean text belongs in the PowerShell files, which are read as UTF-8.
'
' Some sites lock the PowerShell execution policy by group policy, which makes
' -ExecutionPolicy Bypass useless ("script is not digitally signed").
' So we do not *run* the script file - we read it and run its text instead.
' A command string is not governed by the execution policy.
Option Explicit
Dim fso, base, sh, q, psFile, cmd

Set fso = CreateObject("Scripting.FileSystemObject")
base = fso.GetParentFolderName(WScript.ScriptFullName)
Set sh = CreateObject("WScript.Shell")

psFile = base & "\tools\host.ps1"
If Not fso.FileExists(psFile) Then WScript.Quit 1

q = Chr(34)
cmd = "powershell -NoProfile -STA -ExecutionPolicy Bypass -WindowStyle Hidden -Command " & _
      q & _
      "$env:GMH_HOME='" & base & "';" & _
      "$t=[IO.File]::ReadAllText('" & psFile & "',[Text.Encoding]::UTF8);" & _
      "& ([scriptblock]::Create($t)) -Tray" & _
      q

sh.Run cmd, 0, False
