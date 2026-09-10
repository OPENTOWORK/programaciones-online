# Apple Encryption Compliance - Training ProgLine

## App

Training ProgLine

## Bundle ID

`com.trainingprogline.app`

Confirmado en `app.json` (`expo.ios.bundleIdentifier`). No se encontró otro Bundle Identifier de iOS en el repositorio. El paquete Android usa el mismo identificador (`com.trainingprogline.app`), pero eso no afecta a iOS.

No existe carpeta `ios/` nativa ni `Info.plist` generado en el repositorio (proyecto Expo managed). La clave se inyectará en el `Info.plist` durante el prebuild/EAS Build a partir de `app.json`.

## Encryption analysis

Análisis realizado sobre el código fuente de la aplicación, dependencias de producción en `package.json`, `app.json`, `app.config.js`, `eas.json`, funciones de Supabase invocadas desde la app y búsqueda en el repositorio de términos como `crypto`, `encrypt`, `AES`, `RSA`, `SHA`, `bcrypt`, `libsodium`, `expo-crypto`, `SecureStore`, `JWT`, `OAuth` y `WebCrypto`.

### Resumen técnico

La app **no implementa cifrado propio** ni algoritmos criptográficos personalizados en el código de la aplicación.

El cifrado que utiliza se limita, en la práctica, a:

1. **Comunicaciones de red protegidas por HTTPS/TLS** hacia Supabase y otros servicios externos.
2. **Autenticación estándar de Supabase** (email/contraseña, confirmación de email, recuperación de contraseña, refresco de sesión JWT) delegada en el SDK oficial `@supabase/supabase-js`.
3. **APIs criptográficas del sistema expuestas al runtime** para operaciones auxiliares no criptográficas, como generación de contraseñas aleatorias.
4. **TLS del sistema operativo** en `fetch`, WebView y almacenamiento en la nube de Supabase.

No se encontró en el código de la app:

- Cifrado local de ficheros o bases de datos con AES/RSA propio.
- Uso de `expo-secure-store`, `expo-crypto`, `react-native-crypto`, `libsodium`, `bcrypt` ni `node:crypto` en el bundle de la aplicación.
- OAuth de terceros (Google, Apple Sign In, etc.) en el cliente.
- Implementación manual de JWT, HMAC, hashing de contraseñas o PKCE en código propio.

## Network encryption

Conexiones HTTPS/TLS identificadas en el cliente:

| Destino | Uso |
| --- | --- |
| `https://nsdurlikkuoxqobabixr.supabase.co` | API REST, Auth, Storage, Edge Functions (Supabase) |
| `https://trainingprogline.es` | Redirecciones de autenticación y enlaces de producción |
| `https://www.youtube.com` / `https://www.youtube-nocookie.com` | Vídeos de ejercicios embebidos en WebView |
| `https://i.ytimg.com` | Miniaturas de vídeos de YouTube |
| `https://meet.jit.si` | Enlaces de videollamada opcionales |
| `https://wa.me/...` | Enlaces externos a WhatsApp |
| `https://play.google.com/...` | Enlace a la app Android en tienda |

Las subidas y descargas de archivos (fotos, vídeos, audios, PDFs, imágenes de tienda) se realizan contra **Supabase Storage** mediante el SDK, sobre HTTPS. Las URLs firmadas (`createSignedUrl`) las genera el backend de Supabase; la app no implementa la firma criptográfica.

Las llamadas `fetch()` locales en la app se usan para leer URIs de archivos del dispositivo o URLs ya obtenidas de Supabase, no para protocolos sin TLS.

## Authentication

Mecanismo de autenticación:

- **Email y contraseña** mediante `supabase.auth.signInWithPassword()` (`lib/authErrors.ts`, `hooks/useAuth.tsx`).
- **Registro** con `supabase.auth.signUp()`.
- **Recuperación de contraseña** con `supabase.auth.resetPasswordForEmail()`.
- **Sesión JWT** gestionada por Supabase Auth, con refresco automático (`autoRefreshToken: true` en `lib/supabase.ts`).
- **Deep links / callbacks** de confirmación de email y recuperación (`lib/authCallback.ts`, `lib/authRedirect.ts`).

Persistencia de sesión en cliente:

- **Web:** `localStorage`.
- **iOS/Android:** `@react-native-async-storage/async-storage`.

**Nota de seguridad (no legal):** la app no usa Keychain (`expo-secure-store`) para guardar tokens; los tokens de sesión se almacenan en AsyncStorage sin cifrado adicional implementado por la aplicación. Esto es relevante para seguridad del producto, pero **no constituye por sí solo una implementación de cifrado no exento** en el sentido habitual de export compliance: la app no cifra esos datos con algoritmos propios.

No hay OAuth social configurado en el código revisado.

## Cryptographic libraries found

### En el código de la aplicación (bundle iOS)

| Elemento | Ubicación | Uso |
| --- | --- | --- |
| `@supabase/supabase-js` | `lib/supabase.ts` y servicios | Cliente oficial; auth y API sobre HTTPS/TLS |
| `crypto.getRandomValues()` | `lib/gymCoachService.ts` (líneas 33-36) | Generación de contraseñas aleatorias para invitaciones de coach; no cifra datos |
| JWT (consumo) | `lib/authSessionRecovery.ts`, `hooks/useAuth.tsx` | Validación/refresco de sesión delegada en Supabase; sin implementación JWT propia |

### Dependencias de producción relevantes

| Paquete | ¿Cripto en app iOS? | Notas |
| --- | --- | --- |
| `@supabase/supabase-js` | Sí (estándar) | Auth y transporte HTTPS |
| `@react-native-async-storage/async-storage` | No | Almacenamiento local sin cifrado propio |
| `react-native-webview` | No directo | TLS del SO para contenido HTTPS embebido |
| `expo-web-browser` | No directo | Apertura de URLs externas en navegador del sistema |
| `pdfjs-dist` | **No en iOS** | Solo web: `lib/pdfjsDocument.web.ts`; en nativo `lib/pdfjsDocument.ts` lanza error y no importa la librería |
| `xlsx` | No identificado | Parseo de hojas de cálculo |

### Solo en scripts / backend (no incluidos en el binario iOS de la app)

| Elemento | Ubicación | Notas |
| --- | --- | --- |
| `node:crypto` | `scripts/generate-and-publish-playstore-screenshots.mjs` | Script de desarrollo |
| `crypt()` / `gen_salt('bf')` | `scripts/create-auth-user.mjs` | Script administrativo contra Postgres |
| `crypto.getRandomValues()` | `supabase/functions/invite-gym-coach/index.ts` | Edge Function en servidor Supabase |
| `node-forge` | `package-lock.json` (transitivo de `@expo/code-signing-certificates`) | Herramienta de build de Expo; no importada desde el código de la app |

### No encontrado en el proyecto de la app

- `expo-crypto`
- `expo-secure-store`
- `react-native-crypto`
- `libsodium` / `tweetnacl`
- `bcrypt` / `scrypt` en código de la app
- `AES`, `RSA`, `SHA` implementados manualmente en TypeScript de la app
- `WebCrypto` / `subtle` usados directamente en código propio

## Apple Export Compliance conclusion

**Conclusión técnica (no legal):** según el código actual revisado, Training ProgLine utiliza **únicamente cifrado estándar/exento** en el sentido habitual para apps que:

- se comunican por **HTTPS/TLS**;
- usan **autenticación de terceros estándar** (Supabase Auth);
- no incorporan **cifrado propio** ni algoritmos adicionales para proteger datos locales o punto a punto.

No se detectó cifrado no exento implementado por el equipo de desarrollo en el código de la aplicación.

**Limitaciones del análisis:**

- No se ha inspeccionado binariamente el IPA final ni cada dependencia transitiva empaquetada por Metro.
- Este documento **no es asesoramiento legal** ni sustituye la revisión de un abogado o consultor de exportación.
- Si en el futuro se añaden pagos con cifrado propio, mensajería E2E, almacenamiento cifrado local, VPN, DRM o SDKs con criptografía propia, habrá que **reanalizar** antes de publicar.

## ITSAppUsesNonExemptEncryption

**Valor configurado:** `false`

**Motivo técnico:** la aplicación no incorpora algoritmos de cifrado no exentos propios; el cifrado presente corresponde a comunicaciones TLS y autenticación estándar vía Supabase.

**Configuración en el proyecto:**

```json
"ios": {
  "bundleIdentifier": "com.trainingprogline.app",
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false
  }
}
```

Archivo: `app.json`

## App Store Connect

Cuando Apple pregunte por el uso de cifrado en **App Store Connect → App Information → App Encryption Documentation** (o equivalente en el flujo de envío), el propietario de la app puede indicar, según el análisis técnico actual:

1. **¿La app usa cifrado?** → **Sí** (TLS estándar en comunicaciones de red).
2. **¿El cifrado está exento o solo usa cifrado estándar?** → **Sí / Solo cifrado estándar** (según las opciones que muestre Apple en ese momento).
3. **¿Está disponible documentación de cumplimiento de exportación (ERN)?** → En el escenario actual, **normalmente no debería requerirse documentación adicional**, porque no se ha detectado cifrado no exento propio. Si Apple cambia el formulario o pide aclaración, consultar asesoramiento legal.

Respuestas orientativas (adaptar al texto exacto de Apple en 2026):

- *Does your app use encryption?* → **Yes**
- *Is your app exempt from export compliance documentation?* / *Does your app qualify for any exemptions?* → **Yes** (encryption limited to standard HTTPS/TLS and authentication)
- *Does your app implement any encryption algorithms that are proprietary or not accepted as standard by international bodies?* → **No**

Tras el build, conviene verificar en el `Info.plist` generado que `ITSAppUsesNonExemptEncryption` sea `false`.

## Riesgos y puntos a vigilar

1. **AsyncStorage para tokens:** mejora de seguridad pendiente si se desea Keychain; no implica por sí sola cifrado no exento.
2. **Nuevas dependencias:** cualquier SDK de pagos, chat E2E, biometría con cifrado propio o `expo-crypto` obligaría a repetir este análisis.
3. **`pdfjs-dist`:** hoy solo en web; si se habilita en iOS, revisar de nuevo.
4. **Edge Functions de Supabase:** ejecutan lógica en servidor; no forman parte del binario iOS salvo las llamadas HTTPS del cliente.
5. **`eas.json`:** actualmente define perfiles de build para Android; al añadir build iOS, mantener `ITSAppUsesNonExemptEncryption` en la configuración de Expo.

---

*Documento generado a partir del análisis del repositorio. Última revisión: 2026-09-10.*
