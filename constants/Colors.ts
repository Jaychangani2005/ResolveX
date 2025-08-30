/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#E1E5E9',
    // Nature and conservation colors
    primary: '#2E8B57', // Sea Green
    secondary: '#20B2AA', // Light Sea Green
    accent: '#87CEEB', // Sky Blue
    success: '#32CD32', // Lime Green
    warning: '#FFD700', // Gold
    error: '#DC143C', // Crimson
    mangrove: '#228B22', // Forest Green
    ocean: '#1E90FF', // Dodger Blue
    earth: '#8B4513', // Saddle Brown
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#2A2D30',
    // Nature and conservation colors
    primary: '#3CB371', // Medium Sea Green
    secondary: '#48D1CC', // Medium Turquoise
    accent: '#87CEEB', // Sky Blue
    success: '#32CD32', // Lime Green
    warning: '#FFD700', // Gold
    error: '#FF6347', // Tomato
    mangrove: '#228B22', // Forest Green
    ocean: '#1E90FF', // Dodger Blue
    earth: '#CD853F', // Peru
  },
};
