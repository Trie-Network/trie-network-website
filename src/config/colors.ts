

import { isMainnet } from './network';


interface NetworkColorScheme {
  primary: string;
  primaryHover: string;
  primaryRgb: string;
}

interface ColorUtility {
  getPrimaryColor: () => string;
  getHoverColor: () => string;
  getRgbColor: () => string;
  getColorScheme: () => NetworkColorScheme;
}

interface ColorValidation {
  isValidHexColor: (color: string) => boolean;
  isValidRgbColor: (color: string) => boolean;
  validateColorScheme: (scheme: NetworkColorScheme) => boolean;
}


const MAINNET_COLORS: NetworkColorScheme = {
  primary: '#a86e27',
  primaryHover: '#b3c92f',
  primaryRgb: '197, 219, 53'
} as const;

const TESTNET_COLORS: NetworkColorScheme = {
  primary: '#0284a5',
  primaryHover: '#0276a4',
  primaryRgb: '2, 132, 165'
} as const;

const COLOR_CONFIG = {
  defaultNetwork: 'testnet',
  fallbackColor: '#0284a5',
  fallbackHoverColor: '#0276a4',
  fallbackRgbColor: '2, 132, 165'
} as const;

const COLOR_VALIDATION = {
  hexColorRegex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  rgbColorRegex: /^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/
} as const;


const colorUtils = {

  getCurrentColorScheme: (): NetworkColorScheme => {
    return isMainnet ? MAINNET_COLORS : TESTNET_COLORS;
  },


  getPrimaryColor: (): string => {
    return colorUtils.getCurrentColorScheme().primary;
  },


  getHoverColor: (): string => {
    return colorUtils.getCurrentColorScheme().primaryHover;
  },


  getRgbColor: (): string => {
    return colorUtils.getCurrentColorScheme().primaryRgb;
  },


  getColorScheme: (): NetworkColorScheme => {
    return colorUtils.getCurrentColorScheme();
  },


  isValidHexColor: (color: string): boolean => {
    return COLOR_VALIDATION.hexColorRegex.test(color);
  },


  isValidRgbColor: (color: string): boolean => {
    if (!COLOR_VALIDATION.rgbColorRegex.test(color)) {
      return false;
    }
    
    const rgbValues = color.split(',').map(val => parseInt(val.trim()));
    return rgbValues.every(val => val >= 0 && val <= 255);
  },


  validateColorScheme: (scheme: NetworkColorScheme): boolean => {
    return (
      colorUtils.isValidHexColor(scheme.primary) &&
      colorUtils.isValidHexColor(scheme.primaryHover) &&
      colorUtils.isValidRgbColor(scheme.primaryRgb)
    );
  },


  getFallbackColor: (): string => {
    const currentColor = colorUtils.getPrimaryColor();
    return colorUtils.isValidHexColor(currentColor) ? currentColor : COLOR_CONFIG.fallbackColor;
  },


  getFallbackHoverColor: (): string => {
    const currentHoverColor = colorUtils.getHoverColor();
    return colorUtils.isValidHexColor(currentHoverColor) ? currentHoverColor : COLOR_CONFIG.fallbackHoverColor;
  },

  
  getFallbackRgbColor: (): string => {
    const currentRgbColor = colorUtils.getRgbColor();
    return colorUtils.isValidRgbColor(currentRgbColor) ? currentRgbColor : COLOR_CONFIG.fallbackRgbColor;
  },

  
  hexToRgb: (hex: string): string => {
    if (!colorUtils.isValidHexColor(hex)) {
      return COLOR_CONFIG.fallbackRgbColor;
    }
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r}, ${g}, ${b}`;
    }
    
    return COLOR_CONFIG.fallbackRgbColor;
  },

  
  rgbToHex: (rgb: string): string => {
    if (!colorUtils.isValidRgbColor(rgb)) {
      return COLOR_CONFIG.fallbackColor;
    }
    
    const rgbValues = rgb.split(',').map(val => parseInt(val.trim()));
    const r = rgbValues[0];
    const g = rgbValues[1];
    const b = rgbValues[2];
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
} as const;


export const NETWORK_COLORS: NetworkColorScheme = colorUtils.getCurrentColorScheme();


export const getNetworkColor = (): string => colorUtils.getPrimaryColor();
export const getNetworkHoverColor = (): string => colorUtils.getHoverColor();
export const getNetworkRgbColor = (): string => colorUtils.getRgbColor();


export { 
  colorUtils, 
  MAINNET_COLORS, 
  TESTNET_COLORS, 
  COLOR_CONFIG, 
  COLOR_VALIDATION 
};


export type { 
  NetworkColorScheme, 
  ColorUtility, 
  ColorValidation 
};