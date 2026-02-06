'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-teal-500 hover:bg-teal-600 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    };

    const sizes = {
        sm: 'min-h-[36px] px-3 text-sm',
        md: 'min-h-[44px] px-4 text-base', // Mobile Thumb Rule: 44px minimum
        lg: 'min-h-[52px] px-6 text-lg',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
