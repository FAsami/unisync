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
        },
        extra: {
            ...getEnvs(),
        },
        android: {
            package: 'com.pibyi.unisync',
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
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff',
                },
            ],
            'expo-asset',
        ],
        experiments: {
            typedRoutes: true,
        },
    },
}
