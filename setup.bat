@echo off
title Flow-Student Setup
color 0A
echo.
echo ============================================
echo    Flow-Student -- One-Click Setup
echo ============================================
echo.

:: Keep window open on any error
if "%1"=="" (
    cmd /k "%~f0" KEEP
    exit /b
)

:: ── Find package.json by searching common locations ──────────────────────────
echo [1/4] Locating project...

set "PROJ="

:: Check the folder this .bat file lives in
if exist "%~dp0package.json"                      set "PROJ=%~dp0"
if exist "%~dp0flow-student\package.json"         set "PROJ=%~dp0flow-student\"
if exist "%~dp0flow-student-fixed\package.json"   set "PROJ=%~dp0flow-student-fixed\"
if exist "%~dp0flow-student-final\package.json"   set "PROJ=%~dp0flow-student-final\"

:: Check Desktop
if not defined PROJ (
    for /d %%D in ("%USERPROFILE%\Desktop\*") do (
        if exist "%%D\package.json" set "PROJ=%%D\"
        if exist "%%D\flow-student\package.json" set "PROJ=%%D\flow-student\"
    )
)

if not defined PROJ (
    echo.
    echo ERROR: Could not find package.json anywhere.
    echo.
    echo Make sure you extracted flow-student-final.zip first,
    echo then move setup.bat INTO the extracted folder
    echo (the one that contains package.json).
    echo.
    echo Current folder searched: %~dp0
    echo.
    pause
    exit /b 1
)

echo     Found: %PROJ%
cd /d "%PROJ%"

:: ── Fix eslint version conflict in package.json ──────────────────────────────
echo.
echo [2/4] Patching package.json...
powershell -NoProfile -Command ^
  "$c=(Get-Content 'package.json' -Raw);$c=$c -replace '\"eslint-config-next\":\s*\"[^\"]+\"','\"eslint-config-next\": \"14.2.5\"';$c=$c -replace '\"eslint\":\s*\"\^?[^\"]+\"','\"eslint\": \"^8.57.1\"';Set-Content 'package.json' $c"
echo     Done.

:: ── Create .env.local if missing ─────────────────────────────────────────────
echo.
echo [3/4] Setting up .env.local...
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
    ) else (
        (
            echo NEXT_PUBLIC_SUPABASE_URL=
            echo NEXT_PUBLIC_SUPABASE_ANON_KEY=
            echo SUPABASE_SERVICE_ROLE_KEY=
            echo GROQ_API_KEY=
            echo FLUTTERWAVE_SECRET_KEY=
            echo FLUTTERWAVE_PUBLIC_KEY=
            echo FLUTTERWAVE_ENCRYPTION_KEY=
            echo NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
            echo NEXT_PUBLIC_APP_URL=http://localhost:3000
            echo NEXT_PUBLIC_APP_NAME=Flow-Student
            echo NODE_ENV=development
        ) > .env.local
    )
    echo     Created .env.local
) else (
    echo     .env.local already exists -- skipping.
)

:: ── npm install ──────────────────────────────────────────────────────────────
echo.
echo [4/4] Installing npm packages (1-2 mins)...
echo.

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm not found. Install Node.js from https://nodejs.org then re-run.
    pause
    exit /b 1
)

call npm install --legacy-peer-deps
if %ERRORLEVEL% neq 0 (
    echo.
    echo Retrying with --force...
    call npm install --force
)

:: ── Open VS Code ─────────────────────────────────────────────────────────────
echo.
where code >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Opening VS Code...
    start code .
)

:: ── Summary ──────────────────────────────────────────────────────────────────
echo.
echo ============================================
echo   SUCCESS - Project is ready!
echo ============================================
echo.
echo  Fill in .env.local with your API keys:
echo    GROQ_API_KEY        console.groq.com  (free)
echo    SUPABASE keys       supabase.com      (free)
echo    FLUTTERWAVE keys    dashboard.flutterwave.com
echo.
echo  Then run:  npm run dev
echo  Then open: http://localhost:3000
echo.
set /p GO="Start dev server now? (y/n): "
if /i "%GO%"=="y" (
    echo.
    npm run dev
)
pause
