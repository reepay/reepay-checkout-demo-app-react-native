// Reanimated v4 uses the worklets plugin, which must be listed last.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
    ],
  };
};
