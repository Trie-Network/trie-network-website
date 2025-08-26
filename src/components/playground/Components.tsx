import { motion } from 'framer-motion';


interface SliderProps {
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step?: number;
  displayValue?: string | number;
  className?: string;
}

interface DropdownOption {
  value: string;
  name: string;
}

interface DropdownProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface ThinkingAnimationProps {
  className?: string;
  text?: string;
}

interface SliderTrackProps {
  value: number;
  min: number;
  max: number;
}

interface SliderInputProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface DropdownSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
}

interface DropdownIconProps {
  className?: string;
}

interface ThinkingDotProps {
  index: number;
}


const DEFAULT_STEP = 1;
const DEFAULT_CLASSNAME = '';
const DEFAULT_PLACEHOLDER = 'Select an option';
const DEFAULT_THINKING_TEXT = 'AI is thinking...';
const THINKING_DOTS_COUNT = 3;
const THINKING_ANIMATION_DURATION = 1.5;
const THINKING_DOT_DELAY = 0.3;
const THINKING_TEXT_DELAY = 0.3;

const ANIMATION_CONFIG = {
  thinking: {
    duration: THINKING_ANIMATION_DURATION,
    repeat: Infinity,
    dotDelay: THINKING_DOT_DELAY,
    textDelay: THINKING_TEXT_DELAY
  },
  opacity: {
    initial: 0.3,
    animate: [0.3, 1, 0.3] as [number, number, number]
  },
  y: {
    initial: '0%',
    animate: ['0%', '-30%', '0%'] as [string, string, string]
  }
};

const LAYOUT_CLASSES = {
  slider: {
    container: 'w-full',
    header: 'flex items-center justify-between mb-2',
    displayValue: 'text-sm bg-primary-light text-primary px-3 py-1.5 rounded-md font-medium shadow-sm',
    track: 'relative h-8 flex items-center',
    background: 'absolute left-0 right-0 h-1 bg-slate-200 rounded-full',
    progress: 'absolute left-0 h-1 bg-primary rounded-full',
    input: 'absolute w-full h-8 appearance-none cursor-pointer bg-transparent z-10'
  },
  dropdown: {
    container: 'relative',
    select: 'w-full appearance-none [-webkit-appearance:none] [-moz-appearance:none] bg-white border border-slate-200 rounded-lg px-4 py-3 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-sm hover:border-primary cursor-pointer',
    option: 'bg-white text-slate-800 p-2',
    iconContainer: 'pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary',
    icon: 'p-1 rounded-full bg-primary-light'
  },
  thinking: {
    container: 'flex items-center justify-center py-4',
    dots: 'flex space-x-2',
    dot: 'w-3 h-3 bg-primary rounded-full',
    text: 'ml-3 text-primary font-medium'
  }
} as const;

const STYLES = {
  webkitAppearance: {
    WebkitAppearance: 'none'
  },
  mozAppearance: {
    WebkitAppearance: 'none',
    MozAppearance: 'none'
  }
} as const;


const calculateSliderProgress = (value: number, min: number, max: number): number => {
  return ((value - min) / (max - min)) * 100;
};

const getSliderProgressStyle = (value: number, min: number, max: number): React.CSSProperties => {
  return {
    width: `${calculateSliderProgress(value, min, max)}%`
  };
};

const createThinkingAnimation = (index: number) => ({
  opacity: ANIMATION_CONFIG.opacity.animate,
  y: ANIMATION_CONFIG.y.animate
});

const getThinkingTransition = (index: number) => ({
  duration: ANIMATION_CONFIG.thinking.duration,
  repeat: ANIMATION_CONFIG.thinking.repeat,
  delay: index * ANIMATION_CONFIG.thinking.dotDelay
});

const getTextTransition = () => ({
  duration: ANIMATION_CONFIG.thinking.textDelay
});


const SliderTrack: React.FC<SliderTrackProps> = ({ value, min, max }) => (
  <>
    <div className={LAYOUT_CLASSES.slider.background}></div>
    <div 
      className={LAYOUT_CLASSES.slider.progress}
      style={getSliderProgressStyle(value, min, max)}
    ></div>
  </>
);

const SliderInput: React.FC<SliderInputProps> = ({ 
  min, 
  max, 
  step = DEFAULT_STEP, 
  value, 
  onChange 
}) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={onChange}
    className={LAYOUT_CLASSES.slider.input}
    style={STYLES.webkitAppearance}
  />
);

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false
}) => (
  <select
    disabled={disabled}
    value={value}
    onChange={onChange}
    className={LAYOUT_CLASSES.dropdown.select}
    style={STYLES.mozAppearance}
  >
    {placeholder && !value && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {options.map((option, index) => (
      <option 
        key={index} 
        value={option.value}
        className={LAYOUT_CLASSES.dropdown.option}
      >
        {option.name}
      </option>
    ))}
  </select>
);

const DropdownIcon: React.FC<DropdownIconProps> = ({ className = '' }) => (
  <div className={`${LAYOUT_CLASSES.dropdown.iconContainer} ${className}`}>
    <div className={LAYOUT_CLASSES.dropdown.icon}>
      
    </div>
  </div>
);

const ThinkingDot: React.FC<ThinkingDotProps> = ({ index }) => (
  <motion.div
    className={LAYOUT_CLASSES.thinking.dot}
    initial={{ opacity: ANIMATION_CONFIG.opacity.initial }}
    animate={createThinkingAnimation(index)}
    transition={getThinkingTransition(index)}
  />
);


export const Slider: React.FC<SliderProps> = ({ 
  value, 
  onChange, 
  min, 
  max, 
  step = DEFAULT_STEP, 
  displayValue, 
  className = DEFAULT_CLASSNAME 
}) => {
  return (
    <div className={`${LAYOUT_CLASSES.slider.container} ${className}`}>
      <div className={LAYOUT_CLASSES.slider.header}>
        {displayValue && (
          <span className={LAYOUT_CLASSES.slider.displayValue}>
            {displayValue}
          </span>
        )}
      </div>
      <div className={LAYOUT_CLASSES.slider.track}>
        <SliderTrack value={value} min={min} max={max} />
        <SliderInput 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={onChange} 
        />
      </div>
    </div>
  );
};

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = DEFAULT_PLACEHOLDER,
  className = DEFAULT_CLASSNAME,
  disabled = false
}) => {
  return (
    <div className={`${LAYOUT_CLASSES.dropdown.container} ${className}`}>
      <div className="relative">
        <DropdownSelect
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
        />
        <DropdownIcon />
      </div>
    </div>
  );
};

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ 
  className = DEFAULT_CLASSNAME,
  text = DEFAULT_THINKING_TEXT
}) => {
  return (
    <div className={`${LAYOUT_CLASSES.thinking.container} ${className}`}>
      <div className={LAYOUT_CLASSES.thinking.dots}>
        {Array.from({ length: THINKING_DOTS_COUNT }).map((_, index) => (
          <ThinkingDot key={index} index={index} />
        ))}
      </div>
      <motion.div
        className={LAYOUT_CLASSES.thinking.text}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={getTextTransition()}
      >
        {text}
      </motion.div>
    </div>
  );
};