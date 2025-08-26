

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';


interface Option {
  id: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

interface SelectButtonProps {
  selectedOption?: Option;
  className?: string;
}

interface SelectOptionsProps {
  options: Option[];
  className?: string;
}

interface SelectOptionProps {
  option: Option;
  className?: string;
}

interface ChevronIconProps {
  className?: string;
}

interface CheckIconProps {
  className?: string;
}


const SELECT_CLASSES = {
  container: 'relative',
  button: 'relative w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0284a5] focus:border-[#0284a5] text-sm text-gray-900',
  buttonText: 'block truncate font-medium',
  chevronContainer: 'absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none',
  chevronIcon: 'w-5 h-5 text-gray-400',
  options: 'absolute z-10 w-full mt-1 overflow-auto bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none text-sm',
  option: 'relative cursor-pointer select-none py-3 px-4',
  optionActive: 'bg-[#0284a5]/10 text-gray-900',
  optionInactive: 'text-gray-900',
  optionSelected: 'bg-[#0284a5]/5 text-gray-900',
  optionContent: 'flex items-center justify-between',
  optionLabel: 'block truncate font-medium',
  optionLabelSelected: 'font-medium text-[#0284a5]',
  optionLabelUnselected: 'font-medium text-gray-900',
  checkIcon: 'w-5 h-5',
  checkIconColor: 'text-[#0284a5]'
} as const;

const SELECT_DEFAULT_CONFIG = {
  defaultClassName: '',
  transitionDuration: 'transition ease-in duration-100',
  transitionFrom: 'opacity-100',
  transitionTo: 'opacity-0'
} as const;

const SELECT_ANIMATION_CONFIG = {
  leaveTransition: 'transition ease-in duration-100',
  leaveFrom: 'opacity-100',
  leaveTo: 'opacity-0'
} as const;

const SELECT_ICONS = {
  chevron: {
    viewBox: '0 0 24 24',
    path: 'M8 9l4 4 4-4',
    strokeWidth: '2'
  },
  check: {
    viewBox: '0 0 24 24',
    path: 'M5 13l4 4L19 7',
    strokeWidth: '2'
  }
} as const;


const selectUtils = {

  getContainerClasses: (className: string): string => {
    return `${SELECT_CLASSES.container} ${className}`.trim();
  },


  getButtonClasses: (className: string): string => {
    return `${SELECT_CLASSES.button} ${className}`.trim();
  },


  getButtonTextClasses: (className: string): string => {
    return `${SELECT_CLASSES.buttonText} ${className}`.trim();
  },


  getChevronContainerClasses: (className: string): string => {
    return `${SELECT_CLASSES.chevronContainer} ${className}`.trim();
  },


  getChevronIconClasses: (className: string): string => {
    return `${SELECT_CLASSES.chevronIcon} ${className}`.trim();
  },


  getOptionsClasses: (className: string): string => {
    return `${SELECT_CLASSES.options} ${className}`.trim();
  },


  getOptionClasses: (active: boolean, selected: boolean, className: string): string => {
    const baseClass = SELECT_CLASSES.option;
    const activeClass = active ? SELECT_CLASSES.optionActive : SELECT_CLASSES.optionInactive;
    const selectedClass = selected ? SELECT_CLASSES.optionSelected : '';
    
    return `${baseClass} ${activeClass} ${selectedClass} ${className}`.trim();
  },


  getOptionContentClasses: (className: string): string => {
    return `${SELECT_CLASSES.optionContent} ${className}`.trim();
  },


  getOptionLabelClasses: (selected: boolean, className: string): string => {
    const baseClass = SELECT_CLASSES.optionLabel;
    const selectedClass = selected ? SELECT_CLASSES.optionLabelSelected : SELECT_CLASSES.optionLabelUnselected;
    
    return `${baseClass} ${selectedClass} ${className}`.trim();
  },


  getCheckIconClasses: (className: string): string => {
    return `${SELECT_CLASSES.checkIcon} ${className}`.trim();
  },

  
  getCheckIconColorClasses: (className: string): string => {
    return `${SELECT_CLASSES.checkIconColor} ${className}`.trim();
  },

  
  validateProps: (props: SelectProps): boolean => {
    return (
      typeof props.value === 'string' &&
      typeof props.onChange === 'function' &&
      Array.isArray(props.options) &&
      props.options.every(option => 
        typeof option === 'object' &&
        typeof option.id === 'string' &&
        typeof option.label === 'string'
      ) &&
      (props.className === undefined || typeof props.className === 'string')
    );
  },

  
  findSelectedOption: (value: string, options: Option[]): Option | undefined => {
    return options.find(option => option.id === value);
  },

  
  handleOptionChange: (value: string, onChange: (value: string) => void): void => {
    onChange(value);
  },

  
  getDefaultClassName: (className?: string): string => {
    return className || SELECT_DEFAULT_CONFIG.defaultClassName;
  }
} as const;


const ChevronIcon: React.FC<ChevronIconProps> = ({ 
  className = SELECT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <svg 
    className={selectUtils.getChevronIconClasses(className)} 
    fill="none" 
    viewBox={SELECT_ICONS.chevron.viewBox} 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={SELECT_ICONS.chevron.strokeWidth} 
      d={SELECT_ICONS.chevron.path} 
    />
  </svg>
);

const CheckIcon: React.FC<CheckIconProps> = ({ 
  className = SELECT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <svg 
    className={selectUtils.getCheckIconClasses(className)} 
    fill="none" 
    viewBox={SELECT_ICONS.check.viewBox} 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={SELECT_ICONS.check.strokeWidth} 
      d={SELECT_ICONS.check.path} 
    />
  </svg>
);

const SelectButton: React.FC<SelectButtonProps> = ({ 
  selectedOption, 
  className = SELECT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Listbox.Button className={selectUtils.getButtonClasses(className)}>
    <span className={selectUtils.getButtonTextClasses('')}>
      {selectedOption?.label}
    </span>
    <span className={selectUtils.getChevronContainerClasses('')}>
      <ChevronIcon />
    </span>
  </Listbox.Button>
);

const SelectOption: React.FC<SelectOptionProps> = ({ 
  option, 
  className = SELECT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Listbox.Option
    key={option.id}
    value={option.id}
    className={({ active, selected }) =>
      selectUtils.getOptionClasses(active, selected, className)
    }
  >
    {({ selected }) => (
      <div className={selectUtils.getOptionContentClasses('')}>
        <span className={selectUtils.getOptionLabelClasses(selected, '')}>
          {option.label}
        </span>
        {selected && (
          <span className={selectUtils.getCheckIconColorClasses('')}>
            <CheckIcon />
          </span>
        )}
      </div>
    )}
  </Listbox.Option>
);

const SelectOptions: React.FC<SelectOptionsProps> = ({ 
  options, 
  className = SELECT_DEFAULT_CONFIG.defaultClassName 
}) => (
  <Listbox.Options className={selectUtils.getOptionsClasses(className)}>
    {options.map((option) => (
      <SelectOption key={option.id} option={option} />
    ))}
  </Listbox.Options>
);


export function Select({ 
  value, 
  onChange, 
  options, 
  className 
}: SelectProps) {
  
  if (!selectUtils.validateProps({ value, onChange, options, className })) {
   
    return null;
  }

  
  const selectedOption = selectUtils.findSelectedOption(value, options);
  const defaultClassName = selectUtils.getDefaultClassName(className);

  return (
    <Listbox value={value} onChange={(newValue) => selectUtils.handleOptionChange(newValue, onChange)}>
      <div className={selectUtils.getContainerClasses(defaultClassName)}>
        <SelectButton selectedOption={selectedOption} />
        <Transition
          as={Fragment}
          leave={SELECT_ANIMATION_CONFIG.leaveTransition}
          leaveFrom={SELECT_ANIMATION_CONFIG.leaveFrom}
          leaveTo={SELECT_ANIMATION_CONFIG.leaveTo}
        >
          <SelectOptions options={options} />
        </Transition>
      </div>
    </Listbox>
  );
}

export default Select;


export type { 
  SelectProps, 
  Option, 
  SelectButtonProps, 
  SelectOptionsProps, 
  SelectOptionProps, 
  ChevronIconProps, 
  CheckIconProps 
};


export { 
  SELECT_CLASSES, 
  SELECT_DEFAULT_CONFIG, 
  SELECT_ANIMATION_CONFIG, 
  SELECT_ICONS, 
  selectUtils 
};