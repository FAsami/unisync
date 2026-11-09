// Mirrors the UniSync design system (tokens.json): indigo brand, true
// neutral grays (not slate), and the same semantic reds/greens/ambers in
// both themes. Dark is the system's primary target; light is drawn with
// the same care, not left as the forgotten default.
export const AppColors = {
  primary: '#4850B8',
  secondary: '#6D28D9',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#18181B',
  textSecondary: '#71717A',
  success: '#15803D',
  error: '#B91C1C',
  info: '#4850B8',
  divider: '#E4E4E7',

  primaryLight: '#7B88E8',
  primaryDark: '#383F94',
  accent: '#6D28D9',
  accentLight: '#A78BFA',
  warning: '#B45309',
  tertiary: '#6D28D9',

  backgroundDark: '#0A0A0B',
  surfaceDark: '#161618',
  textPrimaryDark: '#EDEDEF',
  textSecondaryDark: '#9A9AA2',
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
