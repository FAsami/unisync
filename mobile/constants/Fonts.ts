// One family carries the whole system (tokens.json: type.families.sans).
// No second face to load, no mismatch between the app and the dashboard.
export const Fonts = {
  thin: 'Inter_400Regular',
  extraLight: 'Inter_400Regular',
  light: 'Inter_400Regular',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  black: 'Inter_800ExtraBold',
  serifSemiBold: 'Inter_600SemiBold',
  serifBold: 'Inter_700Bold',
} as const

export type FontWeight = keyof typeof Fonts
// Mirrors tokens.json's type.groups[0].styles (display/h1/h2/h3/body/...).
// Denser than the previous pass: smaller sizes, tighter leading, tighter
// (or, for label/overline, wider) tracking — a scanning register, not a
// reading one.
export const FontStyles = {
  display: {
    fontFamily: Fonts.extraBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.7,
  },
  heading1: {
    fontFamily: Fonts.extraBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  heading2: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20 },
  heading3: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18 },
  heading4: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18 },
  heading5: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 20 },
  heading6: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 20 },
  bodyLarge: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 20 },
  bodyMedium: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 20 },
  bodySmall: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  caption: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
  button: { fontFamily: Fonts.semiBold, fontSize: 13, lineHeight: 20 },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.6,
  },
  data: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 20 },
  overline: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.6,
  },
} as const
