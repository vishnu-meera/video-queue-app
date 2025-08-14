const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle web-specific modules
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-web-webview': 'react-native-webview',
};

module.exports = config;
