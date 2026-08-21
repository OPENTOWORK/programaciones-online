# Genera training-progline.aab para Google Play.
$ErrorActionPreference = "Stop"

$sourceRoot = Split-Path -Parent $PSScriptRoot
$buildRoot = "C:\tp"
$androidDir = Join-Path $buildRoot "android"
$distDir = Join-Path $sourceRoot "dist"
$sdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$cmdlineTools = Join-Path $sdkRoot "cmdline-tools\latest"
$sdkmanager = Join-Path $cmdlineTools "bin\sdkmanager.bat"
$gradleHome = "C:\gradle-home"

function Get-Jdk17Home {
  $match = Get-ChildItem "C:\Program Files\Microsoft\jdk-17*" -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if ($match) { return $match.FullName }
  throw "Instala JDK 17: winget install Microsoft.OpenJDK.17"
}

function Sync-ProjectToShortPath {
  Write-Host "Sincronizando proyecto a ruta corta: $buildRoot"
  New-Item -ItemType Directory -Force -Path $buildRoot | Out-Null

  $freshDirs = @("app", "components", "constants", "hooks", "lib", "assets", "scripts", "supabase")
  foreach ($dir in $freshDirs) {
    $target = Join-Path $buildRoot $dir
    if (Test-Path $target) {
      Remove-Item $target -Recurse -Force
    }
    $source = Join-Path $sourceRoot $dir
    if (Test-Path $source) {
      Copy-Item -Path $source -Destination $target -Recurse -Force
    }
  }

  $freshFiles = @("app.json", "app.config.js", "package.json", "package-lock.json", "eas.json", "tsconfig.json", "metro.config.js", "expo-env.d.ts", ".env", ".env.example", "PLAYSTORE_ANDROID.md", "scripts\android-proguard-rules.pro", "scripts\apply-release-optimizations.ps1", "scripts\apply-release-signing.ps1")
  foreach ($file in $freshFiles) {
    $source = Join-Path $sourceRoot $file
    if (Test-Path $source) {
      Copy-Item -Path $source -Destination (Join-Path $buildRoot $file) -Force
    }
  }

  $sourceModules = Join-Path $sourceRoot "node_modules"
  $targetModules = Join-Path $buildRoot "node_modules"

  if (-not (Test-Path $targetModules)) {
    if (Test-Path $sourceModules) {
      Write-Host "Copiando node_modules (solo la primera vez puede tardar)..."
      Copy-Item -Path $sourceModules -Destination $targetModules -Recurse -Force
    }
  }
  elseif (Test-Path $sourceModules) {
    # Las dependencias nuevas no llegan solas a la copia: sin esto prebuild falla al resolver plugins.
    $declared = (Get-Content (Join-Path $sourceRoot "package.json") -Raw | ConvertFrom-Json).dependencies.PSObject.Properties.Name
    foreach ($dependency in $declared) {
      $target = Join-Path $targetModules $dependency
      if (Test-Path $target) { continue }

      $source = Join-Path $sourceModules $dependency
      if (-not (Test-Path $source)) { continue }

      Write-Host "Copiando dependencia nueva: $dependency"
      New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
      Copy-Item -Path $source -Destination $target -Recurse -Force
    }
  }

  if (Test-Path (Join-Path $sourceRoot "android\app\release.keystore")) {
    New-Item -ItemType Directory -Force -Path (Join-Path $buildRoot "android\app") | Out-Null
    Copy-Item (Join-Path $sourceRoot "android\app\release.keystore") (Join-Path $buildRoot "android\app\release.keystore") -Force
  }

  if (Test-Path (Join-Path $sourceRoot "android\keystore.properties")) {
    New-Item -ItemType Directory -Force -Path (Join-Path $buildRoot "android") | Out-Null
    Copy-Item (Join-Path $sourceRoot "android\keystore.properties") (Join-Path $buildRoot "android\keystore.properties") -Force
  }
}

function Ensure-AndroidSdk {
  New-Item -ItemType Directory -Force -Path $sdkRoot | Out-Null

  if (-not (Test-Path $sdkmanager)) {
    Write-Host "Descargando Android command line tools..."
    $zipPath = Join-Path $env:TEMP "android-cmdline-tools.zip"
    $url = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    Invoke-WebRequest -Uri $url -OutFile $zipPath
    $extractRoot = Join-Path $env:TEMP "android-cmdline-tools"
    if (Test-Path $extractRoot) { Remove-Item $extractRoot -Recurse -Force }
    Expand-Archive -Path $zipPath -DestinationPath $extractRoot -Force
    $sourceTools = Join-Path $extractRoot "cmdline-tools"
    $targetTools = Join-Path $sdkRoot "cmdline-tools"
    New-Item -ItemType Directory -Force -Path (Join-Path $targetTools "latest") | Out-Null
    Copy-Item -Path (Join-Path $sourceTools "*") -Destination (Join-Path $targetTools "latest") -Recurse -Force
  }

  $env:ANDROID_HOME = $sdkRoot
  $env:ANDROID_SDK_ROOT = $sdkRoot

  Write-Host "Instalando componentes del SDK..."
  cmd /c "echo y| `"$sdkmanager`" --sdk_root=`"$sdkRoot`" --licenses"
  & $sdkmanager --sdk_root=$sdkRoot "platform-tools" "platforms;android-35" "build-tools;35.0.0" "ndk;27.1.12297006"
}

function Ensure-ReleaseKeystore {
  $keystorePath = Join-Path $androidDir "app\release.keystore"
  $propsPath = Join-Path $androidDir "keystore.properties"

  if (-not (Test-Path $keystorePath)) {
    $storePassword = Read-Host "Crea contraseña para el keystore de release"
    $keyPassword = Read-Host "Repite la contraseña de la clave"
    Write-Host "Generando keystore de release..."
    $dname = "CN=Training ProgLine, OU=Training ProgLine, O=Training ProgLine, L=Madrid, ST=Madrid, C=ES"
    & keytool -genkeypair -v `
      -storetype PKCS12 `
      -keystore $keystorePath `
      -alias training-progline `
      -keyalg RSA `
      -keysize 2048 `
      -validity 10000 `
      -storepass $storePassword `
      -keypass $keyPassword `
      -dname $dname

    @"
storePassword=$storePassword
keyPassword=$keyPassword
keyAlias=training-progline
storeFile=release.keystore
"@ | Set-Content -Path $propsPath -Encoding ASCII
  }
}

Sync-ProjectToShortPath

Push-Location $buildRoot
try {
  if (Test-Path (Join-Path $buildRoot ".env")) {
    Get-Content (Join-Path $buildRoot ".env") | ForEach-Object {
      if ($_ -match '^\s*([^#=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
      }
    }
    Write-Host "Variables de entorno cargadas desde .env"

    $envUrl = $env:EXPO_PUBLIC_SUPABASE_URL
    if ($envUrl -match 'localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.') {
      Write-Warning "EXPO_PUBLIC_SUPABASE_URL en .env apunta a red local ($envUrl). app.config.js usará producción embebida."
    }
    if ($env:EXPO_PUBLIC_SUPABASE_ANON_KEY -match 'service_role|sb_secret_') {
      Write-Warning "EXPO_PUBLIC_SUPABASE_ANON_KEY parece una clave secreta. app.config.js usará producción embebida."
    }
  }

  Write-Host "Sincronizando proyecto Android con Expo (iconos, splash, version)..."

  $keystoreBackup = Join-Path $env:TEMP "training-progline-release.keystore"
  $propsBackup = Join-Path $env:TEMP "training-progline-keystore.properties"
  if (Test-Path (Join-Path $buildRoot "android\app\release.keystore")) {
    Copy-Item (Join-Path $buildRoot "android\app\release.keystore") $keystoreBackup -Force
  }
  if (Test-Path (Join-Path $buildRoot "android\keystore.properties")) {
    Copy-Item (Join-Path $buildRoot "android\keystore.properties") $propsBackup -Force
  }
  if (Test-Path (Join-Path $buildRoot "android")) {
    cmd /c "rmdir /s /q `"$buildRoot\android`"" | Out-Null
  }

  npx expo prebuild --platform android --no-install

  if (Test-Path $keystoreBackup) {
    New-Item -ItemType Directory -Force -Path (Join-Path $buildRoot "android\app") | Out-Null
    Copy-Item $keystoreBackup (Join-Path $buildRoot "android\app\release.keystore") -Force
  }
  if (Test-Path $propsBackup) {
    Copy-Item $propsBackup (Join-Path $buildRoot "android\keystore.properties") -Force
  }

  $env:JAVA_HOME = Get-Jdk17Home
  $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
  $env:GRADLE_USER_HOME = $gradleHome
  New-Item -ItemType Directory -Force -Path $gradleHome | Out-Null

  Ensure-AndroidSdk
  & (Join-Path $sourceRoot "scripts\apply-release-signing.ps1") -BuildGradlePath (Join-Path $androidDir "app\build.gradle")
  & (Join-Path $sourceRoot "scripts\apply-release-optimizations.ps1") -GradlePropertiesPath (Join-Path $androidDir "gradle.properties") -ProguardRulesPath (Join-Path $androidDir "app\proguard-rules.pro") -ProguardTemplatePath (Join-Path $sourceRoot "scripts\android-proguard-rules.pro")
  Ensure-ReleaseKeystore

  New-Item -ItemType Directory -Force -Path $distDir | Out-Null

  Push-Location $androidDir
  .\gradlew.bat bundleRelease
  if ($LASTEXITCODE -ne 0) {
    throw "Gradle bundleRelease fallo con codigo $LASTEXITCODE"
  }
  Pop-Location

  $bundlePath = Join-Path $androidDir "app\build\outputs\bundle\release\app-release.aab"
  if (-not (Test-Path $bundlePath)) {
    throw "No se encontro el AAB generado en $bundlePath"
  }

  $outputPath = Join-Path $distDir "training-progline.aab"
  Copy-Item $bundlePath $outputPath -Force

  Push-Location $sourceRoot
  node (Join-Path $sourceRoot "scripts\verify-aab-supabase.mjs")
  if ($LASTEXITCODE -ne 0) {
    throw "El AAB generado no incluye la configuracion de Supabase"
  }
  Pop-Location

  $appJson = Get-Content (Join-Path $sourceRoot "app.json") -Raw | ConvertFrom-Json
  $appVersion = $appJson.expo.version
  $versionCode = $appJson.expo.android.versionCode

  Write-Host ""
  Write-Host "AAB generado:" $outputPath
  Write-Host "Nombre del paquete: com.trainingprogline.app"
  Write-Host "Version: $appVersion (versionCode $versionCode)"
  Write-Host ""
  Write-Host "Subelo en Google Play Console -> Crear nueva version -> App bundles"
}
finally {
  Pop-Location
}
