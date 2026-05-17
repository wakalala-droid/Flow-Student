# Flow-Student — One-Click Setup
# HOW TO RUN:
#   1. Put this file in the same folder as flow-student-fixed.zip  (e.g. Desktop)
#   2. Right-click setup.ps1 → "Run with PowerShell"
#      OR open PowerShell and type:  .\setup.ps1

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
$ErrorActionPreference = "Continue"

function Write-Step($n, $msg) { Write-Host "`n[$n] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)       { Write-Host "    OK  $msg" -ForegroundColor Green }
function Write-Warn($msg)     { Write-Host "    !!  $msg" -ForegroundColor Yellow }
function Write-Fail($msg)     { Write-Host "    ERR $msg" -ForegroundColor Red }

Clear-Host
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   Flow-Student  —  One-Click Setup        " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

# ── 1. Find the zip ───────────────────────────────────────────────────────────
Write-Step 1 "Finding flow-student-fixed.zip ..."

$zip = Get-ChildItem -Path "$HOME\Desktop","$HOME\Downloads","$HOME\Documents" `
         -Filter "*flow-student*" -Recurse -ErrorAction SilentlyContinue |
       Where-Object { $_.Extension -eq ".zip" } |
       Sort-Object LastWriteTime -Descending |
       Select-Object -First 1

if (-not $zip) {
    Write-Fail "Zip not found in Desktop / Downloads / Documents."
    Write-Host "`n  Download flow-student-fixed.zip from the chat, then re-run." -ForegroundColor Yellow
    Read-Host "`nPress Enter to exit"; exit 1
}
Write-Ok $zip.FullName

# ── 2. Extract ────────────────────────────────────────────────────────────────
Write-Step 2 "Extracting to Desktop\flow-Student ..."

$dest = "$HOME\Desktop\flow-Student"
if (Test-Path $dest) {
    Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zip.FullName, $dest)

# Handle zip-inside-zip nesting (flow-Student\flow-student\flow-student)
$inner = Get-ChildItem $dest -Directory | Select-Object -First 1
if ($inner -and (Test-Path "$($inner.FullName)\package.json")) {
    $proj = $inner.FullName
} elseif (Test-Path "$dest\package.json") {
    $proj = $dest
} else {
    Write-Fail "Cannot find package.json after extraction."
    Read-Host "Press Enter to exit"; exit 1
}
Write-Ok "Project folder: $proj"

# ── 3. Fix package.json (eslint peer conflict) ────────────────────────────────
Write-Step 3 "Patching package.json (eslint version fix) ..."

$pkgPath = "$proj\package.json"
$pkg = Get-Content $pkgPath -Raw
$pkg = $pkg -replace '"eslint-config-next":\s*"[^"]*"', '"eslint-config-next": "14.2.5"'
$pkg = $pkg -replace '"eslint":\s*"\^?[^"]*"', '"eslint": "^8.57.1"'
Set-Content $pkgPath $pkg
Write-Ok "eslint-config-next pinned to 14.2.5"

# ── 4. Create .env.local ──────────────────────────────────────────────────────
Write-Step 4 "Creating .env.local ..."

$envLocal = "$proj\.env.local"
if (-not (Test-Path $envLocal)) {
    $example = "$proj\.env.example"
    if (Test-Path $example) {
        Copy-Item $example $envLocal
    } else {
        @"
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_ENCRYPTION_KEY=
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Flow-Student
NODE_ENV=development
"@ | Set-Content $envLocal
    }
}
Write-Ok ".env.local ready — add your API keys inside VS Code"

# ── 5. Add Windows Defender exclusion ─────────────────────────────────────────
Write-Step 5 "Adding Windows Defender exclusion (speeds up npm) ..."
try {
    Add-MpPreference -ExclusionPath $proj -ErrorAction Stop
    Write-Ok "Exclusion added for $proj"
} catch {
    Write-Warn "Skipped (re-run as Administrator to add it)"
}

# ── 6. npm install ────────────────────────────────────────────────────────────
Write-Step 6 "Running npm install --legacy-peer-deps ..."
Set-Location $proj

$result = Start-Process npm -ArgumentList "install","--legacy-peer-deps" `
              -WorkingDirectory $proj -Wait -PassThru -NoNewWindow
if ($result.ExitCode -ne 0) {
    Write-Warn "First install attempt failed — retrying with --force ..."
    Start-Process npm -ArgumentList "install","--force" `
        -WorkingDirectory $proj -Wait -NoNewWindow
}
Write-Ok "node_modules installed"

# ── 7. Open VS Code ───────────────────────────────────────────────────────────
Write-Step 7 "Opening VS Code ..."
if (Get-Command code -ErrorAction SilentlyContinue) {
    Start-Process code -ArgumentList $proj
    Write-Ok "VS Code opened"
} else {
    Write-Warn "VS Code not found — open the folder manually: $proj"
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   DONE!  Next steps inside VS Code:       " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  1. Open .env.local and paste your keys:" -ForegroundColor White
Write-Host "       GROQ_API_KEY      -> console.groq.com  (free)"
Write-Host "       SUPABASE keys     -> supabase.com      (free)"
Write-Host "       FLUTTERWAVE keys  -> dashboard.flutterwave.com"
Write-Host ""
Write-Host "  2. Run the SQL schema in Supabase SQL Editor:"
Write-Host "       supabase/migrations/001_schema.sql"
Write-Host ""
Write-Host "  3. Start the app  (Ctrl+` opens terminal in VS Code):"
Write-Host "       npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Open browser:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

$go = Read-Host "Start dev server right now? (y/n)"
if ($go -match "^[Yy]") {
    Write-Host "`nStarting... (Ctrl+C to stop)`n" -ForegroundColor Cyan
    Set-Location $proj
    npm run dev
}
