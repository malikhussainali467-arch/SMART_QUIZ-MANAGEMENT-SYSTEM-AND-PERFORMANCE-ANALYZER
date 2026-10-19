@echo off
REM Double-click to run Smart Quiz on Windows.
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies - first time only, needs internet...
  call npm install
)
call npm start
pause
