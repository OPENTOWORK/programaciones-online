# Configuración Supabase — Recuperar contraseña

## 1. Añadir URL de redirección (obligatorio)

En [Supabase Dashboard](https://supabase.com/dashboard/project/nsdurlikkuoxqobabixr/auth/url-configuration):

**Redirect URLs** — añade:

```
http://localhost:8082/auth/update-password
```

Si despliegas en producción, añade también tu dominio:

```
https://tu-dominio.com/auth/update-password
```

## 2. Límite de emails

El plan gratuito de Supabase envía **pocos correos por hora**. Si ves el error *"rate limit exceeded"*, espera 15–60 minutos antes de volver a intentarlo.

## 3. Revisar spam

Los emails salen de `noreply@mail.app.supabase.co`. Revisa la carpeta de spam.

## 4. SMTP propio (recomendado para producción)

Settings → Authentication → SMTP Settings → configura tu servidor (Gmail, SendGrid, Resend, etc.) para envíos fiables.

## 5. Emails registrados en este proyecto

- `direccion@opentowork.com`
- `carlos.garcia@hotmail.com`

Usa **exactamente** el email con el que te registraste al solicitar recuperación.
