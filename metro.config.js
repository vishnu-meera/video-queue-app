const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle web-specific modules
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-web-webview': 'react-native-webview',
};

// Configure for GitHub Pages deployment with base path
if (process.env.NODE_ENV === 'production') {
  config.transformer.minifierConfig = {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  };
}

// Handle base path for GitHub Pages
// config.resolver.baseUrl = '/video-queue-app/';

module.exports = config;
