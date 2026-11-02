# Publicación en Google Play

## Datos de la app

| Campo | Valor |
| --- | --- |
| Nombre en Play Console | Training ProgLine |
| Nombre del paquete | `com.trainingprogline.app` |
| Versión | 1.0.20 (versionCode 21) |
| Política de privacidad (URL pública) | `https://carlosgarciacano87-dev.github.io/app-progras/privacy.html` |
| Eliminación de cuenta (URL pública) | `https://carlosgarciacano87-dev.github.io/app-progras/account-deletion.html` |

En Google Play Console, en **Nombre del paquete**, escribe exactamente:

```text
com.trainingprogline.app
```

## Gráficos de la ficha (logo actual)

El logotipo (TP · PROGLINE) está en vectorial en `assets/brand/` (`progline-mark.svg`, `progline-logo.svg`, `progline-logo-compact.svg`). Si lo cambias, regenera iconos y gráficos de Play Store:

```bash
npm run assets:playstore
```

Archivos generados:

| Archivo | Uso en Play Console |
| --- | --- |
| `assets/playstore/store-icon-512.png` | Icono de la app (512×512) en **Ficha de Play Store** |
| `assets/playstore/feature-graphic.png` | Gráfico destacado (1024×500) |
| `assets/icon.png` | Icono empaquetado en el `.aab` (se actualiza al generar un build nuevo) |

Las capturas de pantalla con mockup de teléfono se suben manualmente en **Ficha de Play Store → Capturas de pantalla**. Hazlas desde la app ya desplegada con el logo nuevo (web o build de prueba).

## Subir a Google Play (paso a paso)

1. Genera el bundle actualizado:

```bash
npm run build:android:local
```

2. El archivo a subir queda en:

```text
dist/training-progline.aab
```

3. En [Google Play Console](https://play.google.com/console):
   - Abre **Training ProgLine**
   - Ve a **Producción** o **Prueba interna**
   - **Crear nueva versión**
   - Arrastra `dist/training-progline.aab`
   - Guarda y envía a revisión

4. Comprueba que en la ficha de la app tengas estas URLs:
   - Política de privacidad: `https://carlosgarciacano87-dev.github.io/app-progras/privacy.html`
   - Eliminación de cuenta: `https://carlosgarciacano87-dev.github.io/app-progras/account-deletion.html`

## Opción recomendada: build en la nube (EAS)

1. Inicia sesión en Expo:

```bash
npx eas-cli login
```

2. Genera el bundle:

```bash
npm run build:android
```

3. Cuando termine, EAS te dará un enlace para **descargar el `.aab`**.

4. Súbelo en Play Console → **Producción / Prueba interna** → **Crear nueva versión**.

## Actualización obligatoria (Android)

Cuando publiques una versión nueva, los usuarios con una versión antigua verán una pantalla de bloqueo (**Oye, actualiza**) que les lleva a Google Play.

1. Sube el `.aab` nuevo a Play Console y espera a que la versión esté disponible.
2. Activa el bloqueo en Supabase (usa la versión de `app.json`):

```bash
npm run android:require-update
```

Eso marca `1.0.20` (build `21`) como mínima obligatoria. Quien tenga una versión anterior no podrá entrar hasta actualizar.

Para preparar solo el mensaje y la versión disponible sin bloquear todavía:

```bash
npm run supabase:app-updates
```

## Política de fotos y vídeos (Google Play)

La app **no declara** `READ_MEDIA_IMAGES` ni `READ_MEDIA_VIDEO`. En Android se usa el selector del sistema (Photo Picker) y esos permisos están bloqueados en `app.json` → `android.blockedPermissions`.

Si Play Console muestra un rechazo por permisos de medios, sube un nuevo `.aab` generado después de ese cambio.

## Avisos de Play Console (Android 15/16)

Estos avisos salen en el panel de la versión. No bloquean la publicación.

| Aviso | Qué hacemos |
| --- | --- |
| APIs obsoletas de barras (`setStatusBarColor`, `setNavigationBarColor`) | El plugin `plugins/withAndroidPlayCompatibility.js` quita `android:statusBarColor` y `android:navigationBarColor` del tema. La app ya usa edge-to-edge + `expo-status-bar` solo para el color de iconos. Parte del aviso puede seguir saliendo por `expo-image-picker` (Android Image Cropper). |
| Orientación `PORTRAIT` en pantallas grandes | El mismo plugin elimina `android:screenOrientation` de `MainActivity`. iOS sigue en vertical. |
| Optimización de mapas de bits | Viene de React Native (Fresco), Glide y `expo-file-system`. No es código nuestro; no se puede quitar sin cambiar el runtime. |
| R8 / AGP 9 | El build activa minify, shrink, `android.r8.optimizedResourceShrinking` y R8 full mode. Expo 56 usa AGP **8.12**; no se puede subir a AGP 9 sin romper el prebuild. |

## Opción local (Windows)

Requisitos: JDK 17, Android SDK.

```bash
npm run build:android:local
```

El archivo quedará en:

```text
dist/training-progline.aab
```

## Firma de la app

La primera vez, el script local crea:

- `android/app/release.keystore`
- `android/keystore.properties`

**Guarda una copia segura del keystore.** Si lo pierdes, no podrás actualizar la app en Play Store con la misma clave.

## Variables de entorno

La build incluye las variables públicas de Supabase desde `eas.json` (build en nube) o desde tu `.env` (build local).
