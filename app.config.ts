import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
    name: "miraclemeter",
    slug: "miraclemeter",
    version: "1.3.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "miraclemeter",
    userInterfaceStyle: "automatic",
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.hamstico.miraclemeter",
        associatedDomains: ["applinks:miraclemeter"],
    },
    android: {
        package: "com.hamstico.miraclemeter",
    },
    platforms: ["ios"],
    extra: {
        eas: {
            projectId: "c1ba267b-c55e-4530-9dcd-fbc530c2c76d",
        },
    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png",
    },
    plugins: [
        "expo-router",
        "expo-font",
        "expo-web-browser",
        [
            "expo-splash-screen",
            {
                backgroundColor: "#643872",
                image: "./assets/images/icon.png",
                imageWidth: 200,
                resizeMode: "contain",
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
};

export default config;
