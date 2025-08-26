

import { motion } from 'framer-motion';


interface FilterButtonProps {
  label: string;
  icon?: string;
  color?: string;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

interface FilterIconContainerProps {
  icon?: string;
  color: string;
}

interface RemoveButtonProps {
  onRemove: () => void;
}

interface LabelProps {
  label: string;
  isSelected: boolean;
}


const FILTER_BUTTON_LAYOUT_CLASSES = {
  container: 'w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition-all duration-200 flex items-center gap-2 group relative cursor-pointer min-h-[40px]',
  selectedContainer: 'bg-[#0284a5]/5 hover:bg-[#0284a5]/10',
  unselectedContainer: 'hover:bg-gray-50',
  iconContainer: 'w-5 h-5 rounded flex items-center justify-center text-white',
  icon: 'w-3 h-3',
  label: '',
  selectedLabel: 'font-semibold text-[#0284a5]',
  removeButton: 'ml-auto p-1 rounded-full hover:bg-[#0284a5]/20 transition-colors cursor-pointer',
  removeIcon: 'w-4 h-4 text-gray-400 hover:text-gray-600'
} as const;

const FILTER_BUTTON_DEFAULT_CONFIG = {
  defaultColor: 'bg-gradient-to-br from-gray-500 to-gray-600',
  selectedColor: '#0284a5',
  removeIconPath: 'M6 18L18 6M6 6l12 12'
} as const;

const FILTER_BUTTON_ANIMATION_CONFIG = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
} as const;


const filterButtonUtils = {
  
  getContainerClasses: (isSelected: boolean): string => {
    const baseClasses = FILTER_BUTTON_LAYOUT_CLASSES.container;
    const stateClasses = isSelected 
      ? FILTER_BUTTON_LAYOUT_CLASSES.selectedContainer 
      : FILTER_BUTTON_LAYOUT_CLASSES.unselectedContainer;
    
    return `${baseClasses} ${stateClasses}`;
  },

  
  getLabelClasses: (isSelected: boolean): string => {
    return isSelected ? FILTER_BUTTON_LAYOUT_CLASSES.selectedLabel : '';
  },

  
  handleRemoveClick: (e: React.MouseEvent, onRemove: () => void): void => {
    e.stopPropagation();
    onRemove();
  },

  
  validateProps: (props: FilterButtonProps): boolean => {
    return (
      typeof props.label === 'string' &&
      (props.icon === undefined || typeof props.icon === 'string') &&
      (props.color === undefined || typeof props.color === 'string') &&
      typeof props.isSelected === 'boolean' &&
      typeof props.onSelect === 'function' &&
      typeof props.onRemove === 'function'
    );
  },

  
  getColor: (color?: string): string => {
    return color || FILTER_BUTTON_DEFAULT_CONFIG.defaultColor;
  }
} as const;


const IconContainer: React.FC<FilterIconContainerProps> = ({ icon, color }) => (
  <div className={`${FILTER_BUTTON_LAYOUT_CLASSES.iconContainer} ${color}`}>
    {icon && (
      <svg className={FILTER_BUTTON_LAYOUT_CLASSES.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="1.5" 
          d={icon} 
        />
      </svg>
    )}
  </div>
);

const Label: React.FC<LabelProps> = ({ label, isSelected }) => (
  <span className={filterButtonUtils.getLabelClasses(isSelected)}>
    {label}
  </span>
);

const RemoveButton: React.FC<RemoveButtonProps> = ({ onRemove }) => (
  <div
    onClick={(e) => filterButtonUtils.handleRemoveClick(e, onRemove)}
    className={FILTER_BUTTON_LAYOUT_CLASSES.removeButton}
  >
    <svg 
      className={FILTER_BUTTON_LAYOUT_CLASSES.removeIcon} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d={FILTER_BUTTON_DEFAULT_CONFIG.removeIconPath} 
      />
    </svg>
  </div>
);


export function FilterButton({ 
  label, 
  icon, 
  color = FILTER_BUTTON_DEFAULT_CONFIG.defaultColor, 
  isSelected, 
  onSelect, 
  onRemove 
}: FilterButtonProps) {
  
  if (!filterButtonUtils.validateProps({ label, icon, color, isSelected, onSelect, onRemove })) {
    
    return null;
  }

  const resolvedColor = filterButtonUtils.getColor(color);

  return (
    <motion.div
      whileHover={FILTER_BUTTON_ANIMATION_CONFIG.hover}
      whileTap={FILTER_BUTTON_ANIMATION_CONFIG.tap}
      onClick={onSelect} 
      className={filterButtonUtils.getContainerClasses(isSelected)}
    >
      <IconContainer icon={icon} color={resolvedColor} />
      
      <Label label={label} isSelected={isSelected} />
      
      {isSelected && (
        <RemoveButton onRemove={onRemove} />
      )}
    </motion.div>
  );
}


export type { 
  FilterButtonProps,
  FilterIconContainerProps,
  RemoveButtonProps,
  LabelProps
};


export { FILTER_BUTTON_LAYOUT_CLASSES, FILTER_BUTTON_DEFAULT_CONFIG, FILTER_BUTTON_ANIMATION_CONFIG, filterButtonUtils };