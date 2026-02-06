'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning';
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-teal-500 text-white',
        warning: 'bg-amber-500 text-white',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
