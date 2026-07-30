# AimHarder weekly sync (GitHub Actions)

Este workflow se eliminó del repositorio para permitir el primer push sin el scope `workflow` de GitHub.

Puedes volver a añadirlo creando `.github/workflows/aimharder-weekly-sync.yml` con este contenido:

```yaml
name: AimHarder weekly sync

on:
  schedule:
    - cron: '0 22 * * 0'
      timezone: Europe/Madrid
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Sync AimHarder calendar
        run: npm run aimharder:sync:weekly
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AIMHARDER_SESSION: ${{ secrets.AIMHARDER_SESSION }}
          AIMHARDER_BOX: ${{ secrets.AIMHARDER_BOX }}
```

Alternativa en Windows: `scripts/register-weekly-sync-task.ps1`.
