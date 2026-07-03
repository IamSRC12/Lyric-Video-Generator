# Create Desktop Shortcut for Lyric Video Generator

$TargetPath = "a:\Antigravity\Project Universe\Lyric-Video-Generator\1.start.bat"
$ShortcutPath = [Environment]::GetFolderPath("Desktop") + "\🎬 Lyric Video Generator.lnk"

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = "a:\Antigravity\Project Universe\Lyric-Video-Generator"
$Shortcut.Description = "Start Lyric Video Generator with Docker Whisper"
$Shortcut.Save()

Write-Host "✅ Desktop shortcut created!" -ForegroundColor Green
Write-Host "   You can now double-click '🎬 Lyric Video Generator' on your desktop" -ForegroundColor Cyan
