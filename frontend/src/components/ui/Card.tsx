import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, gradient = false, onClick }) => {
  const Component = hover ? motion.div : 'div';
  
  return (
    <Component
      className={clsx(
        'bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl',
        'border border-slate-100 dark:border-slate-700/50',
        'overflow-hidden',
        hover && 'cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-700/50',
        gradient && 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-b border-slate-100 dark:border-slate-700/50', className)}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h3 className={clsx('text-lg font-semibold text-slate-800 dark:text-white', className)}>
    {children}
  </h3>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => (
  <p className={clsx('text-sm text-slate-500 dark:text-slate-400', className)}>
    {children}
  </p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={clsx('px-6 py-4', className)}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50', className)}>
    {children}
  </div>
);

export default Card;
