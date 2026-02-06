'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PhoneInputProps {
    onSubmit: (phone: string) => void;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * Phone number input for OTP request
 * Egyptian phone format: 01XXXXXXXXX (11 digits)
 */
export function PhoneInput({
    onSubmit,
    isLoading = false,
    error,
}: PhoneInputProps) {
    const [phone, setPhone] = useState('');

    const handleChange = (value: string) => {
        // Only allow digits, max 11 for Egyptian numbers
        const digits = value.replace(/\D/g, '').slice(0, 11);
        setPhone(digits);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length === 11 && phone.startsWith('01')) {
            onSubmit(phone);
        }
    };

    const isValid = phone.length === 11 && phone.startsWith('01');

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
            {/* Phone Input */}
            <div className="relative">
                <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={isLoading}
                    placeholder="01XXXXXXXXX"
                    dir="ltr"
                    className={cn(
                        'w-full text-center text-xl font-mono',
                        'min-h-[56px] px-4 py-3 rounded-xl',
                        'border-2 transition-colors duration-200',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
                        'focus:outline-none focus:ring-2',
                        'disabled:bg-gray-50 disabled:text-gray-400'
                    )}
                    maxLength={11}
                />
            </div>

            {/* Error message */}
            {error && (
                <p className="mt-2 text-sm text-red-600 text-center" role="alert">
                    {error}
                </p>
            )}

            {/* Validation hint */}
            {phone.length > 0 && !isValid && (
                <p className="mt-2 text-sm text-amber-600 text-center">
                    رقم الهاتف يجب أن يبدأ بـ 01 ويكون 11 رقم
                </p>
            )}

            {/* Submit button */}
            <Button
                type="submit"
                disabled={!isValid || isLoading}
                variant="primary"
                className="w-full mt-6"
            >
                {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق عبر واتساب'}
            </Button>

            {/* WhatsApp indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>سيتم إرسال الرمز عبر واتساب</span>
            </div>
        </form>
    );
}
