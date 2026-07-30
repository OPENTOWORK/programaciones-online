# Training ProgLine

App de entrenamientos y programaciones (Expo + Supabase).

## Web pública

- **Producción:** https://trainingprogline.es
- **Vercel:** https://programaciones-online.vercel.app

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Build web

```bash
npm run export:web
npm run serve:web
```

## Repositorio y despliegue

- **GitHub:** `carlosgarciacano87-dev/programaciones-online`
- **Vercel:** proyecto `programaciones-online` (build: `npx expo export -p web`, salida: `dist`)

Cada push a `main` redepliega la web en Vercel.
