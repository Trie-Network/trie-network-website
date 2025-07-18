import { Fragment, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { componentStyles } from '@/utils';

interface Option {
  id: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const ChevronDownIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export function Select({
  value,
  onChange,
  options,
  className = '',
  placeholder = 'Select an option...',
  disabled = false,
  error = false
}: SelectProps) {
  const selectedOption = useMemo(() =>
    options.find(option => option.id === value),
    [options, value]
  );

  const buttonClassName = useMemo(() => {
    const baseClass = "relative w-full px-4 py-2.5 text-left bg-white border rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-gray-900";
    const errorClass = error ? "border-red-300" : "border-gray-300";
    const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

    return `${baseClass} ${errorClass} ${disabledClass}`;
  }, [error, disabled]);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        <Listbox.Button className={buttonClassName}>
          <span className="block truncate font-medium">
            {selectedOption?.label || placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDownIcon />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 w-full mt-1 overflow-auto bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
            {options.map((option) => (
              <SelectOption key={option.id} option={option} />
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

const SelectOption = ({ option }: { option: Option }) => (
  <Listbox.Option
    value={option.id}
    disabled={option.disabled}
    className={({ active, selected }) => {
      const baseClass = "relative cursor-pointer select-none py-3 px-4";
      const activeClass = active ? "bg-primary/10 text-gray-900" : "text-gray-900";
      const selectedClass = selected ? "bg-primary/5 text-gray-900" : "";
      const disabledClass = option.disabled ? "opacity-50 cursor-not-allowed" : "";

      return `${baseClass} ${activeClass} ${selectedClass} ${disabledClass}`;
    }}
  >
    {({ selected }) => (
      <div className="flex items-center justify-between">
        <span className={`block truncate ${selected ? 'font-medium text-primary' : 'font-medium text-gray-900'}`}>
          {option.label}
        </span>
        {selected && (
          <span className="text-primary">
            <CheckIcon />
          </span>
        )}
      </div>
    )}
  </Listbox.Option>
);