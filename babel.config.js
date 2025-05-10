module.exports = function (api) {
    api.cache(true)
    return {
      presets: ['babel-preset-expo'],
      plugins: [], // just leave this empty or use other compatible plugins
    }
  }
 