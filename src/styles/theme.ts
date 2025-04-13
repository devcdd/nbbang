export const colors = {
  primary: '#F5C91B',
  background: `linear-gradient(180deg, rgba(245, 201, 27, 0.1) 0%, rgba(245, 201, 27, 0) 100%)`,
  white: '#FFFFFF',
  black: '#000000',
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
  },
} as const;

export default {
  colors,
  spacing,
  borderRadius,
  typography,
} as const;
