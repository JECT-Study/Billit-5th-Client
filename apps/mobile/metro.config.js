const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);
const fontsDir = path.resolve(projectRoot, '../../packages/fonts');

config.watchFolders = [...new Set([...(config.watchFolders ?? []), fontsDir])];

// .svg를 그림 파일이 아니라 컴포넌트로 불러오기 (react-native-svg-transformer)
config.transformer.babelTransformerPath =
  require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg',
);
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = withNativeWind(config, { input: './src/global.css' });
