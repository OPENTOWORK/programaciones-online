# Publicación en Google Play

## Datos de la app

| Campo | Valor |
| --- | --- |
| Nombre en Play Console | Training ProgLine |
| Nombre del paquete | `com.trainingprogline.app` |
| Versión | 1.0.15 (versionCode 16) |
| Política de privacidad (URL pública) | `https://carlosgarciacano87-dev.github.io/app-progras/privacy.html` |
| Eliminación de cuenta (URL pública) | `https://carlosgarciacano87-dev.github.io/app-progras/account-deletion.html` |

En Google Play Console, en **Nombre del paquete**, escribe exactamente:

```text
com.trainingprogline.app
```

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

## Política de fotos y vídeos (Google Play)

La app **no declara** `READ_MEDIA_IMAGES` ni `READ_MEDIA_VIDEO`. En Android se usa el selector del sistema (Photo Picker) y esos permisos están bloqueados en `app.json` → `android.blockedPermissions`.

Si Play Console muestra un rechazo por permisos de medios, sube un nuevo `.aab` generado después de ese cambio.

## Optimización R8 (Google Play)

Play Console puede mostrar avisos de "optimización baja" si el bundle no usa R8. No bloquea la publicación, pero el script de build ya activa:

- `android.enableMinifyInReleaseBuilds=true` (ofuscación R8)
- `android.enableShrinkResourcesInReleaseBuilds=true` (reducción de recursos)

En el próximo `npm run build:android:local` el informe debería mejorar.

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
