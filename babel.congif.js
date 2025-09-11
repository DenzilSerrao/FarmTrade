// babel.config.js
export default function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      'nativewind/babel',
      [
        'module:react-native-dotenv',
        {
          moduleName: 'react-native-config',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
}
