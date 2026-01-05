import 'dotenv/config'

const getEnvs = () => {
  return {
    SERVER_URL: process.env.SERVER_URL,
    DATAHUB: process.env.DATAHUB,
    DATAHUB_WS: process.env.DATAHUB_WS,
  }
}

export default {
  expo: {
    name: 'Unisync',
    slug: 'unisync',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pibyi.unisync',
      googleServicesFile: './GoogleService-Info.plist',
    },
    extra: {
      ...getEnvs(),
    },
    android: {
      package: 'com.pibyi.unisync',
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.5',
            useFrameworks: 'static',
          },
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-asset',
      '@react-native-firebase/app',
      [
        '@revopush/expo-code-push-plugin',
        {
          ios: {
            CodePushDeploymentKey: 'Ghh6J84eigmmoGLkF69WllHbcbj1EkWHJv7Szl',
            CodePushServerUrl: 'https://api.revopush.org',
          },
          android: {
            CodePushDeploymentKey: 'WlGslZAH_-sBwxdpoazG7hezsTcmEkWHJv7Szl',
            CodePushServerUrl: 'https://api.revopush.org',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
}
