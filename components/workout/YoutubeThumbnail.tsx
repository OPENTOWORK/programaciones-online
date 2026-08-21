import { useEffect, useState } from 'react';
import {
  Image,
  type ImageLoadEventData,
  type ImageProps,
  type NativeSyntheticEvent,
  type StyleProp,
  type ImageStyle,
} from 'react-native';

import { getYoutubeThumbnailCandidates } from '@/lib/exerciseLibrary';

interface YoutubeThumbnailProps extends Omit<ImageProps, 'source'> {
  videoId: string;
  style?: StyleProp<ImageStyle>;
}

/** Miniatura de YouTube en la mejor calidad disponible (maxres → sd → hq). */
export function YoutubeThumbnail({ videoId, style, ...rest }: YoutubeThumbnailProps) {
  const candidates = getYoutubeThumbnailCandidates(videoId);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [videoId]);

  const uri = candidates[Math.min(index, candidates.length - 1)];

  const advance = () => {
    setIndex((current) => (current < candidates.length - 1 ? current + 1 : current));
  };

  const handleLoad = (event: NativeSyntheticEvent<ImageLoadEventData>) => {
    // maxres a veces responde 200 con un placeholder de ~120px; en ese caso bajamos de calidad.
    const width = event.nativeEvent?.source?.width;
    if (typeof width === 'number' && width > 0 && width < 320 && index < candidates.length - 1) {
      advance();
      return;
    }
    rest.onLoad?.(event);
  };

  return (
    <Image
      {...rest}
      source={{ uri }}
      style={style}
      onLoad={handleLoad}
      onError={() => {
        advance();
      }}
    />
  );
}
