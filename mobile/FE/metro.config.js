const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [
  path.resolve(__dirname, '..', '..', 'app', 'FE', 'src', 'components', 'map'),
];

module.exports = config;
