

import React, { ChangeEvent } from 'react';


interface SearchInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

interface SearchIconProps {
  className?: string;
}

interface ClearButtonProps {
  onClick: () => void;
  className?: string;
}

interface InputContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface SearchInputFieldProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className: string;
}


const SEARCH_INPUT_CLASSES = {
  container: 'relative',
  input: 'w-full pl-12 pr-4 h-12 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284a5] focus:ring-offset-0 bg-white border border-[#e1e3e5] placeholder-gray-400 text-gray-900',
  searchIconContainer: 'absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none',
  searchIcon: 'w-4 h-4 text-gray-400',
  clearButton: 'absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
  clearIcon: 'w-4 h-4'
} as const;

const SEARCH_INPUT_DEFAULT_CONFIG = {
  defaultPlaceholder: 'Search...',
  defaultClassName: '',
  inputType: 'search'
} as const;

const SEARCH_INPUT_ANIMATION_CONFIG = {
  transitionDuration: 'transition-colors duration-200',
  hoverTransition: 'hover:transition-colors hover:duration-200'
} as const;

const SEARCH_INPUT_ICONS = {
  search: {
    viewBox: '0 0 24 24',
    path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    strokeWidth: '2'
  },
  clear: {
    viewBox: '0 0 24 24',
    path: 'M6 18L18 6M6 6l12 12',
    strokeWidth: '2'
  }
} as const;


const searchInputUtils = {

  getContainerClasses: (className: string): string => {
    return `${SEARCH_INPUT_CLASSES.container} ${className}`.trim();
  },

  
  getInputClasses: (className: string): string => {
    return `${SEARCH_INPUT_CLASSES.input} ${className}`.trim();
  },

  
  getSearchIconContainerClasses: (className: string): string => {
    return `${SEARCH_INPUT_CLASSES.searchIconContainer} ${className}`.trim();
  },

 
  getSearchIconClasses: (className: string): string => {
    return `${SEARCH_INPUT_CLASSES.searchIcon} ${className}`.trim();
  },

  
  getClearButtonClasses: (className: string): string => {
    return `${SEARCH_INPUT_CLASSES.clearButton} ${className}`.trim();
  },

  
  getClearIconClasses: (className: string): string => {
    return `${SEARCH_INPUT_CLASSES.clearIcon} ${className}`.trim();
  },

  
  validateProps: (props: SearchInputProps): boolean => {
    return (
      typeof props.value === 'string' &&
      typeof props.onChange === 'function' &&
      (props.placeholder === undefined || typeof props.placeholder === 'string') &&
      (props.className === undefined || typeof props.className === 'string') &&
      (props.onClear === undefined || typeof props.onClear === 'function')
    );
  },

  
  handleClearClick: (onClear: () => void): void => {
    onClear();
  },

  
  shouldShowClearButton: (value: string, onClear?: () => void): boolean => {
    return Boolean(value && onClear);
  },

  
  getDefaultPlaceholder: (placeholder?: string): string => {
    return placeholder || SEARCH_INPUT_DEFAULT_CONFIG.defaultPlaceholder;
  },

  
  getDefaultClassName: (className?: string): string => {
    return className || SEARCH_INPUT_DEFAULT_CONFIG.defaultClassName;
  }
} as const;


const SearchIcon: React.FC<SearchIconProps> = ({ 
  className = SEARCH_INPUT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <svg 
    className={searchInputUtils.getSearchIconClasses(className)} 
    fill="none" 
    viewBox={SEARCH_INPUT_ICONS.search.viewBox} 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={SEARCH_INPUT_ICONS.search.strokeWidth} 
      d={SEARCH_INPUT_ICONS.search.path} 
    />
  </svg>
);

const ClearIcon: React.FC<SearchIconProps> = ({ 
  className = SEARCH_INPUT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <svg 
    className={searchInputUtils.getClearIconClasses(className)} 
    fill="none" 
    viewBox={SEARCH_INPUT_ICONS.clear.viewBox} 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={SEARCH_INPUT_ICONS.clear.strokeWidth} 
      d={SEARCH_INPUT_ICONS.clear.path} 
    />
  </svg>
);

const ClearButton: React.FC<ClearButtonProps> = ({ 
  onClick, 
  className = SEARCH_INPUT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <button
    onClick={() => searchInputUtils.handleClearClick(onClick)}
    className={searchInputUtils.getClearButtonClasses(className)}
    type="button"
    aria-label="Clear search"
  >
    <ClearIcon />
  </button>
);

const InputContainer: React.FC<InputContainerProps> = ({ 
  children, 
  className = SEARCH_INPUT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <div className={searchInputUtils.getContainerClasses(className)}>
    {children}
  </div>
);

const SearchInputField: React.FC<SearchInputFieldProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  className 
}) => (
  <input
    type={SEARCH_INPUT_DEFAULT_CONFIG.inputType}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={searchInputUtils.getInputClasses(className)}
    aria-label="Search input"
  />
);


export function SearchInput({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  onClear 
}: SearchInputProps) {

  if (!searchInputUtils.validateProps({ value, onChange, placeholder, className, onClear })) {
    
    return null;
  }

  const defaultPlaceholder = searchInputUtils.getDefaultPlaceholder(placeholder);
  const defaultClassName = searchInputUtils.getDefaultClassName(className);
  const shouldShowClear = searchInputUtils.shouldShowClearButton(value, onClear);

  return (
    <InputContainer className={defaultClassName}>
      <SearchInputField
        value={value}
        onChange={onChange}
        placeholder={defaultPlaceholder}
        className=""
      />
      <div className={searchInputUtils.getSearchIconContainerClasses('')}>
        <SearchIcon />
      </div>
      {shouldShowClear && (
        <ClearButton onClick={onClear!} />
      )}
    </InputContainer>
  );
}

export default SearchInput;


export type { 
  SearchInputProps, 
  SearchIconProps, 
  ClearButtonProps, 
  InputContainerProps, 
  SearchInputFieldProps 
};


export { 
  SEARCH_INPUT_CLASSES, 
  SEARCH_INPUT_DEFAULT_CONFIG, 
  SEARCH_INPUT_ANIMATION_CONFIG, 
  SEARCH_INPUT_ICONS, 
  searchInputUtils 
};