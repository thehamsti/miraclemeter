module.exports = {
    name: "miraclemeter",
    slug: "miraclemeter",
    version: "0.0.1",
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
        bundleIdentifier: "com.hamstico.miraclemeter",
        deploymentTarget: "15.1"
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        package: "com.johnhamstico.miraclemeter",
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
