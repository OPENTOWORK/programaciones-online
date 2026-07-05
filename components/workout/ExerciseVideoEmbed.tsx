import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { borderRadius, colors } from '@/constants/theme';
import { getYoutubeEmbedUrl } from '@/lib/exerciseVideoService';

function buildYoutubeWebViewHtml(embedUrl: string) {
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
      }
      .player {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #000;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }
    </style>
  </head>
  <body>
    <div class="player">
      <iframe
        src="${embedUrl}"
        title="Vídeo demostrativo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  </body>
</html>`;
}

interface ExerciseVideoEmbedProps {
  youtubeVideoId: string;
  title: string;
  style?: ViewStyle;
}

export function ExerciseVideoEmbed({ youtubeVideoId, title, style }: ExerciseVideoEmbedProps) {
  const [loading, setLoading] = useState(true);
  const embedUrl = getYoutubeEmbedUrl(youtubeVideoId);
  const html = useMemo(() => buildYoutubeWebViewHtml(embedUrl), [embedUrl]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          src={embedUrl}
          title={title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: colors.black,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : null}
      <WebView
        source={{ html, baseUrl: 'https://www.youtube.com' }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    zIndex: 1,
  },
});
