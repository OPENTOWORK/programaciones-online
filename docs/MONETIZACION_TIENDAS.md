# Monetización: Google Play, App Store y Supabase

Training ProgLine · paquete y Bundle ID `com.trainingprogline.app` · Apple ID de la app `6810687197` ·
proyecto Supabase `nsdurlikkuoxqobabixr`.
La única fuente de productos, ids, textos y precios iniciales es `data/store-products.json`.

## Estado (comprobado el 16 de noviembre de 2026)

| Parte | Estado |
| --- | --- |
| App: tienda, «Mis compras», compra, restaurar y varias suscripciones a la vez | Terminada. Comprobada con tests y en la web |
| Base de datos (`supabase/store-purchases.sql`) | Aplicada en producción. 31/31 pruebas reales de RLS y permisos (en transacciones que se deshacen) |
| Catálogo en Supabase | 6 suscripciones creadas y vinculadas a sus programaciones, **solo para pruebas** (`active = false`) |
| Edge Functions `iap-verify`, `iap-google-rtdn` e `iap-apple-notifications` | Desplegadas en producción (ACTIVE, versión 1). No volver a desplegarlas si no cambia su código |
| Secretos de las funciones | Solo los que Supabase crea solo (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`). El token actual puede leerlos y no puede escribir: le falta «Edge Function Secrets» en lectura y escritura |
| Productos en Google Play | **Sin crear**: falta la cuenta de servicio. El script que los crea está listo |
| Productos en App Store Connect | **Sin crear**: falta una clave de la App Store Connect API. El script que los crea está listo |
| Notificaciones (Google RTDN y App Store Server Notifications V2) | Las funciones ya responden. Falta crear el tema de Pub/Sub, enlazarlo en Play Console y poner las dos URL en App Store Connect |
| Android | AAB 1.0.22 (versionCode 23), firmado con la clave de subida y con el permiso `BILLING` |
| iOS | IPA 1.0.22 (1) compilada y firmada en EAS. **Sin subir a TestFlight**: EAS no tiene una clave de la App Store Connect API |
| Codemagic | Tres flujos: desarrollo, TestFlight y App Store. Un push a `main` solo sube a TestFlight |
| Compras reales | **Ninguna todavía**. Las pruebas automáticas usan datos simulados y no sustituyen a una compra en la tienda |

Mientras ningún producto esté a la venta, los usuarios ven la app igual que antes: no se cobra ni se bloquea nada
nuevo. Solo los administradores y los testers ven la tienda y los productos en pruebas.

## Productos

Seis suscripciones mensuales independientes, con renovación automática. Se pueden tener varias a la vez.

| Programación | `product_key` | Google Play (producto / plan base) | Apple Product ID | Precio inicial en España |
| --- | --- | --- | --- | --- |
| Básico | `sub.basico.monthly` | `sub_basico` / `monthly` | `com.trainingprogline.app.sub.basico.monthly` | 9,99 € |
| Calistenia | `sub.calistenia.monthly` | `sub_calistenia` / `monthly` | `com.trainingprogline.app.sub.calistenia.monthly` | 15,99 € |
| ATHX | `sub.athx.monthly` | `sub_athx` / `monthly` | `com.trainingprogline.app.sub.athx.monthly` | 15,99 € |
| Crosstraining | `sub.crosstraining.monthly` | `sub_crosstraining` / `monthly` | `com.trainingprogline.app.sub.crosstraining.monthly` | 15,99 € |
| Hype | `sub.hype.monthly` | `sub_hype` / `monthly` | `com.trainingprogline.app.sub.hype.monthly` | 15,99 € |
| Hyrox | `sub.hyrox.monthly` | `sub_hyrox` / `monthly` | `com.trainingprogline.app.sub.hyrox.monthly` | 15,99 € |

- **El precio lo da siempre la tienda.** La app muestra el que devuelve Google Play o el App Store, en la moneda
  del usuario; no hay precios escritos en la app. Los de la tabla son los que crean los scripts.
- Los precios iniciales solo se configuran para España (`ES` en Google, `ESP` en Apple). Vender en otros países
  es una decisión comercial: hay que añadir sus precios en cada tienda.
- En Apple cada suscripción va en su propio grupo («Programación Básico», «Programación Calistenia»…), porque en
  un grupo solo puede estar activa una suscripción a la vez.
- **Los ids no se pueden reutilizar nunca** en ninguna de las dos tiendas, aunque se borre el producto.
- Preparado para crecer: el esquema, el manifiesto y la app admiten compras únicas (`non_consumable`) y productos
  que desbloquean varias programaciones (varias filas en `store_product_programs`). Para añadir uno se edita
  `data/store-products.json` y se ejecuta `node scripts/iap-admin.mjs seed`. Los scripts de las tiendas solo
  crean suscripciones: una compra única se crea a mano en Play Console y App Store Connect.

## Cómo funciona

1. La app lee el catálogo (`store_products`) y pide a la tienda el precio de cada producto. Si la tienda no
   devuelve un producto, la tarjeta dice «Todavía no está disponible en …» y no se puede comprar.
2. Al comprar, la app envía a la tienda el id de usuario de Supabase (`obfuscatedAccountId` en Google,
   `appAccountToken` en Apple) para vincular la compra a la cuenta.
3. La Edge Function `iap-verify` verifica la compra con Google (Android Publisher API) o con Apple (firma JWS
   con la cadena hasta Apple Root CA G3 y, con credenciales, App Store Server API) y escribe `store_purchases`
   y `user_entitlements`.
4. Solo cuando el servidor concede el acceso, la app termina la transacción (acknowledge en Google,
   `finishTransaction` en Apple) y la muestra como activa. Hasta entonces se ve «Verificando la compra…».
   Si algo falla, la compra queda sin terminar y se reintenta sola (al abrir la app, al volver a primer plano o
   con «Restaurar compras»). El servidor también hace el acknowledge si quedó pendiente. Google reembolsa
   automáticamente a los 3 días las compras sin acknowledge, así que nunca se cobra sin dar acceso.
5. Renovaciones, caducidades, cancelaciones y reembolsos llegan por webhooks: `iap-google-rtdn` (notificaciones
   en tiempo real vía Pub/Sub) e `iap-apple-notifications` (App Store Server Notifications V2).
6. El acceso es de la cuenta, no del dispositivo: lo contratado en Android sirve en iPhone y en la web con la
   misma cuenta. El cobro lo sigue gestionando la tienda donde se contrató.

**Varias suscripciones y duplicados.** Cada programación se contrata por separado. Si la cuenta ya tiene derecho
a una programación (suscripción en esta u otra tienda, o acceso manual), su tarjeta no ofrece comprarla: muestra
«Suscripción activa» o «Ya tienes acceso». Si se contrató en la otra tienda, indica que el cobro lo gestiona esa
tienda. Además, Google y Apple impiden pagar dos veces la misma suscripción con la misma cuenta de la tienda.

**Cancelar** desde «Gestionar suscripción» mantiene el acceso hasta el final del periodo pagado: la tarjeta pasa
a «Cancelada» con «Acceso hasta …». Con un problema de cobro, la tienda abre un periodo de gracia y la tarjeta
avisa «Problema con el pago».

**«Mis compras»** (`/store/purchases`, también desde Perfil) muestra las suscripciones activas con su estado,
la tienda donde se contrataron, la próxima renovación o el fin del acceso y el botón para gestionarlas; debajo,
las programaciones con acceso y su origen, y «Restaurar compras».

**Protecciones:**

- Una compra (token de Google u `originalTransactionId` de Apple) solo puede pertenecer a una cuenta. No se
  puede pasar a otra cuenta: la otra recibe «Compra vinculada a otra cuenta».
- Los webhooks se deduplican.
- El cliente no puede escribir compras ni derechos (RLS y `revoke`).
- Ningún secreto está en la app.
- El trigger `user_programs_paid_guard` impide que un atleta se active una programación vendida en la tienda sin
  derecho verificado. Solo actúa con productos a la venta. No afecta a administradores, a las asignaciones de
  entrenadores y gimnasios ni a las programaciones que ya estaban activas.
- Sin conexión, la app respeta la última respuesta del servidor hasta 72 horas después de la caducidad, para no
  quitar el acceso por un fallo temporal.

**Accesos anteriores.** Antes de la monetización, el catálogo Hype de pago solo lo abrían los administradores. Ahora
lo abren los administradores y quien tenga un derecho verificado: nadie pierde un acceso que tuviera. Para dar
acceso sin tienda (cortesía, compensación): `node scripts/iap-admin.mjs grant <email> <product_key> [--until AAAA-MM-DD]`.

## Puesta a la venta controlada

Un producto con `active = false` solo lo ven los administradores y las cuentas de `store_testers`: los usuarios
no ven nada nuevo. Todo se gestiona con `node scripts/iap-admin.mjs` (en PowerShell, siempre con `node`
directamente, porque `npm run … -- args` pierde los argumentos):

| Orden | Qué hace |
| --- | --- |
| `status` | Estado de cada producto y de cada comprobación necesaria para venderlo |
| `testers add <email> [nota]` · `testers remove <email>` · `testers` | Cuentas que ven y pueden comprar los productos en pruebas |
| `activate --all --confirm-manual-tests` (o una lista de `product_key`) | Pone a la venta, **solo si pasan todas las comprobaciones** |
| `deactivate --all` (o una lista) | Retira de la venta; quien ya pagó conserva el acceso |
| `grant` · `revoke` | Acceso manual a una programación, sin tienda (nunca toca compras de las tiendas) |
| `seed` | Crea o actualiza el catálogo desde el manifiesto (nunca pone nada a la venta) |

`activate` se niega a poner un producto a la venta mientras falte cualquiera de estas comprobaciones, todas con
datos reales de la base de datos:

- Las tres Edge Functions desplegadas.
- En cada tienda, al menos una notificación procesada de alta, renovación, cancelación, caducidad y reembolso.
- Para cada producto: catálogo con los ids del manifiesto, programaciones vinculadas y una compra verificada por
  el backend en cada tienda (en Google, además, con acknowledge). Las compras de testers de Play y de Sandbox
  cuentan, porque las verifica la tienda.
- Las pruebas manuales, que se confirman con `--confirm-manual-tests`: restaurar tras reinstalar en Android y en
  iPhone; acceso en la otra plataforma y en la web; cancelar mantiene el acceso hasta el final del periodo; la
  versión publicada anterior sigue funcionando con los productos a la venta.

## Lo que falta: datos que no existen en este entorno

Se ponen en el `.env` local (está en `.gitignore`), con la ruta del archivo o su contenido. Los scripts los leen
de ahí y `deploy-iap-functions.mjs` los sube como secretos de Supabase. Nunca van en la app.

| Dato | Dónde se consigue | Qué desbloquea |
| --- | --- | --- |
| `SUPABASE_ACCESS_TOKEN` con «Edge Function Secrets» en lectura y escritura | supabase.com → Account → Access Tokens. El token actual ya despliega funciones y lee secretos; si no se puede ampliar, crea otro con los mismos permisos más ese | Guardar en Supabase los secretos de Google y de Apple. No hace falta para volver a desplegar las funciones |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Cloud: cuenta de servicio con la Google Play Android Developer API activada y una clave JSON. En Play Console → Usuarios y permisos, invitar su email a la app con «Ver información de la aplicación», «Ver datos financieros, pedidos y respuestas a encuestas de cancelación», «Gestionar pedidos y suscripciones» y «Gestionar la presencia en Play Store». Los permisos pueden tardar hasta 36 horas | Verificar compras de Android y crear las suscripciones en Play |
| `GOOGLE_RTDN_AUDIENCE` y `GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL` (o `GOOGLE_RTDN_TOKEN`) | La suscripción push de Pub/Sub (ver paso 5). OIDC es lo recomendado; el token va en la URL (`?token=…`) | Renovaciones, cancelaciones y reembolsos de Google |
| `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_PRIVATE_KEY` | App Store Connect → Usuarios y acceso → Integraciones → App Store Connect API: clave de equipo con rol App Manager o Admin (el `.p8`) | Crear las suscripciones en App Store Connect. La misma clave sirve para que EAS suba builds a TestFlight (ver «iOS») |
| `APPLE_IAP_ISSUER_ID`, `APPLE_IAP_KEY_ID`, `APPLE_IAP_PRIVATE_KEY` | App Store Connect → Usuarios y acceso → Integraciones → Compra dentro de la app: clave de compras (otro `.p8`) | Consultar la App Store Server API: estado actual, renovación automática, periodo de gracia y sincronización periódica |
| Acuerdo de apps de pago | App Store Connect → Negocio: acuerdo «Apps de pago» activo, con datos bancarios y fiscales | Sin él, StoreKit no devuelve productos, ni siquiera en Sandbox |
| Perfil de pagos de Google Play | Play Console → Configuración → Perfil de pagos (solo el propietario de la cuenta puede vincularlo) | Vender productos de pago en Google Play |

Sin las credenciales de Google, las compras de Android quedan «pendientes de verificar»: la app no da acceso ni
las termina. Sin `APPLE_IAP_*`, las compras de Apple se verifican igualmente por su firma y las notificaciones
se procesan, pero sin consultar la App Store Server API. `GOOGLE_PLAY_PACKAGE_NAME`, `APPLE_BUNDLE_ID` y
`APPLE_APP_APPLE_ID` salen del manifiesto. `IAP_ALLOW_TEST_PURCHASES` vale `true` por defecto y debe seguir así,
porque App Review compra en Sandbox.

## Pasos hasta vender, en orden

1. **Credenciales** de la tabla anterior en `.env`.
2. **Secretos** (las tres funciones ya están desplegadas; no volver a desplegarlas): con el permiso de escritura,
   `node scripts/deploy-iap-functions.mjs --secrets-only` sube los secretos presentes en `.env`. `--dry-run` muestra
   los nombres, nunca los valores. Las URL de los webhooks son:
   - `https://nsdurlikkuoxqobabixr.supabase.co/functions/v1/iap-google-rtdn`
   - `https://nsdurlikkuoxqobabixr.supabase.co/functions/v1/iap-apple-notifications`
3. **Google Play**: subir `dist/training-progline.aab` a **prueba interna** (Play exige una versión con `BILLING`
   antes de crear productos). Después `node scripts/iap-google-play-products.mjs` (solo lee y muestra el plan),
   `--apply` (crea lo que falte, con los planes base en borrador) y `--apply --activate` (activa los planes base).
   Nunca modifica ni borra lo que ya existe.
4. **App Store Connect**: `node scripts/iap-app-store-products.mjs` (solo lee) y `--apply`, que crea los grupos con
   su nombre visible, las suscripciones, los textos en español, la disponibilidad en España y el precio. Queda a mano
   la captura para la revisión de cada suscripción: una captura de la tienda de la app en un iPhone, que solo se
   puede hacer con la build instalada desde TestFlight. La primera vez,
   las suscripciones se envían a revisión junto con la versión 1.0.22 (sección «Compras dentro de la app y
   suscripciones» de la versión). Subir también la build 1.0.22 a TestFlight (ver «iOS»).
5. **Google RTDN**: en Google Cloud, crear un tema de Pub/Sub y dar el rol «Publicador de Pub/Sub» a
   `google-play-developer-notifications@system.gserviceaccount.com`. Crear una suscripción **push** a la URL de
   `iap-google-rtdn` con autenticación OIDC: la cuenta de servicio es `GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL` y la
   audiencia `GOOGLE_RTDN_AUDIENCE`. En Play Console → Monetización → Configuración de la monetización, poner el
   tema y pulsar «Enviar notificación de prueba».
6. **Apple Server Notifications V2**: App Store Connect → la app → Información de la app → Notificaciones del
   servidor del App Store, versión 2, la URL de `iap-apple-notifications` en Producción y en Sandbox.
7. **Testers**: `node scripts/iap-admin.mjs testers add <email>` con las cuentas de la app de quienes prueban
   **y con la cuenta de demo de App Review**: si no, el revisor no verá los productos mientras estén en pruebas.
8. **Pruebas** de las listas siguientes, hasta que `node scripts/iap-admin.mjs status` lo marque todo con ✓ (las
   pruebas manuales siguen pendientes ahí: se confirman al activar).
9. **Publicar 1.0.22** en las dos tiendas (Android, de prueba interna a producción a mano; iOS, con el flujo
   manual de Codemagic o desde App Store Connect).
10. **Vender**: con 1.0.22 publicada, `node scripts/iap-admin.mjs activate --all --confirm-manual-tests`. Solo
    entonces, si se quiere obligar a actualizar, `npm run android:require-update` y `npm run ios:require-update`.

## Pruebas en Android (Google Play)

1. Play Console → Configuración → **Pruebas de licencias**: añadir las cuentas de Google de prueba (sus compras
   no se cobran).
2. Instalar la versión de prueba interna desde Play Store con el enlace de participación (la facturación solo
   funciona con apps instaladas desde Play).
3. Casos:
   - Suscribirse → «Verificando…» → «Suscripción activa» y acceso a la programación.
   - Suscribirse a dos programaciones: las dos quedan activas a la vez.
   - Tarjeta de prueba «Rechazada siempre» → error sin cargo.
   - Tarjeta «Lenta» → «Pago pendiente»; al aprobarse, acceso automático.
   - Cerrar la hoja de Google sin pagar → ningún aviso.
   - Reinstalar o cambiar de dispositivo → «Restaurar compras» recupera el acceso.
   - Las suscripciones de prueba se renuevan cada 5 minutos y caducan tras 6 renovaciones.
   - Cancelar desde «Gestionar suscripción» → «Cancelada» con acceso hasta el fin del periodo.
   - Reembolso desde Play Console → Gestión de pedidos → el acceso desaparece.
   - Otra cuenta de la app con la misma cuenta de Google → «Compra vinculada a otra cuenta».
   - Con la misma cuenta, abrir la app en iPhone y en la web → la suscripción aparece en «Mis compras» como
     contratada en Google Play, sin botón de compra.
4. En Supabase: `store_purchases` (estado y `acknowledged`), `user_entitlements` y `store_notifications`.

## Pruebas en iOS (StoreKit 2)

1. **Sandbox**: App Store Connect → Usuarios y acceso → Sandbox → crear testers. En el iPhone, Ajustes →
   Desarrollador (o App Store) → Cuenta de Sandbox.
2. **TestFlight**: instalar la build 1.0.22. Las compras de TestFlight usan Sandbox y no se cobran.
3. Casos: los mismos que en Android (salvo las tarjetas de prueba, que son de Google). En Sandbox un mes dura
   5 minutos.
4. **Reembolso**: Apple solo genera reembolsos de Sandbox desde la hoja de reembolso de StoreKit. En «Mis compras»,
   las suscripciones de prueba del App Store tienen «Solicitar un reembolso (prueba)». Con cualquier motivo, Apple lo
   aprueba al momento y el servidor recibe `REFUND`: el acceso desaparece al refrescar. Con el motivo «Otro» y el
   texto `DECLINE`, lo rechaza (`REFUND_DECLINED`) y el acceso se mantiene. Las compras reales no muestran ese botón:
   sus reembolsos se piden a Apple como siempre (reportaproblem.apple.com) y llegan igual por notificación.
5. StoreKit Testing en Xcode (sin red): sus transacciones no las firma Apple. Solo se aceptan en un Supabase de
   desarrollo con `IAP_ALLOW_XCODE_TRANSACTIONS=true`, nunca en producción.

## Compilaciones y publicación

Versión **1.0.22** (la 1.0.21 ya está publicada en el App Store y ese tren de versiones está cerrado).

### Android

- `npm run build:android:local` genera `dist/training-progline.aab` (versionCode 23).
- Comprobado: lo firma la clave de subida `CN=Training ProgLine` (SHA-256
  `5F:D3:B4:ED:6E:78:EE:02:78:D3:4F:74:40:40:67:C8:2E:7E:86:77:82:D2:A2:14:CF:AD:B9:F8:44:7E:F6:26`), no la de
  depuración; el manifiesto incluye `com.android.vending.BILLING`.
- Antes de subirlo, esa huella debe coincidir con la del certificado de subida en Play Console → Integridad de la app
  (sin acceso a Play Console no se ha podido cotejar).
- Subirlo a **prueba interna**. Producción se publica a mano en Play Console.

### iOS

- Bundle ID `com.trainingprogline.app`, `buildNumber` 1 de 1.0.22 en `app.json` (EAS usa `appVersionSource: local`).
- EAS (`npm run build:ios`, perfil `production`) firma con las credenciales remotas del equipo YTW48FHX37: certificado
  y perfil de distribución válidos hasta el 10 de septiembre de 2027.
- StoreKit no necesita entitlements: la capacidad In-App Purchase viene activada en todos los App ID.
- Build lista: EAS `74ac8dbd-e55b-4902-90bb-71ad0d28f440` (1.0.22, build 1, distribución App Store), con todo lo
  de esta guía, incluido el reembolso de prueba.
- **Subirla a TestFlight** (no la envía a revisión):
  `npx eas-cli submit --platform ios --id 74ac8dbd-e55b-4902-90bb-71ad0d28f440 --profile production`.
  La primera vez tiene que ser interactiva: pide iniciar sesión con el Apple ID del equipo YTW48FHX37 y ofrece crear
  y guardar en EAS una clave de la App Store Connect API. Desde entonces `eas submit --non-interactive` y
  `npm run submit:ios` funcionan solos. Alternativa: poner una clave propia en `eas.json` (`ascApiKeyPath`,
  `ascApiKeyIssuerId`, `ascApiKeyId`).
- Otra vía: un push a `main` lanza `ios-testflight` en Codemagic, que usa la clave de su integración.

### Codemagic (`codemagic.yaml`)

| Flujo | Cuándo | Qué hace |
| --- | --- | --- |
| `ios-development` | Pull request hacia `main` | Tests y compilación para el simulador, sin firmar ni publicar |
| `ios-testflight` | Push a `main` | Tests, build firmada y subida a TestFlight para testers internos. **Nunca la envía a revisión** |
| `ios-app-store` | Solo a mano, desde Codemagic | Build firmada y envío a revisión con publicación manual (`release_type: MANUAL`) |

- Antes, cada push a `main` enviaba la versión a revisión del App Store (`submit_to_app_store: true`).
- El número de build se calcula como el mayor de TestFlight (todas las versiones) más 1, y la versión sale de `app.json`.
- Se conservan la integración `Codemagic Training ProgLine` y la firma `app_store` de `com.trainingprogline.app`.
- Para testers externos, añadir `beta_groups` y `submit_to_testflight: true` en `ios-testflight` (revisión beta,
  no de tienda).

### Respuesta a App Review

Las programaciones digitales se venden con In-App Purchase (suscripciones autorrenovables). Los servicios
presenciales y del gimnasio quedan fuera de IAP (3.1.3(d)/(e)) y el CRM de gimnasios es B2B (3.1.3(c)/(f)). Lo
comprado en Android sirve en iPhone porque también se vende como IAP (3.1.3(b)). Indicar la cuenta de demo
(añadida como tester) y que las compras pueden hacerse en Sandbox. La tienda enlaza los Términos de uso (EULA
estándar de Apple) y la política de privacidad, y muestra las condiciones de renovación antes de suscribirse.

## Clasificación de los cobros

| Tipo | Qué es en la app | Canal |
| --- | --- | --- |
| Contenido digital | Programaciones del catálogo Hype (Básico, Calistenia, ATHX, Crosstraining, Hype, Hyrox) | Suscripciones de Google Play y del App Store |
| Servicios presenciales o 1:1 | Entrenamiento personal, citas y reservas del gimnasio, cuotas del gimnasio, productos físicos | Fuera de las tiendas (Apple 3.1.3(d)/(e), política de pagos de Google Play) |
| Otros | CRM de gimnasios (SaaS B2B, `gym_subscriptions`); programaciones que asigna el entrenador o el gimnasio; reto semanal (lo publica el entrenador, no se vende) | B2B fuera de las tiendas; el resto no se cobra en la app |

Stripe no está integrado en el repositorio (solo existe `gym_subscriptions.external_subscription_id`) y no se ha
tocado. `store_purchases.store` y `user_entitlements.source` ya admiten `stripe` para unificarlo en el futuro.

## Comprobaciones automáticas

- `npm test`: incluye las pruebas de compras (`iapState`, `iapAppleJws`, `iapVerify`, `iapEntitlements`,
  `iapStoreProducts`): estados de Google y Apple, verificación de firmas JWS de Apple, flujo de `iap-verify`,
  propiedad de productos con varias suscripciones y varias tiendas, fechas de renovación, validación del manifiesto,
  cargas de las APIs de Play y App Store Connect, firma de los tokens y reglas para poner a la venta.
- `node scripts/iap-db-security-check.mjs`: RLS, permisos y trigger contra la base de datos real, en
  transacciones que se deshacen.
- Ninguna sustituye a una compra real en las tiendas: eso lo exige `iap-admin activate`.

## Limitaciones conocidas

- No hay cambio de plan entre suscripciones (son independientes): cada una se contrata y se cancela por separado.
- Una compra sin cuenta vinculada (sin `appAccountToken` ni `obfuscatedAccountId`, por ejemplo hecha fuera de la
  app) se asigna a la primera cuenta que la presenta.
- «Compartir en familia» de Apple no está soportado: los scripts crean las suscripciones con esa opción desactivada.
- Al eliminar la cuenta se pierden los derechos y la suscripción **no** se cancela sola en la tienda (la pantalla
  de borrado lo avisa).
- `lib/catalogPricing.ts` (descuento del 15 % para el personal) ya no se usa: las tiendas no admiten ese descuento.
