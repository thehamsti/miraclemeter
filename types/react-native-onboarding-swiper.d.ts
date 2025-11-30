declare module 'react-native-onboarding-swiper' {
  import { ComponentType, ReactNode } from 'react';
  import { StyleProp, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';

  interface Page {
    backgroundColor: string;
    image: ReactNode;
    title?: string | ReactNode;
    subtitle?: string | ReactNode;
    titleStyles?: StyleProp<TextStyle>;
    subTitleStyles?: StyleProp<TextStyle>;
  }

  interface OnboardingProps {
    pages: Page[];
    onDone?: () => void;
    onSkip?: () => void;
    bottomBarHighlight?: boolean;
    bottomBarColor?: string;
    containerStyles?: StyleProp<ViewStyle>;
    imageContainerStyles?: StyleProp<ViewStyle>;
    titleStyles?: StyleProp<TextStyle>;
    subTitleStyles?: StyleProp<TextStyle>;
    DoneButtonComponent?: ComponentType<any>;
    SkipButtonComponent?: ComponentType<any>;
    NextButtonComponent?: ComponentType<any>;
    DotComponent?: ComponentType<{ selected: boolean }>;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    flatlistProps?: object;
    skipLabel?: string | ReactNode;
    nextLabel?: string | ReactNode;
    showPagination?: boolean;
    controlStatusBar?: boolean;
    transitionAnimationDuration?: number;
    allowFontScaling?: boolean;
    skipToPage?: number;
    pageIndexCallback?: (pageIndex: number) => void;
  }

  const Onboarding: ComponentType<OnboardingProps>;
  export default Onboarding;
}
