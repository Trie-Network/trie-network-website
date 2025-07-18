export const colors = {

  brand: {
    primary: '#0284a5',
    primaryHover: '#026d8a',
    primaryLight: 'rgba(6, 182, 212, 0.1)',
    teal: '#19A7C7',
    tealDark: '#0196B7',
    tealDarker: '#017a99',
  },

  ui: {
    background: '#f6f6f7',
    backgroundSecondary: '#111315',
    backgroundTertiary: '#141414',
    white: '#ffffff',

    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    dark: '#1e293b',
  },

  border: {
    default: '#1F1F1F',
    light: '#2D2D2D',
    slate: {
      100: '#f1f5f9',
      200: '#e2e8f0',
    },
  },

  status: {
    success: '#22C55E',
    successLight: '#dcfce7',
    successDark: '#15803D',
    warning: '#F59E0B',
    warningLight: '#fef3c7',
    warningDark: '#B45309',
    error: '#EF4444',
    errorLight: '#fee2e2',
    errorDark: '#B91C1C',
  },

  accent: {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
  },
} as const;

export const getTailwindClass = {

  bg: {
    white: 'bg-white',
    slate50: 'bg-slate-50',
    slate100: 'bg-slate-100',
    slate200: 'bg-slate-200',
    primary: 'bg-primary',
    primaryLight: 'bg-primary-light',
    error: 'bg-error',
    errorLight: 'bg-error/10',
    warningLight: 'bg-warning/10',
  },

  text: {
    primary: 'text-primary',
    slate400: 'text-slate-400',
    slate500: 'text-slate-500',
    slate600: 'text-slate-600',
    slate700: 'text-slate-700',
    slate800: 'text-slate-800',
    error: 'text-error',
    warning: 'text-warning',
    white: 'text-white',
  },

  border: {
    slate100: 'border-slate-100',
    slate200: 'border-slate-200',
    primary: 'border-primary',
    error: 'border-error',
    warning: 'border-warning',
  },

  ring: {
    primary: 'ring-primary',
    error: 'ring-error',
    warning: 'ring-warning',
  },
} as const;

export const colorCombos = {

  card: {
    default: 'bg-white border border-slate-100',
    hover: 'hover:border-primary hover:shadow-md',
    active: 'bg-primary-light border-primary',
  },

  button: {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    secondary: 'bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary',
    ghost: 'text-slate-500 hover:text-primary hover:bg-slate-50',
    danger: 'bg-error hover:bg-error/90 text-white',
  },

  input: {
    default: 'border-slate-200 focus:ring-primary focus:border-transparent',
    error: 'border-error focus:ring-error',
    warning: 'border-warning focus:ring-warning',
  },

  badge: {
    primary: 'bg-primary-light text-primary',
    slate: 'bg-slate-100 text-slate-600',
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    error: 'bg-error-light text-error-dark',
  },
} as const;