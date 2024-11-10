module.exports = {
    name: "miraclemeter",
    slug: "miraclemeter",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.hamstico.miraclemeter"
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#ffffff"
        }
    },
    expo: {
        extra: {
            eas: {
                projectId: "c1ba267b-c55e-4530-9dcd-fbc530c2c76d"
            }
        }
    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
    },
    plugins: [
        "expo-router"
    ],
    experiments: {
        typedRoutes: true
    }
};
