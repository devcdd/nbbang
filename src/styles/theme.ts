import {COLORS} from '../constants/colors';

export const colors = {
  primary: COLORS.YELLOW.PRIMARY,
  background: `linear-gradient(180deg, ${COLORS.YELLOW.GRADIENT_START} 0%, ${COLORS.YELLOW.GRADIENT_END} 100%)`,
  white: COLORS.WHITE,
  black: COLORS.BLACK,
  text: {
    primary: COLORS.TEXT.PRIMARY,
    secondary: COLORS.TEXT.SECONDARY,
  },
  error: COLORS.RED.ERROR,
  gray: COLORS.GRAY,
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
    fontWeight: 'bold' as const,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  text: {
    small: {
      fontSize: 12,
    },
    regular: {
      fontSize: 14,
    },
    medium: {
      fontSize: 16,
    },
    large: {
      fontSize: 18,
    },
    xlarge: {
      fontSize: 20,
    },
    xxlarge: {
      fontSize: 24,
    },
  },
} as const;

export default {
  colors,
  spacing,
  borderRadius,
  typography,
} as const;
