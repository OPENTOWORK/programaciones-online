/** Web stub: native compressor is not available in the browser. */
export const Video = {
  compress: async (uri: string) => uri,
};

export const Audio = {
  compress: async (uri: string, _options?: { quality?: string }) => uri,
};

export const Image = {
  compress: async (uri: string) => uri,
};

export default { Video, Audio, Image };
