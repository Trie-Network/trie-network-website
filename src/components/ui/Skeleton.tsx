
import React from 'react';
import { motion } from 'framer-motion';

interface BaseSkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  height?: string | number;
  width?: string | number;
}

interface SkeletonContainerProps {
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}

interface ShimmerEffectProps {
  className?: string;
}

interface SkeletonVariantConfig {
  rectangular: string;
  circular: string;
  text: string;
}

const BASE_SKELETON_CLASSES = {
  base: 'relative overflow-hidden bg-gray-200 animate-pulse',
  shimmer: 'absolute inset-0 -translate-x-full'
} as const;

const BASE_SKELETON_VARIANTS: SkeletonVariantConfig = {
  rectangular: 'rounded-lg',
  circular: 'rounded-full',
  text: 'rounded'
} as const;

const BASE_SKELETON_DEFAULT_CONFIG = {
  defaultClassName: '',
  defaultVariant: 'rectangular' as const,
  defaultHeight: undefined,
  defaultWidth: undefined
} as const;

const BASE_SKELETON_ANIMATION_CONFIG = {
  shimmerAnimation: {
    translateX: ['0%', '100%'] as [string, string]
  },
  shimmerTransition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear' as const
  },
  shimmerGradient: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
} as const;

const baseSkeletonUtils = {
  getBaseClasses: (className: string): string => {
    return `${BASE_SKELETON_CLASSES.base} ${className}`.trim();
  },

  getShimmerClasses: (className: string): string => {
    return `${BASE_SKELETON_CLASSES.shimmer} ${className}`.trim();
  },

  getVariantClasses: (variant: keyof SkeletonVariantConfig): string => {
    return BASE_SKELETON_VARIANTS[variant];
  },

  getCombinedClasses: (variant: keyof SkeletonVariantConfig, className: string): string => {
    const baseClasses = baseSkeletonUtils.getBaseClasses('');
    const variantClasses = baseSkeletonUtils.getVariantClasses(variant);
    return `${baseClasses} ${variantClasses} ${className}`.trim();
  },

  createStyles: (height?: string | number, width?: string | number): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    
    if (height !== undefined) {
      styles.height = height;
    }
    
    if (width !== undefined) {
      styles.width = width;
    }
    
    return styles;
  },

  validateProps: (props: BaseSkeletonProps): boolean => {
    return (
      (props.className === undefined || typeof props.className === 'string') &&
      (props.variant === undefined || ['rectangular', 'circular', 'text'].includes(props.variant)) &&
      (props.height === undefined || typeof props.height === 'string' || typeof props.height === 'number') &&
      (props.width === undefined || typeof props.width === 'string' || typeof props.width === 'number')
    );
  },

  getValidatedVariant: (variant?: 'rectangular' | 'circular' | 'text'): keyof SkeletonVariantConfig => {
    if (variant && ['rectangular', 'circular', 'text'].includes(variant)) {
      return variant;
    }
    return BASE_SKELETON_DEFAULT_CONFIG.defaultVariant;
  },

  getDefaultClassName: (className?: string): string => {
    return className || BASE_SKELETON_DEFAULT_CONFIG.defaultClassName;
  },

  getShimmerStyle: (): React.CSSProperties => {
    return {
      background: BASE_SKELETON_ANIMATION_CONFIG.shimmerGradient
    };
  }
} as const;


const ShimmerEffect: React.FC<ShimmerEffectProps> = ({ 
  className = BASE_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <motion.div
    className={baseSkeletonUtils.getShimmerClasses(className)}
    animate={BASE_SKELETON_ANIMATION_CONFIG.shimmerAnimation}
    transition={BASE_SKELETON_ANIMATION_CONFIG.shimmerTransition}
    style={baseSkeletonUtils.getShimmerStyle()}
  />
);

const SkeletonContainer: React.FC<SkeletonContainerProps> = ({ 
  className, 
  style, 
  children 
}) => (
  <div className={className} style={style}>
    {children}
  </div>
);


export function Skeleton({ 
  className, 
  variant, 
  height, 
  width 
}: BaseSkeletonProps) {

  if (!baseSkeletonUtils.validateProps({ className, variant, height, width })) {
    
    return null;
  }


  const validatedVariant = baseSkeletonUtils.getValidatedVariant(variant);
  const defaultClassName = baseSkeletonUtils.getDefaultClassName(className);
  const combinedClasses = baseSkeletonUtils.getCombinedClasses(validatedVariant, defaultClassName);
  const styles = baseSkeletonUtils.createStyles(height, width);

  return (
    <SkeletonContainer className={combinedClasses} style={styles}>
      <ShimmerEffect />
    </SkeletonContainer>
  );
}

export default Skeleton;


export type { 
  BaseSkeletonProps, 
  SkeletonContainerProps, 
  ShimmerEffectProps, 
  SkeletonVariantConfig 
};


export { 
  BASE_SKELETON_CLASSES, 
  BASE_SKELETON_VARIANTS, 
  BASE_SKELETON_DEFAULT_CONFIG, 
  BASE_SKELETON_ANIMATION_CONFIG, 
  baseSkeletonUtils 
};