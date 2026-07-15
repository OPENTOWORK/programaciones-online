# Publicación en Google Play

## Datos de la app

| Campo | Valor |
| --- | --- |
| Nombre en Play Console | Training ProgLine |
| Nombre del paquete | `com.trainingprogline.app` |
| Versión | 1.0.0 (versionCode 1) |
| Política de privacidad (URL pública) | `https://tufitmentor360.github.io/programaciones-online/privacy.html` |

En Google Play Console, en **Nombre del paquete**, escribe exactamente:

```text
com.trainingprogline.app
```

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
