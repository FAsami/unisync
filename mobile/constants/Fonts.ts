// One family carries the whole system (tokens.json: type.families.sans).
// No second face to load, no mismatch between the app and the dashboard.
export const Fonts = {
  thin: 'PlusJakartaSans_400Regular',
  extraLight: 'PlusJakartaSans_400Regular',
  light: 'PlusJakartaSans_400Regular',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
  black: 'PlusJakartaSans_800ExtraBold',
  serifSemiBold: 'PlusJakartaSans_600SemiBold',
  serifBold: 'PlusJakartaSans_700Bold',
} as const

export type FontWeight = keyof typeof Fonts
// Mirrors tokens.json's type.groups[0].styles (display/h1/h2/h3/body/...).
export const FontStyles = {
  display: {
    fontFamily: Fonts.extraBold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.4,
  },
  heading1: {
    fontFamily: Fonts.extraBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  heading2: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 26 },
  heading3: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20 },
  heading4: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20 },
  heading5: { fontFamily: Fonts.medium, fontSize: 15, lineHeight: 22 },
  heading6: { fontFamily: Fonts.medium, fontSize: 15, lineHeight: 22 },
  bodyLarge: { fontFamily: Fonts.medium, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: Fonts.medium, fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  button: { fontFamily: Fonts.semiBold, fontSize: 15, lineHeight: 22 },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  data: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 22 },
  overline: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
} as const
