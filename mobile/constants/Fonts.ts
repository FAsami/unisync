export const Fonts = {
  // Montserrat doesn't have 100, 200, 300 weights, so we map them to available weights
  thin: 'Montserrat_400Regular',
  extraLight: 'Montserrat_400Regular',
  light: 'Montserrat_400Regular',
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extraBold: 'Montserrat_800ExtraBold',
  black: 'Montserrat_900Black',

  // Libre Bodoni (Serif font for elegant headings)
  serifSemiBold: 'LibreBodoni_600SemiBold',
  serifBold: 'LibreBodoni_700Bold',
} as const

export type FontWeight = keyof typeof Fonts
export const FontStyles = {
  heading1: { fontFamily: Fonts.serifBold, fontSize: 32, lineHeight: 38 },
  heading2: { fontFamily: Fonts.serifBold, fontSize: 28, lineHeight: 34 },
  heading3: { fontFamily: Fonts.serifSemiBold, fontSize: 24, lineHeight: 30 },
  heading4: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 26 },
  heading5: { fontFamily: Fonts.medium, fontSize: 18, lineHeight: 24 },
  heading6: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22 },
  bodyLarge: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  caption: { fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16 },
  button: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
} as const
