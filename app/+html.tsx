import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

import { rootThemeCss } from '@/constants/theme';
import { themeBootScript } from '@/constants/appThemes';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              ${rootThemeCss('dark')}
              html, body, #root { height: 100%; margin: 0; background: var(--app-background); color: var(--app-text); }
              body { overflow-x: hidden; }
              input:-webkit-autofill,
              input:-webkit-autofill:hover,
              input:-webkit-autofill:focus {
                -webkit-text-fill-color: var(--app-text);
                -webkit-box-shadow: 0 0 0 1000px var(--app-surface) inset;
                caret-color: var(--app-text);
              }
            `,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
