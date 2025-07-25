export const Fonts = {
  thin: "Inter_100Thin",
  extraLight: "Inter_200ExtraLight",
  light: "Inter_300Light",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
  black: "Inter_900Black",
} as const;

export type FontWeight = keyof typeof Fonts;
export const FontStyles = {
  heading1: { fontFamily: Fonts.bold, fontSize: 32, lineHeight: 38 },
  heading2: { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 34 },
  heading3: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 30 },
  heading4: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 26 },
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
} as const;
