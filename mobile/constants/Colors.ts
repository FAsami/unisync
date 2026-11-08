// Mirrors the UniSync design system (tokens.json): brand blue, slate
// neutrals, and the same semantic reds/greens/ambers in both themes.
export const AppColors = {
  primary: '#2563EB',
  secondary: '#4F46E5',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  success: '#15803D',
  error: '#B91C1C',
  info: '#2563EB',
  divider: '#E2E8F0',

  primaryLight: '#5B8DFF',
  primaryDark: '#1D4ED8',
  accent: '#4F46E5',
  accentLight: '#818CF8',
  warning: '#B45309',
  tertiary: '#4F46E5',

  backgroundDark: '#0B1220',
  surfaceDark: '#121B2E',
  textPrimaryDark: '#EEF2FA',
  textSecondaryDark: '#93A3BF',
} as const

export const Colors = {
  light: {
    text: AppColors.textPrimary,
    textSecondary: AppColors.textSecondary,
    background: AppColors.background,
    surface: AppColors.surface,
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    success: AppColors.success,
    error: AppColors.error,
    info: AppColors.info,
    divider: AppColors.divider,
    tint: AppColors.primary,
    tabIconDefault: AppColors.textSecondary,
    tabIconSelected: AppColors.primary,
  },
  dark: {
    text: AppColors.textPrimaryDark,
    textSecondary: AppColors.textSecondaryDark,
    background: AppColors.backgroundDark,
    surface: AppColors.surfaceDark,
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    success: AppColors.success,
    error: AppColors.error,
    info: AppColors.info,
    divider: AppColors.textSecondaryDark,
    tint: AppColors.primaryLight,
    tabIconDefault: AppColors.textSecondaryDark,
    tabIconSelected: AppColors.primaryLight,
  },
}
