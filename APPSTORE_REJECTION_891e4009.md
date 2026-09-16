# Respuesta al rechazo de App Review — Submission ID `891e4009-0501-43c0-b00e-41f57d1c122c`

Revisión del 15 de septiembre de 2026 · Versión 1.0 (9) · iPad Air 11" (M3)

Tres motivos de rechazo. Dos se arreglan **en App Store Connect** (no en el código) y uno
se ha arreglado **en el código**. Este documento tiene el detalle de cada uno y los textos
listos para copiar y pegar en la respuesta a App Review.

---

## 1. Guideline 5.1.1(v) — Falta el borrado de cuenta

**Arreglado y ya desplegado en producción.** La app ya no necesita la web para borrar la cuenta.

### Qué se ha añadido

| Archivo | Qué hace |
| --- | --- |
| `supabase/account-deletion.sql` | Función `public.delete_own_account()` (`security definer`) y las políticas de Storage que permiten al usuario borrar sus propios ficheros. |
| `scripts/apply-account-deletion.mjs` | Aplica y verifica la migración (`npm run supabase:account-deletion`). |
| `scripts/test-account-deletion.mjs` | Prueba de punta a punta (`npm run test:account-deletion`). |
| `lib/accountDeletionService.ts` | Borra los ficheros de Storage y llama a la función. |
| `app/profile/delete-account.tsx` | Pantalla de borrado con doble confirmación. |

Se resolvió con una función de base de datos en vez de una Edge Function porque el
despliegue de funciones necesita un `SUPABASE_ACCESS_TOKEN` que no está configurado,
mientras que la migración solo necesita acceso a la base. La función no acepta parámetros:
la identidad sale de `auth.uid()`, así que un usuario solo puede borrarse a sí mismo.
`anon` no tiene permiso de ejecución.

El borrado es **inmediato y permanente**: no hay desactivación temporal, ni hace falta
llamar ni escribir a soporte. Primero el cliente borra los ficheros del usuario por la
Storage API (fotos de progreso, vídeos, notas de voz, PDFs, adjuntos), y después la
función borra el usuario de `auth.users`; el resto de tablas cuelgan de ahí con
`on delete cascade`, incluidas las del propio esquema `auth` (identidades y sesiones).

> Supabase **bloquea el `DELETE` directo sobre `storage.objects`** ("Direct deletion from
> storage tables is not allowed"), así que los ficheros tienen que borrarse por la Storage
> API desde el cliente. Por eso la migración añade políticas de borrado propio en
> `athlete-plan-pdfs` y `feedback-media`, donde antes solo podía borrar el entrenador.

Si el usuario es propietario de un gimnasio, el gimnasio no se borra: se desvincula
(`gyms.owner_user_id` es `on delete set null`) para no dejar sin datos al resto del equipo.

### Verificación ejecutada

`npm run test:account-deletion` crea un usuario desechable, le siembra perfil, un registro
de entrenamiento y una foto real en Storage, inicia sesión como él y ejecuta el mismo flujo
que la app. Resultado: **13/13 comprobaciones OK**, incluyendo que `auth.users`, `Perfil`,
`workout_logs`, `fotos`, `storage.objects`, `auth.identities` y `auth.sessions` quedan
vacíos, que el token antiguo pasa a ser rechazado y que `anon` no puede llamar a la función.

### Dónde está el botón (esto hay que indicarlo en las Review Notes)

Tres puntos de entrada, según el tipo de cuenta:

- **Atleta y entrenador (móvil):** pestaña **Perfil** → botón rojo **Eliminar cuenta** al
  final de la pantalla, justo debajo de *Cerrar sesión*. También como enlace en el pie.
- **Entrenador (escritorio/web):** barra lateral → **Eliminar cuenta**, debajo de *Cerrar sesión*.
- **Gimnasio:** menú lateral del panel → **Eliminar cuenta**, debajo de *Cerrar sesión*.

### Flujo

1. Pantalla que enumera exactamente qué se va a borrar.
2. Hay que escribir **BORRAR** para habilitar el botón.
3. Modal de confirmación con una casilla que hay que marcar.
4. Se borra todo, se cierra la sesión y se vuelve al login.

> **Antes de reenviar:** graba el vídeo de pantalla en un iPhone físico
> (crear cuenta → Perfil → Eliminar cuenta → flujo completo). Apple lo pide
> explícitamente y hay que adjuntarlo en *App Review Information → Notes*.
> La parte de servidor ya está desplegada, no hay que hacer nada más ahí.

---

## 2. Guideline 5.1.2(i) — ATT y datos para seguimiento

**No hay que tocar el código: hay que corregir la etiqueta de privacidad en App Store Connect.**

La app **no hace tracking** en ninguna plataforma. Comprobado en el proyecto:

- No existe `AppTrackingTransparency` ni `expo-tracking-transparency` (y por tanto no debe pedirse permiso ATT).
- No hay ningún SDK de publicidad, analítica ni data brokers.
- No hay `expo-location` ni `expo-contacts`: la app **no accede a ubicación ni a contactos**.
- No se procesan pagos en la app, así que no se recoge información de pago.
- `app.json` ya declaraba `NSPrivacyTracking: false` y `NSPrivacyTrackingDomains: []`.

El problema es que la ficha de **App Privacy** en App Store Connect está marcada como
*"Used to Track You"* y además declara tipos de datos que la app no recoge. Al pedir
permiso ATT con `NSPrivacyTracking: false` habría una contradicción, así que la solución
correcta es la primera de las tres que ofrece Apple: **actualizar la etiqueta de privacidad**.

### Qué se ha ajustado en el código

`app.json` → `expo.ios.privacyManifests.NSPrivacyCollectedDataTypes` estaba vacío, lo que
era inexacto. Ahora declara lo que la app sí recoge, todo con
`NSPrivacyCollectedDataTypeTracking: false` y con la finalidad *App Functionality*:

nombre, email, teléfono, User ID, datos de fitness, datos de salud, fotos o vídeos,
audio, otro contenido del usuario y datos de atención al cliente.

### Qué hay que cambiar en App Store Connect (App Privacy)

Hace falta rol de **Account Holder** o **Admin**.

1. Marca **"No, we do not use data for tracking purposes"** en todos los tipos de datos.
2. Deja declarados **solo** estos tipos, todos con finalidad *App Functionality* y
   *Linked to the user*, y **ninguno** usado para seguimiento:

   | Tipo de dato | Para qué |
   | --- | --- |
   | Name | Perfil del usuario |
   | Email Address | Cuenta y login |
   | Phone Number | Ficha de socio del gimnasio |
   | User ID | Identificador de cuenta |
   | Fitness | Entrenamientos, sesiones y marcas |
   | Health | Medidas corporales, lesiones y limitaciones |
   | Photos or Videos | Fotos de progreso y vídeos de ejercicios |
   | Audio Data | Notas de voz de feedback |
   | Other User Content | Notas, comentarios y mensajes con el entrenador |
   | Customer Support | Solicitudes de soporte |

3. **Quita** todos los demás: Coarse Location, Precise Location, Payment Info,
   Demographics, Sensitive Info, Contacts, Device ID, Advertising Data,
   Product Interaction, Other Usage Data, Crash Data, Performance Data,
   Other Diagnostic Data, Emails or Text Messages, Physical Address,
   Other Contact Info, Other Data Types.

### Texto para responder a App Review

> Training ProgLine does not track users on any platform. The app contains no
> advertising SDKs, no third-party analytics, and no data broker integrations, and it
> never links user data with third-party data for advertising purposes. It also does not
> access location or contacts. For this reason the app does not present an App Tracking
> Transparency prompt, and its privacy manifest declares `NSPrivacyTracking: false`.
>
> The "used to track you" setting in our App Privacy information was filled in by
> mistake, along with several data types the app does not collect. We have corrected the
> App Privacy information in App Store Connect: all data types are now declared as "Not
> used for tracking" and only the data the app actually collects is listed (name, email
> address, phone number, user ID, fitness, health, photos or videos, audio data, other
> user content, and customer support), all of it used solely for App Functionality.

---

## 3. Guideline 2.1(b) — Información sobre el modelo de negocio

**No hay compras dentro de la app.** Aun así había un riesgo: la app mostraba precios
(`5,99 € / mes`, `9,99 € / mes`, `15,99 € / mes`) y un botón **Comprar** para las
programaciones del catálogo, sin pasarela y sin In-App Purchase. Eso es justo lo que
disparó la pregunta de Apple y podría provocar un rechazo por 3.1.1 más adelante.

### Qué se ha cambiado en el código

`lib/storeCompliance.ts` introduce `SHOW_CATALOG_PRICING`, que es `false` en iOS. En iOS:

- No se muestran precios de contenido digital en ninguna tarjeta del catálogo.
- El botón **Comprar** se sustituye por **Cómo conseguir acceso**, que explica que el
  acceso lo activa el entrenador o el gimnasio desde su panel.
- No se añade ningún enlace externo de compra (eso también lo prohíbe Apple).

Android y web mantienen el comportamiento anterior.

### Respuestas a las cinco preguntas

**1. ¿Quiénes son los usuarios que usarán las suscripciones de pago de la app?**

> There are no paid subscriptions available to end users inside the iOS app. Training
> ProgLine is a B2B2C coaching platform: gyms and personal trainers subscribe to the
> service through a commercial agreement with us, outside of any app, and they then use
> the app to manage their own athletes. Athletes use the app for free; their access is
> granted by their trainer or gym from the trainer/gym panel.

**2. ¿Dónde pueden los usuarios comprar las suscripciones a las que se accede en la app?**

> Nowhere from the app. Gym and trainer subscriptions are sold business-to-business
> (direct invoicing between our company and the gym or trainer). There is no purchase
> flow, no payment form, no payment processor and no external purchase link anywhere in
> the iOS app. The `gym_subscriptions` records the app reads are internal administrative
> records that we create manually after signing a contract with a gym; they are only
> visible to that gym's own administrators as read-only status information.

**3. ¿A qué tipos de suscripciones ya compradas puede acceder un usuario en la app?**

> None purchased by the user. A gym administrator can see the status of the B2B plan
> their gym has contracted with us (trial / active / suspended), which is read-only
> information about our commercial agreement. Athletes have no subscription of any kind
> in the app.

**4. ¿Qué contenido, suscripciones o funciones de pago se desbloquean en la app sin usar In-App Purchase?**

> None. Every feature in the iOS app is available at no charge to the signed-in user.
> Athlete access to training programs is not a purchase: it is an assignment made by
> their trainer or gym, exactly like a coach handing out a training plan. In this build
> we also removed all prices and the "Buy" button from the iOS app so there is no paid
> digital content surface at all.
>
> The gym management module additionally handles memberships and point-of-sale for
> physical goods and in-person services (gym membership fees, in-person classes, drinks,
> apparel). Those are recorded by gym staff as bookkeeping entries for transactions that
> happen physically at the gym; no payment is ever taken inside the app.

**5. ¿Cuál es el número máximo de usuarios que pueden participar en los servicios en vivo y en tiempo real de la app?**

> The app has no live, real-time streaming or group video service. The only real-time
> features are text chat between an athlete and their own trainer (one-to-one) and a gym
> chat between a gym and its own members (one-to-one). There is no group broadcast, no
> live video, and no many-to-many session. The maximum number of participants in any
> real-time conversation is therefore 2.
>
> The "Launch to TV" screen simply displays the workout of the day on a screen inside
> the gym; it is a read-only display, not a live service with participants.

---

## Checklist antes de reenviar

- [x] Migración de borrado de cuenta aplicada en producción (`npm run supabase:account-deletion`).
- [x] Borrado probado de punta a punta (`npm run test:account-deletion`, 13/13).
- [ ] Corregir la ficha de **App Privacy** en App Store Connect (sección 2 de este documento).
- [x] `codemagic.yaml` → `APP_STORE_VERSION: "1.0"`, para que el build entre en la versión
      rechazada en vez de crear una nueva. El build number lo asigna Codemagic
      (`PROJECT_BUILD_NUMBER`) y solo tiene que ser mayor que `9`.
      `app.json` se queda en `1.0.15` porque esa versión la comparten Android y web.
- [ ] Grabar el vídeo del borrado de cuenta en un iPhone físico y adjuntarlo en
      *App Review Information → Notes*.
- [ ] En las Review Notes, indicar dónde está el botón de eliminar cuenta:
      *"Account deletion: Profile tab → 'Eliminar cuenta' button at the bottom of the screen."*
- [ ] Responder al rechazo en App Store Connect con los textos de las secciones 2 y 3.
- [ ] Credenciales de la cuenta demo actualizadas en *App Review Information*.
