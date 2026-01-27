import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ id, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if dropdown should open upward
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const dropdownHeight = Math.min(options.length * 40, 240) + 16; // Approximate height
      setOpenUpward(spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight);
    }
  }, [isOpen, options.length]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative overflow-visible" ref={selectRef}>
      <button
        type="button"
        id={id}
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200"
      >
        <span className="block truncate text-slate-800 dark:text-slate-200 font-medium">{selectedOption?.label || 'Select...'}</span>
        <span className="pointer-events-none">
          <i
            className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          ></i>
        </span>
      </button>

      <div
        className={`absolute z-[100] w-full bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-slate-200 dark:border-slate-600 transition-all duration-200 ease-out ${
          openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
        } ${
          isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
        }`}
        style={{ transformOrigin: openUpward ? 'bottom' : 'top' }}
      >
        <ul
          className="max-h-60 py-2 overflow-auto focus:outline-none"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              id={`${id}-option-${option.value}`}
              role="option"
              aria-selected={value === option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`cursor-pointer select-none relative py-2.5 px-4 text-sm transition-colors ${
                value === option.value 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className={`block truncate ${value === option.value ? 'font-semibold' : 'font-medium'}`}>
                {option.label}
              </span>
              {value === option.value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                  <i className="fa-solid fa-check text-sm"></i>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomSelect;