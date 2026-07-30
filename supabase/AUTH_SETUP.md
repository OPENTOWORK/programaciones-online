# Configuración Supabase — Auth (confirmación email y recuperar contraseña)

Proyecto: [Supabase Dashboard](https://supabase.com/dashboard/project/nsdurlikkuoxqobabixr/auth/url-configuration)

## 1. Site URL

Producción (web pública):

```text
https://trainingprogline.es
```

Desarrollo local (`npm run dev`):

```text
http://localhost:3000
```

Arranca la app con:

```bash
npm run dev
```

Abre **http://localhost:3000** (no 8082).

## 2. Redirect URLs — añade todas estas

```text
https://trainingprogline.es/**
https://trainingprogline.es/auth/confirm-email
https://trainingprogline.es/auth/update-password
https://programaciones-online.vercel.app/**
https://programaciones-online.vercel.app/auth/confirm-email
https://programaciones-online.vercel.app/auth/update-password
http://localhost:3000/**
http://localhost:3000/auth/confirm-email
http://localhost:3000/auth/update-password
programaciones-online://**
programaciones-online://auth/confirm-email
programaciones-online://auth/update-password
programaciones-online:///auth/confirm-email
programaciones-online:///auth/update-password
```

La app nativa genera redirects con el scheme `programaciones-online` y path `/auth/confirm-email` o `/auth/update-password`. Expo Linking puede producir URLs con dos o tres barras (`://` vs `:///`); Supabase debe aceptar ambas variantes.

## 2.1 Android / iOS (deep links)

En **Authentication → URL Configuration → Redirect URLs** incluye como mínimo:

```text
programaciones-online://**
programaciones-online:///auth/confirm-email
programaciones-online:///auth/update-password
```

No cambies la **Site URL** desde código; mantén la URL web de producción o desarrollo según tu entorno.

## 3. Confirmar email — pasos

1. `npm run dev` (app en marcha en localhost:3000)
2. Regístrate en la app
3. Abre el enlace del email **con la app ya corriendo**
4. Deberías entrar directamente (el `#access_token=...` de la URL confirma el email)

Si el enlace caduca, usa **Reenviar email** en `/auth/confirm-email`.

## 4. Límite de emails

Plan gratuito: pocos correos/hora. Si ves *rate limit*, espera 15–60 min.

## 5. Spam

Revisa spam: `noreply@mail.app.supabase.co`

## 6. SMTP propio (producción)

Settings → Authentication → SMTP Settings
