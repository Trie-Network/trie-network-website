import { motion } from 'framer-motion';
import { componentStyles } from '@/utils';

export const Slider = ({ value, onChange, min, max, step, displayValue, className = "" }) => {
    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center justify-between mb-2">
                {displayValue && <span className={`text-sm ${componentStyles.badge.primary} shadow-sm`}>{displayValue}</span>}
            </div>
            <div className="relative h-8 flex items-center">
                <div className="absolute left-0 right-0 h-1 bg-slate-200 rounded-full"></div>
                <div
                    className="absolute left-0 h-1 bg-primary rounded-full"
                    style={{ width: `${((value - min) / (max - min)) * 100}%` }}
                ></div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    className="absolute w-full h-8 appearance-none cursor-pointer bg-transparent z-10"
                    style={{
                        WebkitAppearance: 'none',
                    }}
                />
            </div>
        </div>
    )
}

export const Dropdown = ({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    className = "",
    disabled = false
}) => {
    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <select
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    className={`w-full appearance-none [-webkit-appearance:none] [-moz-appearance:none] pr-10 cursor-pointer ${componentStyles.input.default} shadow-sm hover:border-primary`}
                    style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                    }}
                >
                    {placeholder && !value && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option, index) => (
                        <option key={index} value={option.value}
                            className="bg-white text-slate-800 p-2"
                        >
                            {option.name}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary">
                    <div className="p-1 rounded-full bg-primary-light">
                    </div>
                </div>
            </div>
        </div>
    )
}

export const ThinkingAnimation = () => {
    return (
        <div className="flex items-center justify-center py-4">
            <div className="flex space-x-2">
                {[0, 1, 2].map((dot) => (
                    <motion.div
                        key={dot}
                        className="w-3 h-3 bg-primary rounded-full"
                        initial={{ opacity: 0.3 }}
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            y: ["0%", "-30%", "0%"]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: dot * 0.3
                        }}
                    />
                ))}
            </div>
            <motion.div
                className="ml-3 text-primary font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                AI is thinking...
            </motion.div>
        </div>
    );
}