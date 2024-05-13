// reanimated babel plugin: https://stackoverflow.com/a/71754691 
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
