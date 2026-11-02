const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const compressorWebStub = path.join(__dirname, 'lib/stubs/react-native-compressor.web.ts');
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-compressor') {
    return { type: 'sourceFile', filePath: compressorWebStub };
  }
  if (typeof defaultResolveRequest === 'function') {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.watchFolders = [__dirname];
config.resolver.blockList = [
  /_temp_assets\/.*/,
  /tufitmentor360\/.*/,
];

module.exports = config;
