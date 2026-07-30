param(
  [string]$GradlePropertiesPath = "C:\tp\android\gradle.properties",
  [string]$ProguardRulesPath = "C:\tp\android\app\proguard-rules.pro",
  [string]$ProguardTemplatePath = ""
)

$ErrorActionPreference = "Stop"

if ($ProguardTemplatePath -eq "") {
  $ProguardTemplatePath = Join-Path $PSScriptRoot "android-proguard-rules.pro"
}

if (-not (Test-Path $GradlePropertiesPath)) {
  throw "No se encontro $GradlePropertiesPath"
}

$lines = Get-Content $GradlePropertiesPath
$settings = @{
  "android.enableMinifyInReleaseBuilds" = "true"
  "android.enableShrinkResourcesInReleaseBuilds" = "true"
}

foreach ($key in $settings.Keys) {
  $pattern = "^\s*$([regex]::Escape($key))="
  $replacement = "$key=$($settings[$key])"
  $index = 0..($lines.Count - 1) | Where-Object { $lines[$_] -match $pattern } | Select-Object -First 1
  if ($null -ne $index) {
    $lines[$index] = $replacement
  } else {
    $lines += $replacement
  }
}

Set-Content -Path $GradlePropertiesPath -Value $lines
Write-Host "R8 activado en gradle.properties"

if (Test-Path $ProguardTemplatePath) {
  Copy-Item $ProguardTemplatePath $ProguardRulesPath -Force
  Write-Host "Reglas ProGuard actualizadas"
}
