# Diagnóstico release — Training ProgLine (Expo / React Native)

> **Nota:** Este proyecto **no es Flutter**. Usa **Expo SDK 56 + React Native**. Los comandos de compilación son npm/EAS/Gradle, no `flutter build`.

## Problemas encontrados

| Problema | Causa raíz | Archivos |
|----------|------------|----------|
| Login falla en Google Play pero funciona en local | El script de build carga `.env` antes de `expo prebuild`. Si `.env` tiene `localhost` o claves de desarrollo, Metro embebía esa URL en el bundle release | `scripts/build-android-aab.ps1`, `app.config.js`, `constants/supabaseConfig.ts` |
| Pantalla de carga infinita al abrir la app | `useAuth.init()` no tenía `try/catch/finally`; un error en `getSession()` o `fetchUserProfile()` dejaba `isLoading=true` para siempre | `hooks/useAuth.tsx`, `app/index.tsx` |
| Login se queda cargando tras credenciales correctas | `signIn()` y `login.tsx` no liberaban `loading` si `loadUserFromSupabase` lanzaba excepción | `hooks/useAuth.tsx`, `app/auth/login.tsx` |
| Sin visibilidad de errores en release | No había logs seguros ni manejadores globales de errores JS | `lib/releaseDiagnostics.ts`, `app/_layout.tsx` |
| Riesgo R8/ProGuard en módulos nativos | Reglas mínimas; posible impacto en AsyncStorage/OkHttp/WebView | `scripts/android-proguard-rules.pro` |

## Soluciones aplicadas

1. **Configuración única y segura de Supabase**
   - Validación en `constants/supabaseConfigValidation.ts` (HTTPS, no localhost, no `service_role`).
   - Sanitización con fallback a producción embebida si `.env` es inválido.
   - `app.config.js` aplica la misma lógica en tiempo de build.

2. **Autenticación robusta**
   - Timeouts: init 20s, perfil 15s, login 25s.
   - `try/catch/finally` en init, signIn, login UI.
   - Fallback de perfil si falla la tabla `Perfil`.
   - Pantalla de error con botón **Reintentar** en `app/index.tsx`.

3. **Diagnóstico release**
   - Logs JSON con host/clave enmascarados (`lib/releaseDiagnostics.ts`).
   - Manejadores globales de errores JS y promesas rechazadas.

4. **Android release**
   - Reglas ProGuard ampliadas (AsyncStorage, OkHttp, WebView).
   - Advertencias en build si `.env` apunta a red local.

5. **Tests**
   - `tests/supabaseConfig.test.ts` (validación, sanitización, timeout).

## Configuración necesaria para producción

### Variables de entorno (desarrollo local)

Copia `.env.example` → `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://nsdurlikkuoxqobabixr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…
```

**No uses** `SUPABASE_SERVICE_ROLE_KEY` en la app móvil.

### EAS Build (nube)

`eas.json` ya define `EXPO_PUBLIC_SUPABASE_*` en el perfil `production`.

### Supabase Dashboard (manual)

1. **Authentication → URL Configuration**
   - Site URL: tu dominio web o `http://localhost:3000` solo para desarrollo web.
   - Redirect URLs: incluir deep link `programaciones-online://**` para la app nativa.

2. **Usuarios existentes**
   - Email debe estar **confirmado** (`email not confirmed` bloquea login en producción).

3. **RLS a revisar si el perfil no carga** (no modificado desde código):
   - Tabla `Perfil`: `SELECT` para `auth.uid() = id`.
   - Tabla `user_programs`: `SELECT` para el usuario autenticado.

Ver `supabase/AUTH_SETUP.md` para confirmación de email.

## Comandos de compilación (Windows PowerShell)

### Instalar dependencias

```powershell
cd C:\Users\Usuario\Webs\APPS\Programaciones
npm install
```

### Análisis y tests

```powershell
npm run typecheck
npm test
```

### AAB para Google Play (build local)

```powershell
npm run build:android:local
```

Equivalente a:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-android-aab.ps1
```

### EAS Build (alternativa en nube)

```powershell
npx eas build --platform android --profile production
```

### Verificar Supabase en el AAB generado

```powershell
npm run verify:aab
```

## Rutas de artefactos generados

| Artefacto | Ruta |
|-----------|------|
| AAB (copia final) | `dist/training-progline.aab` |
| AAB (Gradle) | `C:\tp\android\app\build\outputs\bundle\release\app-release.aab` |
| APK release (si generas manualmente) | `C:\tp\android\app\build\outputs\apk\release\app-release.apk` |

Para generar APK release manualmente tras prebuild:

```powershell
cd C:\tp\android
.\gradlew.bat assembleRelease
```

## Instalar APK con ADB

```powershell
adb install -r C:\tp\android\app\build\outputs\apk\release\app-release.apk
```

## Consultar logs en release (ADB)

```powershell
adb logcat -s ReactNativeJS:V *:S
```

Filtrar diagnósticos de la app:

```powershell
adb logcat | Select-String "TrainingProgLine"
```

Busca eventos como `auth_init_start`, `auth_sign_in_ok`, `auth_init_failed`.

## Qué comprobar en Google Play Console

- **App bundle** subido corresponde a `com.trainingprogline.app`.
- **versionCode** incrementado respecto a la versión anterior.
- **Prueba interna/cerrada** antes de producción.
- No subir builds de prueba a producción hasta validar login en dispositivo físico.

## Cambios pendientes manuales

- [ ] Confirmar en Supabase que usuarios de prueba tienen email verificado.
- [ ] Añadir `programaciones-online://**` en Redirect URLs si usas deep links de auth.
- [ ] Revisar políticas RLS de `Perfil` si tras login el perfil aparece vacío pero la sesión es válida.
- [ ] **No subir a producción** hasta probar el AAB en un dispositivo real con red móvil.

## Archivos modificados en esta corrección

- `constants/supabaseConfigValidation.ts` (nuevo)
- `constants/supabaseConfig.ts`
- `lib/supabaseConfig.runtime.ts`
- `lib/supabase.ts`
- `lib/withTimeout.ts` (nuevo)
- `lib/releaseDiagnostics.ts` (nuevo)
- `hooks/useAuth.tsx`
- `app/_layout.tsx`
- `app/index.tsx`
- `app/auth/login.tsx`
- `lib/profileService.ts`
- `app.config.js`
- `scripts/android-proguard-rules.pro`
- `scripts/build-android-aab.ps1`
- `tests/supabaseConfig.test.ts` (nuevo)
- `package.json`
