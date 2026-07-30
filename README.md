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
- **Vercel:** equipo `Carlos' projects`, proyecto `programaciones-online`
  (build: `npx expo export -p web`, salida: `dist`)

El repositorio no está enlazado al proyecto de Vercel, así que un `git push` no
publica nada por sí solo. Para actualizar la web:

```bash
git push
npm run deploy:web
```
