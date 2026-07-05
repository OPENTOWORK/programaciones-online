const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.blockList = [
  /_temp_assets\/.*/,
  /tufitmentor360\/.*/,
];

module.exports = config;
