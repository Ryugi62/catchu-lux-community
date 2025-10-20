export const colors = {
  backgroundPrimary: '#f2ece5',
  backgroundSecondary: '#f6efe8',
  surfacePrimary: '#fdf9f4',
  surfaceSecondary: '#fdf1f0',
  textPrimary: '#1f1b16',
  textSecondary: '#5c524b',
  textMuted: '#9a8674',
  textPlaceholder: '#9a948c',
  accent: '#9a7b50',
  accentStrong: '#7a5c32',
  borderSubtle: '#ded4c8',
  borderStrong: '#c5b6a6',
  danger: '#c05d5d',
  dangerStrong: '#cc5b63',
};

export const radii = {
  pill: 999,
  xl: 24,
  lg: 20,
  md: 16,
  sm: 12,
  xs: 8,
};

const spacingUnit = 4;
export const spacing = (factor: number) => factor * spacingUnit;

export const typography = {
  heading1: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
  },
};

export const shadows = {
  card: {
    shadowColor: '#1f1b16',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  overlay: {
    shadowColor: '#1f1b16',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const theme = {
  colors,
  radii,
  spacing,
  typography,
  shadows,
};
