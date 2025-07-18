import { motion } from 'framer-motion';

interface FilterButtonProps {
  label: string;
  icon?: string;
  color?: string;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function FilterButton({ label, icon, color = 'bg-gradient-to-br from-gray-500 to-gray-600', isSelected, onSelect, onRemove }: FilterButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition-all duration-200 flex items-center gap-2 group relative cursor-pointer min-h-[40px] ${
        isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50'
      }`}
    >
      <div className={`w-5 h-5 ${color} rounded flex items-center justify-center text-white`}>
        {icon && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d={icon}
            />
          </svg>
        )}
      </div>
      <span className={isSelected ? 'font-semibold text-primary' : ''}>{label}</span>
      {isSelected && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-auto p-1 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}