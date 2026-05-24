@echo off
title XiangYunMaZhao Server
cd /d "%~dp0"

:: Try Python first
where python >nul 2>&1
if %errorlevel%==0 goto use_python

:: Try Node.js
where npx >nul 2>&1
if %errorlevel%==0 goto use_node

:: Fallback - open directly (some features limited)
echo No Python/Node found. Opening in browser directly...
start index.html
goto end

:use_python
echo Python found - Starting server on port 8888
start http://localhost:8888
python -m http.server 8888
goto end

:use_node
echo Node.js found - Starting server on port 8888
start http://localhost:8888
npx serve -p 8888 -s .
goto end

:end
pause
