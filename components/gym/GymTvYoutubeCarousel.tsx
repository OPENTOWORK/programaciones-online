import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors } from '@/constants/theme';
import { useAppActive } from '@/hooks/useAppActive';
import type { GymTvVideoItem } from '@/lib/gymTvWorkout';

const YT_STATE_ENDED = 0;

type YoutubePlayer = {
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        config: {
          videoId?: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => YoutubePlayer;
      PlayerState: {
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function videosSignature(videos: readonly GymTvVideoItem[]) {
  return videos.map((video) => `${video.key}:${video.youtubeVideoId}`).join('|');
}

function loadYoutubeIframeApi() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.YT?.Player) return Promise.resolve();

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };

      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    });
  }

  return youtubeApiPromise;
}

function buildCarouselHtml(videos: readonly GymTvVideoItem[]) {
  const payload = JSON.stringify(
    videos.map((video) => ({ id: video.youtubeVideoId, title: video.title })),
  );

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
      #player { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script>
      var videos = ${payload};
      var index = 0;
      var player;

      function notifyActive(nextIndex) {
        index = nextIndex;
        var payload = JSON.stringify({ type: 'active', index: nextIndex });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(payload);
        }
      }

      function playAt(nextIndex) {
        if (!player || !videos[nextIndex]) return;
        index = nextIndex;
        player.loadVideoById(videos[nextIndex].id, 0);
        notifyActive(index);
      }

      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          videoId: videos[0].id,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            controls: 1,
            fs: 1,
          },
          events: {
            onReady: function() {
              notifyActive(0);
            },
            onStateChange: function(event) {
              if (event.data === YT.PlayerState.ENDED) {
                playAt((index + 1) % videos.length);
              }
            },
          },
        });
      }
    </script>
    <script src="https://www.youtube.com/iframe_api"></script>
  </body>
</html>`;
}

export function GymTvYoutubeCarousel({
  videos,
  onActiveChange,
}: {
  videos: readonly GymTvVideoItem[];
  onActiveChange?: (video: GymTvVideoItem, index: number) => void;
}) {
  const isAppActive = useAppActive();
  const [loading, setLoading] = useState(true);
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const videosRef = useRef(videos);
  const onActiveChangeRef = useRef(onActiveChange);
  const playerRef = useRef<YoutubePlayer | null>(null);
  const videosKey = useMemo(() => videosSignature(videos), [videos]);
  const html = useMemo(() => buildCarouselHtml(videos), [videosKey]);

  videosRef.current = videos;
  onActiveChangeRef.current = onActiveChange;

  useEffect(() => {
    indexRef.current = 0;
    const first = videosRef.current[0];
    if (first) onActiveChangeRef.current?.(first, 0);
    setLoading(true);
  }, [videosKey]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !mountNode || videos.length === 0) return;

    let cancelled = false;
    let player: YoutubePlayer | null = null;

    void loadYoutubeIframeApi().then(() => {
      if (cancelled || !mountNode || !window.YT?.Player) return;

      playerRef.current?.destroy();
      indexRef.current = 0;

      player = new window.YT.Player(mountNode, {
        videoId: videos[0].youtubeVideoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 1,
          fs: 1,
        },
        events: {
          onReady: () => {
            if (!cancelled) setLoading(false);
          },
          onStateChange: (event) => {
            if (event.data !== YT_STATE_ENDED) return;

            const list = videosRef.current;
            if (list.length === 0) return;

            const nextIndex = (indexRef.current + 1) % list.length;
            const next = list[nextIndex];
            indexRef.current = nextIndex;
            player?.loadVideoById(next.youtubeVideoId, 0);
            onActiveChangeRef.current?.(next, nextIndex);
          },
        },
      });
      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      player?.destroy();
      if (playerRef.current === player) {
        playerRef.current = null;
      }
    };
  }, [mountNode, videosKey]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.fill}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : null}
        <View
          key={videosKey}
          ref={(node) => {
            setMountNode(node as HTMLDivElement | null);
          }}
          style={styles.fill}
        />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : null}
      {isAppActive ? (
        <WebView
          key={videosKey}
          source={{ html, baseUrl: 'https://www.youtube.com' }}
          style={styles.fill}
          onLoadEnd={() => setLoading(false)}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data) as { type?: string; index?: number };
              if (data.type !== 'active' || typeof data.index !== 'number') return;
              const video = videosRef.current[data.index];
              if (!video) return;
              indexRef.current = data.index;
              onActiveChangeRef.current?.(video, data.index);
            } catch {
              // Ignorar mensajes no válidos del WebView.
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={false}
          bounces={false}
          setSupportMultipleWindows={false}
          originWhitelist={['*']}
          androidLayerType="hardware"
        />
      ) : (
        <View style={styles.fill} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    zIndex: 1,
  },
});
