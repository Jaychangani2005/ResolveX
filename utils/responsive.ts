import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Screen size breakpoints
export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 768;
export const isLargeScreen = width >= 768;
export const isTablet = width >= 768;

// Responsive value helper function
export const getResponsiveValue = (small: number, medium: number, large: number): number => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Common responsive values
export const getResponsivePadding = () => getResponsiveValue(16, 24, 32);
export const getResponsiveMargin = () => getResponsiveValue(12, 16, 24);
export const getResponsiveFontSize = (small: number, medium: number, large: number) => 
  getResponsiveValue(small, medium, large);

// Responsive spacing
export const spacing = {
  xs: getResponsiveValue(4, 6, 8),
  sm: getResponsiveValue(8, 12, 16),
  md: getResponsiveValue(16, 20, 24),
  lg: getResponsiveValue(24, 30, 36),
  xl: getResponsiveValue(32, 40, 50),
  xxl: getResponsiveValue(40, 50, 60),
};

// Responsive font sizes
export const fontSizes = {
  xs: getResponsiveFontSize(10, 12, 14),
  sm: getResponsiveFontSize(12, 14, 16),
  md: getResponsiveFontSize(14, 16, 18),
  lg: getResponsiveFontSize(16, 18, 20),
  xl: getResponsiveFontSize(18, 20, 22),
  xxl: getResponsiveFontSize(20, 24, 28),
  title: getResponsiveFontSize(24, 28, 32),
  largeTitle: getResponsiveFontSize(28, 32, 36),
};

// Responsive input heights
export const inputHeights = {
  small: getResponsiveValue(40, 44, 48),
  medium: getResponsiveValue(44, 48, 52),
  large: getResponsiveValue(48, 52, 56),
};

// Responsive border radius
export const borderRadius = {
  sm: getResponsiveValue(8, 10, 12),
  md: getResponsiveValue(10, 12, 14),
  lg: getResponsiveValue(12, 16, 20),
  xl: getResponsiveValue(16, 20, 24),
};

// Screen dimensions
export const screenDimensions = {
  width,
  height,
  isLandscape: width > height,
  isPortrait: height > width,
};

// Device type detection
export const deviceType = {
  isPhone: !isTablet,
  isTablet,
  isSmallDevice: isSmallScreen,
  isMediumDevice: isMediumScreen,
  isLargeDevice: isLargeScreen,
};
