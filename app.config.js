// app.config.js
const env = require('./env');

export default ({ config }) => ({
  ...config,
  name: "photo-diary",
  slug: "photo-diary",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "photodiary",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    bundleIdentifier: "com.oldephraim.photodiary",
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSExceptionDomains: {
          [env.API_URL || process.env.EXPO_PUBLIC_API_IP]: {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: true,
          },
        },
      },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.oldephraim.photodiary",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: ["expo-router", "expo-asset"],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "4acd3dab-573b-4190-9562-502fac5ba039",
    },
    clerkPublishableKey: env.CLERK_KEY || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    apiUrl: env.API_URL || process.env.EXPO_PUBLIC_API_IP,
  },
})
