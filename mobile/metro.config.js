const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// Web preview (yarn web / scripts/preview-screens): native-only modules are
// swapped for small stubs so the screens can render in a browser. Android and
// iOS builds never see these stubs.
const webStubs = {
  '@revopush/react-native-code-push': 'code-push.js',
  '@react-native-firebase/messaging': 'firebase-messaging.js',
  '@react-native-firebase/app': 'firebase-app.js',
  'expo-secure-store': 'secure-store.js',
}
const defaultResolve = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && webStubs[moduleName]) {
    return { type: 'sourceFile', filePath: path.join(__dirname, 'web-preview', 'stubs', webStubs[moduleName]) }
  }
  return (defaultResolve ?? context.resolveRequest)(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
