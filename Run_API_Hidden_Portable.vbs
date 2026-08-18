Set objFSO = CreateObject("Scripting.FileSystemObject")
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

Set WshShell = CreateObject("WScript.Shell")

' Set the working directory to wherever this script is located
WshShell.CurrentDirectory = strPath

' Run PM2 with the ecosystem config completely hidden in the background
WshShell.Run "cmd.exe /c pm2 start ecosystem.config.js", 0, False
