
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';


interface ScrollRestorationProviderProps {
  children: React.ReactNode;
  scrollBehavior?: ScrollBehavior;
  scrollOptions?: ScrollToOptions;
}

interface ScrollConfig {
  top: number;
  left: number;
  behavior: ScrollBehavior;
}


const SCROLL_CONFIG: ScrollConfig = {
  top: 0,
  left: 0,
  behavior: 'smooth'
} as const;

const DEFAULT_SCROLL_OPTIONS: ScrollToOptions = {
  top: SCROLL_CONFIG.top,
  left: SCROLL_CONFIG.left,
  behavior: SCROLL_CONFIG.behavior
} as const;

const LAYOUT_CLASSES = {
  container: 'scroll-restoration-provider'
} as const;


const scrollUtils = {
  
  scrollToTop: (options: ScrollToOptions = DEFAULT_SCROLL_OPTIONS): void => {
    window.scrollTo(options);
  },


  scrollToPosition: (x: number, y: number, behavior: ScrollBehavior = 'smooth'): void => {
    window.scrollTo({
      top: y,
      left: x,
      behavior
    });
  },


  getScrollPosition: (): { x: number; y: number } => {
    return {
      x: window.scrollX,
      y: window.scrollY
    };
  },


  isScrolledToTop: (): boolean => {
    return window.scrollY === 0;
  },


  createScrollOptions: (
    top: number = SCROLL_CONFIG.top,
    left: number = SCROLL_CONFIG.left,
    behavior: ScrollBehavior = SCROLL_CONFIG.behavior
  ): ScrollToOptions => ({
    top,
    left,
    behavior
  })
} as const;


export function ScrollRestorationProvider({ 
  children, 
  scrollBehavior = SCROLL_CONFIG.behavior,
  scrollOptions 
}: ScrollRestorationProviderProps) {
  const location = useLocation();


  const finalScrollOptions = scrollOptions || scrollUtils.createScrollOptions(0, 0, scrollBehavior);

  useEffect(() => {

    scrollUtils.scrollToTop(finalScrollOptions);
  }, [location.pathname, finalScrollOptions]);

  return (
    <div className={LAYOUT_CLASSES.container}>
      {children}
    </div>
  );
}


export type { ScrollRestorationProviderProps, ScrollConfig };


export { SCROLL_CONFIG, DEFAULT_SCROLL_OPTIONS, scrollUtils };