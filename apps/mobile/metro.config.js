const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);
const fontsDir = path.resolve(projectRoot, '../../packages/fonts');

config.watchFolders = [...new Set([...(config.watchFolders ?? []), fontsDir])];

module.exports = withNativeWind(config, { input: './src/global.css' });
