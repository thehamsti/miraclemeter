/** @type {import('@expo/fingerprint').Config} */
module.exports = {
  sourceSkips: [
    // Skip bare native directories - they differ between local and EAS due to pod install
    "ExpoConfigRuntimeVersionRuntimeVersionPolicyBareNativeDir",
  ],
  ignorePaths: [
    "ios/build/**",
    "ios/Pods/**",
    "ios/.xcode.env.local",
    "ios/Podfile.lock",
  ],
};
