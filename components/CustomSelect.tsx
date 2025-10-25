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
  const selectRef = useRef<HTMLDivElement>(null);

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

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-left border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:border-slate-600 transition"
      >
        <span className="block truncate text-slate-800 dark:text-slate-200">{selectedOption?.label || 'Select...'}</span>
        <span className="pointer-events-none">
          <i
            className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          ></i>
        </span>
      </button>

      <div
        className={`absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-md ring-1 ring-black ring-opacity-5 transition-all duration-150 ease-out transform origin-top ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <ul
          className="max-h-60 py-1 text-base overflow-auto focus:outline-none sm:text-sm"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              id={`${id}-option-${option.value}`}
              role="option"
              aria-selected={value === option.value}
              onClick={() => handleOptionClick(option.value)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-slate-700"
            >
              <span className="block truncate font-bold">
                {option.label}
              </span>
              {value === option.value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                  <i className="fa-solid fa-check"></i>
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