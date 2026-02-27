// FinishLine design system tokens for the chrome extension popup.
// Uses FinishLine's light theme palette with NER brand accents.

export const colors = {
  // NER brand
  primary: '#ef4345',
  primaryDark: '#b0191a',
  secondary: '#a72a1e',

  // Backgrounds (light mode)
  bgDefault: '#ffffff',
  bgPaper: '#f7f7f7',
  bgSurface: '#f0f0f0',
  bgHover: '#e8e8e8',

  // Text
  textPrimary: '#1a1a1a',
  textSecondary: '#555555',
  textMuted: '#888888',
  textOnPrimary: '#ffffff',

  // Status
  success: '#2e7d32',
  successLight: '#4caf50',
  error: '#d32f2f',
  warning: '#ed6c02',

  // Borders
  border: '#ddd',
  borderLight: '#e8e8e8'
} as const;

export const fonts = {
  heading: "'Oswald', sans-serif",
  body: "'Lato', sans-serif"
} as const;

export const fontSizes = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 16,
  xl: 20
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 10
} as const;

// Reusable style mixins
export const mixins = {
  card: {
    background: colors.bgDefault,
    borderRadius: radii.md,
    border: `1px solid ${colors.border}`
  } as React.CSSProperties,

  heading: {
    fontFamily: fonts.heading,
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0
  } as React.CSSProperties,

  body: {
    fontFamily: fonts.body,
    color: colors.textPrimary
  } as React.CSSProperties,

  primaryButton: {
    fontFamily: fonts.body,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    background: colors.primary,
    color: colors.textOnPrimary,
    border: 'none',
    borderRadius: radii.sm,
    cursor: 'pointer',
    fontSize: fontSizes.md,
    fontWeight: 600
  } as React.CSSProperties,

  outlineButton: {
    fontFamily: fonts.body,
    padding: '5px 10px',
    fontSize: fontSizes.sm,
    fontWeight: 600,
    border: `1px solid ${colors.primary}`,
    borderRadius: radii.sm,
    background: 'transparent',
    color: colors.primary,
    cursor: 'pointer'
  } as React.CSSProperties,

  linkButton: {
    fontFamily: fonts.body,
    background: 'none',
    border: 'none',
    color: colors.primary,
    cursor: 'pointer',
    fontSize: fontSizes.base,
    textDecoration: 'underline',
    padding: 0
  } as React.CSSProperties,

  input: {
    fontFamily: fonts.body,
    display: 'block' as const,
    width: '100%',
    padding: '8px 10px',
    marginBottom: spacing.md,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.sm,
    fontSize: fontSizes.base,
    boxSizing: 'border-box' as const,
    background: colors.bgDefault,
    color: colors.textPrimary
  } as React.CSSProperties,

  select: {
    fontFamily: fonts.body,
    display: 'block' as const,
    width: '100%',
    padding: '8px 10px',
    marginBottom: spacing.md,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.sm,
    fontSize: fontSizes.base,
    boxSizing: 'border-box' as const,
    background: colors.bgDefault,
    color: colors.textPrimary
  } as React.CSSProperties,

  label: {
    fontFamily: fonts.body,
    display: 'block' as const,
    fontSize: fontSizes.sm,
    fontWeight: 600,
    marginBottom: spacing.xs,
    color: colors.textSecondary
  } as React.CSSProperties,

  sectionHeader: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.sm,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: spacing.sm
  } as React.CSSProperties,

  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.base,
    color: colors.error
  } as React.CSSProperties,

  subtleText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.base,
    color: colors.textSecondary
  } as React.CSSProperties
} as const;
