# Genera training-progline.ipa para App Store / TestFlight (EAS Build en la nube).
$ErrorActionPreference = "Stop"

$sourceRoot = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $sourceRoot "dist"
$ipaPath = Join-Path $distDir "training-progline.ipa"

Set-Location $sourceRoot

function Ensure-EasSession {
  if ($env:EXPO_TOKEN) {
    Write-Host "Usando EXPO_TOKEN del entorno."
    return
  }

  $whoami = npx eas-cli whoami 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "No hay sesión de Expo activa." -ForegroundColor Yellow
    Write-Host "Ejecuta primero en esta terminal:" -ForegroundColor Yellow
    Write-Host "  npx eas-cli login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Luego vuelve a lanzar:" -ForegroundColor Yellow
    Write-Host "  npm run build:ios:local" -ForegroundColor Cyan
    exit 1
  }

  Write-Host "Sesión Expo: $whoami"
}

function Ensure-DistDir {
  New-Item -ItemType Directory -Force -Path $distDir | Out-Null
}

Write-Host "=== Build iOS (EAS) - Training ProgLine ===" -ForegroundColor Cyan
Ensure-EasSession
Ensure-DistDir

Write-Host ""
Write-Host "Iniciando build en la nube (perfil production)..." -ForegroundColor Cyan
Write-Host "La primera vez EAS pedirá credenciales de Apple (certificado y perfil)." -ForegroundColor DarkGray
Write-Host ""

npx eas-cli build --platform ios --profile production --wait
if ($LASTEXITCODE -ne 0) {
  throw "El build de EAS falló."
}

Write-Host ""
Write-Host "Descargando .ipa a dist/training-progline.ipa ..." -ForegroundColor Cyan

if (Test-Path $ipaPath) {
  Remove-Item $ipaPath -Force
}

$buildListJson = npx eas-cli build:list `
  --platform ios `
  --status finished `
  --build-profile production `
  --limit 1 `
  --json `
  --non-interactive 2>$null

if ($LASTEXITCODE -ne 0 -or -not $buildListJson) {
  throw "No se pudo consultar el ultimo build de iOS en EAS."
}

$latestBuild = ($buildListJson | ConvertFrom-Json | Select-Object -First 1)
$artifactUrl = $latestBuild.artifacts.applicationArchiveUrl
if (-not $artifactUrl) {
  $artifactUrl = $latestBuild.artifacts.buildUrl
}

if (-not $artifactUrl) {
  Write-Host ""
  Write-Host "No se encontro URL del .ipa en el ultimo build." -ForegroundColor Yellow
  Write-Host "Descarga el .ipa desde https://expo.dev (Builds) y guardalo como:" -ForegroundColor Yellow
  Write-Host "  $ipaPath" -ForegroundColor Cyan
  exit 1
}

Invoke-WebRequest -Uri $artifactUrl -OutFile $ipaPath -UseBasicParsing
if (-not (Test-Path $ipaPath)) {
  throw "La descarga del .ipa no genero el archivo esperado."
}

Write-Host ""
Write-Host "Listo:" -ForegroundColor Green
Write-Host "  $ipaPath" -ForegroundColor Green
Write-Host ""
Write-Host "Subir a App Store:" -ForegroundColor Cyan
Write-Host "  npm run submit:ios" -ForegroundColor White
Write-Host "  o Transporter (Mac) / App Store Connect" -ForegroundColor DarkGray
