# Publicación en App Store (iOS)

## Datos de la app

| Campo | Valor |
| --- | --- |
| Nombre en App Store Connect | Training ProgLine |
| Bundle ID | `com.trainingprogline.app` |
| Versión | 1.0.15 (`expo.version`) |
| Build | 1 (`expo.ios.buildNumber`) |
| Política de privacidad (URL pública) | `https://carlosgarciacano87-dev.github.io/app-progras/privacy.html` |
| Eliminación de cuenta (URL pública) | `https://carlosgarciacano87-dev.github.io/app-progras/account-deletion.html` |
| Cifrado | `ITSAppUsesNonExemptEncryption = false` (ver `APPLE_ENCRYPTION_COMPLIANCE.md`) |

## Requisitos previos

1. Cuenta en el **Apple Developer Program** (99 USD/año) con el Team ID a mano.
2. La app creada en [App Store Connect](https://appstoreconnect.apple.com) con el Bundle ID `com.trainingprogline.app`.
3. Sesión iniciada en Expo:

```bash
npx eas-cli login
```

4. Vincular este repositorio con el proyecto de Expo (copia el comando completo desde el dashboard; el ID debe verse entero):

```bash
cd C:\Users\Usuario\Webs\APPS\Programaciones
npx eas-cli init --id TU_PROJECT_ID_AQUI
```

EAS añadirá `extra.eas.projectId` a la configuración. **Ignora** el paso `create-expo-app carlos` del onboarding: ese ejemplo es para proyectos nuevos, no para Training ProgLine.

> El build de iOS se hace **en la nube con EAS**. No hace falta un Mac: los builds locales de iOS sí requieren macOS y Xcode.

## Generar el build de producción

```bash
npm run build:ios
```

Usa el perfil `production` de `eas.json`. EAS pedirá las credenciales de Apple la primera vez y las gestionará por ti (certificado de distribución y perfil de aprovisionamiento).

El resultado es un `.ipa` descargable desde el enlace que devuelve EAS.

Para dejarlo en la carpeta del proyecto (como el `.aab` de Android):

```bash
npm run build:ios:local
```

Archivo generado:

```text
dist/training-progline.ipa
```

## Subir a App Store Connect

```bash
npm run submit:ios
```

EAS pedirá el Apple ID y el `ascAppId` (el número de la app en App Store Connect) si no están configurados. También puedes subir el `.ipa` manualmente con **Transporter** desde un Mac.

Después:

1. Entra en App Store Connect → **Training ProgLine** → **TestFlight** para probar.
2. Cuando esté listo, ve a **App Store** → **Preparar para el envío**, selecciona el build y envía a revisión.

## Builds de prueba

| Comando | Para qué sirve |
| --- | --- |
| `npm run build:ios:simulator` | `.app` para el simulador de iOS (solo con Mac + Xcode) |
| `npm run build:ios:device` | Build ad-hoc de distribución interna, instalable en iPhones registrados |
| `npm run build:ios` | Build de producción para App Store / TestFlight |

Para `ios-device` hay que registrar los dispositivos:

```bash
npx eas-cli device:create
```

## Iconos y assets

El icono de iOS es distinto al de Android porque **Apple rechaza iconos con canal alfa**. Se genera automáticamente aplanado sobre el fondo de marca:

```bash
npm run assets:icons
```

| Archivo | Uso |
| --- | --- |
| `assets/ios-icon.png` | Icono de iOS (1024×1024, sin transparencia) → `expo.ios.icon` |
| `assets/icon.png` | Icono genérico / Android |
| `assets/splash-icon.png` | Splash screen (todas las plataformas) |

## Capturas de pantalla

Las capturas ya generadas para Play Store sirven tal cual para App Store, porque coinciden con los tamaños que pide Apple:

| Tamaño | Dispositivo Apple |
| --- | --- |
| `1284 × 2778` | iPhone 6.7" |
| `1242 × 2688` | iPhone 6.5" |

Están en:

```text
assets/playstore/screenshots/export/1284x2778/
assets/playstore/screenshots/export/1242x2688/
```

Regenerar (requiere Playwright):

```bash
node scripts/generate-and-publish-playstore-screenshots.mjs
```

## Permisos (Info.plist)

Los textos de permiso se inyectan desde los plugins de `app.json`:

| Clave | Origen | Texto |
| --- | --- | --- |
| `NSPhotoLibraryUsageDescription` | `expo-image-picker` → `photosPermission` | Acceso a fotos para el progreso físico |
| `NSCameraUsageDescription` | `expo-image-picker` → `cameraPermission` | Cámara para grabar vídeos de ejercicios |
| `NSMicrophoneUsageDescription` | `expo-image-picker` / `expo-audio` → `microphonePermission` | Micrófono para audio de vídeos y notas de voz |

## Privacy manifest

`app.json` → `expo.ios.privacyManifests` declara las *required reason APIs* que usan las dependencias nativas del proyecto:

| Categoría | Motivos | Origen |
| --- | --- | --- |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | `C617.1`, `0A2A.1`, `3B52.1` | React Native, AsyncStorage, expo-application, expo-file-system |
| `NSPrivacyAccessedAPICategoryUserDefaults` | `CA92.1` | React Native, expo-constants |
| `NSPrivacyAccessedAPICategoryDiskSpace` | `E174.1`, `85F4.1` | expo-file-system |

También se declara `NSPrivacyTracking: false` (la app no hace seguimiento publicitario).

Si Apple envía un correo pidiendo motivos adicionales tras el primer envío, hay que añadirlos en ese mismo bloque.

## Subir de versión

Para cada nueva entrega a App Store hay que subir el build:

- **Misma versión, nuevo build:** incrementa `expo.ios.buildNumber` en `app.json` (`"1"` → `"2"`).
- **Nueva versión pública:** incrementa `expo.version` y reinicia `buildNumber` a `"1"`.

`expo.android.versionCode` es independiente y **no** hay que tocarlo para iOS.

## Qué NO cambia con esta configuración

- **Android:** `expo.android` y la lista de permisos generados son idénticos a antes. `npm run build:android` y `npm run build:android:local` siguen igual.
- **Web:** `expo.web` no cambia. `npm run dev` y `npm run deploy:web` siguen igual.
- **Supabase:** sin cambios en URLs, claves ni variables de entorno.

## Pendiente antes de publicar

1. **`IOS_STORE_URL` en `lib/appVersion.ts`** todavía tiene un ID de ejemplo (`id0000000000`). Cuando App Store Connect asigne el ID real de la app, hay que sustituirlo. Solo afecta al aviso de "actualiza la app" en iOS; no bloquea la publicación de la primera versión.
2. **Ficha de App Store:** descripción, palabras clave, categoría, clasificación por edades y URL de soporte se rellenan a mano en App Store Connect.
3. **App Privacy:** en App Store Connect hay que declarar los datos que recoge la app (email, nombre, fotos/vídeos de progreso, mensajes) y que no se usan para seguimiento.
4. **Cuenta de prueba para el revisor:** Apple exige credenciales de demo si la app requiere login. Prepara un usuario de prueba con datos ya cargados.
