

import React from 'react';
import { Skeleton } from './Skeleton';


interface SetupGuideSkeletonProps {
  className?: string;
  stepCount?: number;
}

interface HeaderSkeletonProps {
  className?: string;
}

interface StepSkeletonProps {
  index: number;
  className?: string;
}

interface StepContentProps {
  className?: string;
}

interface IconSkeletonProps {
  className?: string;
  isRounded?: boolean;
}


const SETUP_GUIDE_SKELETON_CLASSES = {
  container: 'bg-white rounded-xl shadow-sm border border-[#e1e3e5] overflow-hidden',
  content: 'p-6',
  header: 'flex items-center justify-between mb-4',
  headerContent: '',
  title: 'w-32 h-6 mb-2',
  subtitle: 'w-24 h-4',
  headerIcon: 'w-8 h-8 rounded-lg',
  stepsContainer: 'space-y-6',
  step: 'flex items-start',
  stepIcon: 'w-8 h-8 rounded-full',
  stepContent: 'ml-4 flex-1',
  stepTitle: 'w-48 h-4 mb-2',
  stepDescription: 'w-64 h-4 mb-2',
  stepMeta: 'w-24 h-4'
} as const;

const SETUP_GUIDE_SKELETON_DEFAULT_CONFIG = {
  defaultClassName: '',
  defaultStepCount: 3,
  minStepCount: 1,
  maxStepCount: 10
} as const;

const SETUP_GUIDE_SKELETON_ANIMATION_CONFIG = {
  skeletonAnimation: 'animate-pulse',
  stepDelay: 100
} as const;


const setupGuideSkeletonUtils = {

  getContainerClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.container} ${className}`.trim();
  },


  getContentClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.content} ${className}`.trim();
  },


  getHeaderClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.header} ${className}`.trim();
  },


  getHeaderContentClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.headerContent} ${className}`.trim();
  },


  getTitleClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.title} ${className}`.trim();
  },


  getSubtitleClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.subtitle} ${className}`.trim();
  },


  getHeaderIconClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.headerIcon} ${className}`.trim();
  },


  getStepsContainerClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.stepsContainer} ${className}`.trim();
  },


  getStepClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.step} ${className}`.trim();
  },


  getStepIconClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.stepIcon} ${className}`.trim();
  },


  getStepContentClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.stepContent} ${className}`.trim();
  },


  getStepTitleClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.stepTitle} ${className}`.trim();
  },


  getStepDescriptionClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.stepDescription} ${className}`.trim();
  },


  getStepMetaClasses: (className: string): string => {
    return `${SETUP_GUIDE_SKELETON_CLASSES.stepMeta} ${className}`.trim();
  },


  validateProps: (props: SetupGuideSkeletonProps): boolean => {
    return (
      (props.className === undefined || typeof props.className === 'string') &&
      (props.stepCount === undefined || (
        typeof props.stepCount === 'number' &&
        props.stepCount >= SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.minStepCount &&
        props.stepCount <= SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.maxStepCount
      ))
    );
  },


  getValidatedStepCount: (stepCount?: number): number => {
    if (stepCount === undefined) {
      return SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.defaultStepCount;
    }
    
    return Math.max(
      SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.minStepCount,
      Math.min(stepCount, SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.maxStepCount)
    );
  },


  createStepIndices: (stepCount: number): number[] => {
    return Array.from({ length: stepCount }, (_, i) => i);
  },


  getDefaultClassName: (className?: string): string => {
    return className || SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.defaultClassName;
  }
} as const;


const IconSkeleton: React.FC<IconSkeletonProps> = ({ 
  className = SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.defaultClassName,
  isRounded = false
}) => (
  <Skeleton 
    className={`${isRounded ? 'rounded-full' : 'rounded-lg'} ${className}`.trim()} 
  />
);

const HeaderSkeleton: React.FC<HeaderSkeletonProps> = ({ 
  className = SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={setupGuideSkeletonUtils.getHeaderClasses(className)}>
    <div className={setupGuideSkeletonUtils.getHeaderContentClasses('')}>
      <Skeleton className={setupGuideSkeletonUtils.getTitleClasses('')} />
      <Skeleton className={setupGuideSkeletonUtils.getSubtitleClasses('')} />
    </div>
    <IconSkeleton className={setupGuideSkeletonUtils.getHeaderIconClasses('')} />
  </div>
);

const StepContent: React.FC<StepContentProps> = ({ 
  className = SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={setupGuideSkeletonUtils.getStepContentClasses(className)}>
    <Skeleton className={setupGuideSkeletonUtils.getStepTitleClasses('')} />
    <Skeleton className={setupGuideSkeletonUtils.getStepDescriptionClasses('')} />
    <Skeleton className={setupGuideSkeletonUtils.getStepMetaClasses('')} />
  </div>
);

const StepSkeleton: React.FC<StepSkeletonProps> = ({ 
  index, 
  className = SETUP_GUIDE_SKELETON_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={setupGuideSkeletonUtils.getStepClasses(className)}>
    <IconSkeleton 
      className={setupGuideSkeletonUtils.getStepIconClasses('')} 
      isRounded={true}
    />
    <StepContent />
  </div>
);


export function SetupGuideSkeleton({ 
  className, 
  stepCount 
}: SetupGuideSkeletonProps) {

  if (!setupGuideSkeletonUtils.validateProps({ className, stepCount })) {
    
    return null;
  }


  const validatedStepCount = setupGuideSkeletonUtils.getValidatedStepCount(stepCount);
  const defaultClassName = setupGuideSkeletonUtils.getDefaultClassName(className);
  const stepIndices = setupGuideSkeletonUtils.createStepIndices(validatedStepCount);

  return (
    <div className={setupGuideSkeletonUtils.getContainerClasses(defaultClassName)}>
      <div className={setupGuideSkeletonUtils.getContentClasses('')}>
        <HeaderSkeleton />
        <div className={setupGuideSkeletonUtils.getStepsContainerClasses('')}>
          {stepIndices.map((index) => (
            <StepSkeleton key={`step-${index}`} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SetupGuideSkeleton;


export type { 
  SetupGuideSkeletonProps, 
  HeaderSkeletonProps, 
  StepSkeletonProps, 
  StepContentProps, 
  IconSkeletonProps 
};


export { 
  SETUP_GUIDE_SKELETON_CLASSES, 
  SETUP_GUIDE_SKELETON_DEFAULT_CONFIG, 
  SETUP_GUIDE_SKELETON_ANIMATION_CONFIG, 
  setupGuideSkeletonUtils 
};