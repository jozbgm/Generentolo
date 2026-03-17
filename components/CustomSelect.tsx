import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons';

interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string | null;
    options: SelectOption[];
    placeholder: string;
    onChange: (value: string | null) => void;
    className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, options, placeholder, onChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val === '' ? null : val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(o => !o)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-dark-surface border text-dark-text text-[11px] font-bold transition-all focus:outline-none ${isOpen ? 'border-brand-yellow' : 'border-dark-border hover:border-brand-yellow'}`}
            >
                <span className={selectedOption ? 'text-dark-text' : 'text-dark-text-muted'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDownIcon className={`w-3.5 h-3.5 text-brand-yellow transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown list */}
            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full bg-dark-surface border border-dark-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto">
                    <button
                        type="button"
                        onClick={() => handleSelect('')}
                        className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-colors hover:bg-brand-yellow hover:text-dark-bg ${!value ? 'text-brand-yellow bg-brand-yellow/10' : 'text-dark-text-muted'}`}
                    >
                        {placeholder}
                    </button>
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`w-full text-left px-4 py-2 text-[11px] font-medium transition-colors hover:bg-brand-yellow hover:text-dark-bg ${value === opt.value ? 'bg-brand-yellow/15 text-brand-yellow' : 'text-dark-text'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
