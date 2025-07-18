import { colorCombos } from '@/config/colors';

export const componentStyles = {

  container: {
    main: 'fixed inset-0 flex flex-col bg-slate-50',
    card: 'bg-white border border-slate-100 rounded-lg',
    cardHover: 'bg-white border border-slate-100 rounded-lg hover:border-primary hover:shadow-md transition-all',
    section: 'p-6 bg-slate-50',
    modal: 'bg-white rounded-lg shadow-xl',
  },

  header: {
    main: 'bg-white border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-20',
    title: 'text-primary font-medium',
    subtitle: 'text-sm font-semibold text-primary uppercase tracking-wide flex items-center',
  },

  button: {
    primary: 'px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
    secondary: 'px-4 py-2 border border-slate-200 text-slate-600 hover:text-primary hover:border-primary rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30',
    ghost: 'p-2 rounded-full text-slate-500 hover:text-primary hover:bg-slate-50',
    danger: 'px-4 py-2 bg-error hover:bg-error/90 text-white rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-error focus:ring-opacity-50',
    icon: 'p-2 bg-white rounded-md text-slate-600 hover:text-primary border border-slate-200 shadow-sm',
  },

  input: {
    default: 'w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-inner',
    error: 'w-full border border-error rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent resize-none shadow-inner',
    textarea: 'w-full h-80 border border-slate-200 rounded-md p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm resize-none shadow-inner bg-white',
  },

  message: {
    container: 'mb-6',
    roleLabel: 'text-xs font-semibold mb-2 uppercase tracking-wide text-slate-500 flex items-center',
    userBubble: 'max-w-[80%] rounded-2xl p-4 bg-blue-50 text-slate-700 border border-blue-100 group relative',
    assistantBubble: 'max-w-[80%] rounded-2xl p-4 bg-slate-50 text-slate-700 border border-slate-200 group relative',
    avatar: 'w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0',
    userAvatar: 'bg-slate-200',
    assistantAvatar: 'bg-primary-light',
  },

  sidebar: {
    container: 'border-r border-slate-100 overflow-y-auto bg-slate-50 h-full',
    header: 'sticky top-0 bg-slate-50 px-5 py-4 border-b border-slate-100 z-10',
    content: 'p-5 bg-slate-50',
  },

  badge: {
    primary: 'bg-primary-light text-primary px-4 py-3 rounded-lg text-sm font-medium',
    success: 'bg-success-light text-success-dark px-2 py-1 rounded text-xs font-medium',
    warning: 'bg-warning-light text-warning-dark px-2 py-1 rounded text-xs font-medium',
    error: 'bg-error-light text-error-dark px-2 py-1 rounded text-xs font-medium',
    slate: 'bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium',
  },

  progress: {
    bar: 'h-1 bg-slate-100 overflow-hidden rounded-b',
    fill: 'h-full bg-primary transition-all duration-300',
    fillWarning: 'h-full bg-warning transition-all duration-300',
    fillError: 'h-full bg-error transition-all duration-300',
  },

  alert: {
    warning: 'bg-amber-50 border border-amber-100 rounded-md p-4 flex items-start',
    error: 'bg-error-light border border-error/20 rounded-md p-4 flex items-start',
    success: 'bg-success-light border border-success/20 rounded-md p-4 flex items-start',
  },

  status: {
    dot: 'w-2 h-2 rounded-full mr-2',
    dotPrimary: 'bg-primary',
    dotSlate: 'bg-slate-400',
    dotSuccess: 'bg-success',
    dotError: 'bg-error',
  },
};

export const combineStyles = (...styles: (string | undefined | false)[]): string => {
  return styles.filter(Boolean).join(' ');
};