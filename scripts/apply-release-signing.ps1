param(
  [string]$BuildGradlePath = "C:\tp\android\app\build.gradle"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BuildGradlePath)) {
  throw "No se encontro $BuildGradlePath"
}

$content = Get-Content $BuildGradlePath -Raw

if ($content -notmatch 'keystorePropertiesFile') {
  $keystoreBlock = @"
def keystorePropertiesFile = rootProject.file('keystore.properties')
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

"@
  $content = $content.Replace('android {', ($keystoreBlock + 'android {'))
}

if ($content -notmatch 'signingConfigs\.release') {
  $releaseBlock = @"
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
"@
  $content = $content.Replace("        }`r`n    }`r`n    buildTypes {", "        }`r`n$releaseBlock`r`n    }`r`n    buildTypes {")
  $content = $content.Replace("        }`n    }`n    buildTypes {", "        }`n$releaseBlock`n    }`n    buildTypes {")
}

# Las plantillas de Expo usan "signingConfig signingConfigs.debug" o, desde SDK 56, "signingConfig = signingConfigs.debug".
$content = [regex]::Replace(
  $content,
  '(signingConfig\s*=?\s*)signingConfigs\.debug(\r?\n\s*def enableShrinkResources)',
  '${1}keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug${2}'
)

if ($content -notmatch 'signingConfigs\.release : signingConfigs\.debug') {
  throw "No se pudo aplicar la firma de release en $BuildGradlePath"
}

Set-Content -Path $BuildGradlePath -Value $content -NoNewline
Write-Host "Firma de release aplicada en $BuildGradlePath"
