
import React from 'react';

interface BackButtonProps {
    onClick: () => void;
    text?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, text = 'Back' }) => {
    return (
        <button
            onClick={onClick}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
        >
            <i className="fa-solid fa-arrow-left"></i>
            <span>{text}</span>
        </button>
    );
};

export default BackButton;