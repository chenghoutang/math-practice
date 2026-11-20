@echo off
setlocal
REM Publish this folder to chenghoutang/math-practice, branch main.
REM Optional commit message: update.bat "Update math questions"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update.ps1" %*
set "DEPLOY_EXIT=%ERRORLEVEL%"
echo.
if not "%DEPLOY_EXIT%"=="0" echo [FAILED] Read the error above. No force push is used.
pause
exit /b %DEPLOY_EXIT%
