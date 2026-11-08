import { TextStyle } from 'react-native'
import { Fonts } from '@/constants/Fonts'

/**
 * Typography utility functions for consistent font usage across the app
 * Use these helpers to apply fonts with common text styles
 */

export const typography = {
  regular: (fontSize?: number): TextStyle => ({
    fontFamily: Fonts.regular,
    ...(fontSize && { fontSize }),
  }),
  medium: (fontSize?: number): TextStyle => ({
    fontFamily: Fonts.medium,
    ...(fontSize && { fontSize }),
  }),
  semiBold: (fontSize?: number): TextStyle => ({
    fontFamily: Fonts.semiBold,
    ...(fontSize && { fontSize }),
  }),
  bold: (fontSize?: number): TextStyle => ({
    fontFamily: Fonts.bold,
    ...(fontSize && { fontSize }),
  }),
  extraBold: (fontSize?: number): TextStyle => ({
    fontFamily: Fonts.extraBold,
    ...(fontSize && { fontSize }),
  }),
  black: (fontSize?: number): TextStyle => ({
    fontFamily: Fonts.black,
    ...(fontSize && { fontSize }),
  }),
}

/**
 * Shorthand for common typography patterns
 */
export const text = {
  h1: { fontFamily: Fonts.extraBold, fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 26 },
  h3: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20 },
  h4: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 26 },
  h5: { fontFamily: Fonts.medium, fontSize: 18, lineHeight: 24 },
  h6: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22 },

  // Body text
  bodyLarge: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },

  // Special
  caption: { fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16 },
  button: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
} as const
