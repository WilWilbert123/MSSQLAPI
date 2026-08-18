Set objFSO = CreateObject("Scripting.FileSystemObject")
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

Set WshShell = CreateObject("WScript.Shell")
strStartupFolder = WshShell.SpecialFolders("Startup")

' Path to the target VBS script
strTargetScript = strPath & "\Run_API_Hidden_Portable.vbs"

' Ensure the target script exists
If Not objFSO.FileExists(strTargetScript) Then
    WScript.Echo "Error: Could not find Run_API_Hidden_Portable.vbs in the current directory."
    WScript.Quit
End If

' Create the shortcut in the Startup folder
Set objShortcut = WshShell.CreateShortcut(strStartupFolder & "\AutoRun_API_Hidden.lnk")
objShortcut.TargetPath = strTargetScript
objShortcut.WorkingDirectory = strPath
objShortcut.Description = "Automatically start the hidden API on PC boot"
objShortcut.Save

WScript.Echo "Success! The API has been added to your PC's Startup folder." & vbCrLf & vbCrLf & "It will now automatically run hidden in the background every time you restart or turn on the PC."
