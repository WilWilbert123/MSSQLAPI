Set objFSO = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
strStartupFolder = WshShell.SpecialFolders("Startup")

strShortcut = strStartupFolder & "\AutoRun_API_Hidden.lnk"

If objFSO.FileExists(strShortcut) Then
    objFSO.DeleteFile strShortcut
    WScript.Echo "Auto-run successfully removed! The API will no longer start automatically on PC boot."
Else
    WScript.Echo "The Auto-run shortcut was not found. It may have already been removed."
End If
