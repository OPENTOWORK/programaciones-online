# Registra una tarea de Windows que sincroniza AimHarder cada domingo a las 22:00.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/register-weekly-sync-task.ps1

$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$TaskName = 'Programaciones-AimHarder-WeeklySync'
$LogDir = Join-Path $ProjectRoot 'logs'
$LogFile = Join-Path $LogDir 'aimharder-weekly-sync.log'

if (-not (Test-Path $LogDir)) {
  New-Item -ItemType Directory -Path $LogDir | Out-Null
}

$NodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $NodeCommand) {
  throw 'No se encontró Node.js en el PATH. Instálalo o añádelo al PATH antes de registrar la tarea.'
}
$NodePath = $NodeCommand.Source

$WrapperScript = Join-Path $ProjectRoot 'scripts\run-weekly-sync-task.cmd'
$WrapperContent = @"
@echo off
cd /d "$ProjectRoot"
echo [%date% %time%] Inicio sync semanal AimHarder>> "$LogFile"
"$NodePath" scripts\run-weekly-aimharder-sync.mjs >> "$LogFile" 2>&1
echo [%date% %time%] Fin sync (exit %ERRORLEVEL%)>> "$LogFile"
exit /b %ERRORLEVEL%
"@

Set-Content -Path $WrapperScript -Value $WrapperContent -Encoding ASCII

$Action = New-ScheduledTaskAction -Execute $WrapperScript -WorkingDirectory $ProjectRoot
$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At '22:00'
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

$Existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($Existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Principal $Principal `
  -Description 'Sincroniza la programacion Hype / Intensivas desde AimHarder cada domingo a las 22:00.' | Out-Null

Write-Host "Tarea registrada: $TaskName"
Write-Host "Horario: domingos a las 22:00 (hora local)"
Write-Host "Proyecto: $ProjectRoot"
Write-Host "Log: $LogFile"
Write-Host ""
Write-Host "Prueba manual: npm run aimharder:sync:weekly"
