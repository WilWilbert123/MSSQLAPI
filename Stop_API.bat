@echo off
echo Stopping PM2 services...
cmd.exe /c "pm2 delete all"

echo API has been successfully stopped!
pause
