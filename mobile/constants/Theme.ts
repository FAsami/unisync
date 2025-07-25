import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'
import { AppColors } from './Colors'

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    surface: AppColors.surface,
    background: AppColors.background,
    error: AppColors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: AppColors.textPrimary,
    onBackground: AppColors.textPrimary,
    onError: '#FFFFFF',
    outline: AppColors.divider,
    outlineVariant: AppColors.divider,
    surfaceVariant: AppColors.background,
    onSurfaceVariant: AppColors.textSecondary,
    tertiary: AppColors.primaryLight,
    onTertiary: '#FFFFFF',
  },
}

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    surface: AppColors.surfaceDark,
    background: AppColors.backgroundDark,
    error: AppColors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: AppColors.textPrimaryDark,
    onBackground: AppColors.textPrimaryDark,
    onError: '#FFFFFF',
    outline: AppColors.textSecondaryDark,
    outlineVariant: AppColors.textSecondaryDark,
    surfaceVariant: AppColors.surfaceDark,
    onSurfaceVariant: AppColors.textSecondaryDark,
    tertiary: AppColors.primaryLight,
    onTertiary: '#FFFFFF',
  },
}
