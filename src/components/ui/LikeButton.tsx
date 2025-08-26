

import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/utils/formatNumber';


interface LikeButtonProps {
  isLiked: boolean;
  likes: string | number | undefined;
  onLike: (e: React.MouseEvent) => void;
  className?: string;
}

interface HeartIconProps {
  isLiked: boolean;
  className?: string;
}

interface LikeCountProps {
  likes: string | number | undefined;
  className?: string;
}


const HEART_ANIMATION_VARIANTS = {
  initial: { scale: 0 },
  animate: {
    scale: [0, 1.2, 1] as [number, number, number],
    transition: { duration: 0.3, times: [0, 0.6, 1] as [number, number, number] }
  },
  exit: {
    scale: 0,
    transition: { duration: 0.15 }
  }
};

const BUTTON_ANIMATION_CONFIG = {
  type: "spring" as const,
  stiffness: 400,
  damping: 17
} as const;


const LIKE_BUTTON_CLASSES = {
  container: 'p-2 sm:p-2.5 bg-white rounded-full shadow-sm hover:scale-105 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 group z-10 relative isolate',
  iconContainer: 'relative w-4 h-4 sm:w-5 sm:h-5',
  iconWrapper: 'absolute inset-0 flex items-center justify-center',
  filledHeart: 'w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:scale-110 transition-transform duration-200',
  outlineHeart: 'w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-red-500 group-hover:scale-110 transition-all duration-200',
  likeCount: 'text-xs sm:text-sm font-medium text-gray-700 select-none pointer-events-none'
} as const;

const LIKE_BUTTON_DEFAULT_CONFIG = {
  defaultClassName: '',
  defaultLikes: 0,
  tapScale: 0.9
} as const;


const likeButtonUtils = {
  
  getAriaLabel: (isLiked: boolean): string => {
    return isLiked ? 'Unlike' : 'Like';
  },

  
  formatLikeCount: (likes: string | number | undefined): string => {
    return formatNumber(likes || LIKE_BUTTON_DEFAULT_CONFIG.defaultLikes);
  },

  
  handleLikeClick: (e: React.MouseEvent, onLike: (e: React.MouseEvent) => void): void => {
    e.stopPropagation();
    onLike(e);
  },

  
  getButtonClasses: (className: string): string => {
    return `${LIKE_BUTTON_CLASSES.container} ${className}`.trim();
  },

  
  validateProps: (props: LikeButtonProps): boolean => {
    return (
      typeof props.isLiked === 'boolean' &&
      (props.likes === undefined || typeof props.likes === 'string' || typeof props.likes === 'number') &&
      typeof props.onLike === 'function' &&
      (props.className === undefined || typeof props.className === 'string')
    );
  }
} as const;


const HeartIcon: React.FC<HeartIconProps> = ({ isLiked, className = '' }) => (
  <div className={`${LIKE_BUTTON_CLASSES.iconContainer} ${className}`}>
    <AnimatePresence mode="wait">
      {isLiked ? (
        <motion.div
          key="filled"
          variants={HEART_ANIMATION_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          className={LIKE_BUTTON_CLASSES.iconWrapper}
        >
          <svg
            className={LIKE_BUTTON_CLASSES.filledHeart}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ) : (
        <motion.div
          key="outline"
          variants={HEART_ANIMATION_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          className={LIKE_BUTTON_CLASSES.iconWrapper}
        >
          <svg
            className={LIKE_BUTTON_CLASSES.outlineHeart}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const LikeCount: React.FC<LikeCountProps> = ({ likes, className = '' }) => (
  <span className={`${LIKE_BUTTON_CLASSES.likeCount} ${className}`}>
    {likeButtonUtils.formatLikeCount(likes)}
  </span>
);


export function LikeButton({ 
  isLiked, 
  likes, 
  onLike, 
  className = LIKE_BUTTON_DEFAULT_CONFIG.defaultClassName 
}: LikeButtonProps) {
  
  if (!likeButtonUtils.validateProps({ isLiked, likes, onLike, className })) {
   
    return null;
  }

  return (
    <motion.button
      onClick={(e) => likeButtonUtils.handleLikeClick(e, onLike)}
      className={likeButtonUtils.getButtonClasses(className)}
      whileTap={{ scale: LIKE_BUTTON_DEFAULT_CONFIG.tapScale }}
      transition={BUTTON_ANIMATION_CONFIG}
      aria-label={likeButtonUtils.getAriaLabel(isLiked)}
    >
      <HeartIcon isLiked={isLiked} />
      <LikeCount likes={likes} />
    </motion.button>
  );
}


export type { LikeButtonProps, HeartIconProps, LikeCountProps };


export { 
  LIKE_BUTTON_CLASSES, 
  LIKE_BUTTON_DEFAULT_CONFIG, 
  HEART_ANIMATION_VARIANTS, 
  BUTTON_ANIMATION_CONFIG, 
  likeButtonUtils 
};