/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';
const textColorLight = '#000';
const textColorDark = '#fff';
const backgroundColorLight = '#fff';
const backgroundColorDark = '#000';
const tabIconDefaultColor = '#ccc';
const borderColorLight = '#E0E0E0';
const borderColorDark = '#333333';
const primaryButtonColor = '#007AFF';
const primaryButtonTextColor = '#FFFFFF';
const secondaryButtonColorLight = '#F0F0F0';
const secondaryButtonColorDark = '#333333';
const secondaryButtonTextColor = '#007AFF';
const segmentedButtonActiveLight = tintColorLight;
const segmentedButtonActiveDark = tintColorDark;
const segmentedButtonInactiveLight = '#E0E0E0';
const segmentedButtonInactiveDark = '#555555';
const switchThumbColorLight = '#f4f3f4';
const switchThumbColorDark = '#f4f3f4';
const switchThumbActiveLight = tintColorLight;
const switchThumbActiveDark = tintColorDark;

export const Colors = {
  light: {
    text: textColorLight,
    background: backgroundColorLight,
    tint: tintColorLight,
    tabIconDefault: tabIconDefaultColor,
    tabIconSelected: tintColorLight,
    border: borderColorLight,
    primaryButton: primaryButtonColor,
    primaryButtonText: primaryButtonTextColor,
    secondaryButton: secondaryButtonColorLight,
    secondaryButtonText: secondaryButtonTextColor,
    segmentedButtonActive: segmentedButtonActiveLight,
    segmentedButtonInactive: segmentedButtonInactiveLight,
    switchTrackActive: tintColorLight,
    switchTrackInactive: '#767577',
    switchThumbActive: switchThumbActiveLight,
    switchThumbInactive: switchThumbColorLight,
  },
  dark: {
    text: textColorDark,
    background: backgroundColorDark,
    tint: tintColorDark,
    tabIconDefault: tabIconDefaultColor,
    tabIconSelected: tintColorDark,
    border: borderColorDark,
    primaryButton: primaryButtonColor,
    primaryButtonText: primaryButtonTextColor,
    secondaryButton: secondaryButtonColorDark,
    secondaryButtonText: secondaryButtonTextColor,
    segmentedButtonActive: segmentedButtonActiveDark,
    segmentedButtonInactive: segmentedButtonInactiveDark,
    switchTrackActive: tintColorDark,
    switchTrackInactive: '#767577',
    switchThumbActive: switchThumbActiveDark,
    switchThumbInactive: switchThumbColorDark,
  },
};
