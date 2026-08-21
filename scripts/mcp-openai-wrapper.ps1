$ErrorActionPreference = 'Stop'

$root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $root '.env'

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    if ($_ -match '^\s*(?<key>[^=]+)=(?<value>.*)$') {
      $key = $matches.key.Trim()
      $value = $matches.value.Trim()
      Set-Item -Path "Env:$key" -Value $value
    }
  }
}

if (-not $env:OPENAI_API_KEY) {
  Write-Error 'Falta OPENAI_API_KEY en .env'
}

& npx -y @fre4x/openai @args
