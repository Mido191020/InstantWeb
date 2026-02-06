'use client';

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OTPInputProps {
    onSubmit: (otp: string) => void;
    isLoading?: boolean;
    error?: string | null;
    onClearError?: () => void;
}

/**
 * OTP Input Component
 * - Single 6-digit input (not 6 separate boxes)
 * - Auto-submit on 6 characters
 * - Numeric keyboard on mobile
 * - 44px minimum height (Mobile Thumb Rule)
 */
export function OTPInput({
    onSubmit,
    isLoading = false,
    error,
    onClearError,
}: OTPInputProps) {
    const [otp, setOtp] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Auto-submit when 6 digits entered
    useEffect(() => {
        if (otp.length === 6) {
            onSubmit(otp);
        }
    }, [otp, onSubmit]);

    const handleChange = (value: string) => {
        // Only allow digits, max 6
        const digits = value.replace(/\D/g, '').slice(0, 6);
        setOtp(digits);
        if (error) onClearError?.();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && otp.length === 6) {
            onSubmit(otp);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        handleChange(pasted);
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* OTP Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    placeholder="000000"
                    className={cn(
                        'w-full text-center text-3xl font-mono tracking-[0.5em]',
                        'min-h-[56px] px-4 py-3 rounded-xl',
                        'border-2 transition-colors duration-200',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
                        'focus:outline-none focus:ring-2',
                        'disabled:bg-gray-50 disabled:text-gray-400'
                    )}
                    maxLength={6}
                />

                {/* Loading indicator */}
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <p className="mt-2 text-sm text-red-600 text-center" role="alert">
                    {error}
                </p>
            )}

            {/* Progress indicator */}
            <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            'w-3 h-3 rounded-full transition-colors',
                            i < otp.length ? 'bg-teal-500' : 'bg-gray-200'
                        )}
                    />
                ))}
            </div>

            {/* Submit button (for users who don't auto-submit) */}
            <Button
                onClick={() => otp.length === 6 && onSubmit(otp)}
                disabled={otp.length !== 6 || isLoading}
                variant="primary"
                className="w-full mt-6"
            >
                {isLoading ? 'جاري التحقق...' : 'تأكيد الرمز'}
            </Button>

            {/* Helper text */}
            <p className="mt-4 text-sm text-gray-500 text-center">
                لم تستلم الرمز؟{' '}
                <button
                    type="button"
                    className="text-teal-600 hover:underline font-medium"
                    onClick={() => {/* TODO: Resend OTP */ }}
                    disabled={isLoading}
                >
                    إعادة الإرسال
                </button>
            </p>
        </div>
    );
}
