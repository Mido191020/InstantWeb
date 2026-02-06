'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from './auth-context';
import { PhoneInput } from './phone-input';
import { OTPInput } from './otp-input';

interface AuthWallProps {
    children: ReactNode;
}

type AuthStep = 'phone' | 'otp';

/**
 * AuthWall Component
 * Wraps protected content and shows OTP flow if not authenticated
 */
export function AuthWall({ children }: AuthWallProps) {
    const { isAuthenticated, isLoading, error, requestOTP, verifyOTP, clearError } = useAuth();
    const [step, setStep] = useState<AuthStep>('phone');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Show loading state on initial auth check
    if (isLoading && !isSubmitting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">جاري التحقق من الهوية...</p>
                </div>
            </div>
        );
    }

    // If authenticated, show protected content
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // Handle phone submission
    const handlePhoneSubmit = async (phoneNumber: string) => {
        setPhone(phoneNumber);
        setIsSubmitting(true);
        const success = await requestOTP(phoneNumber);
        setIsSubmitting(false);
        if (success) {
            setStep('otp');
        }
    };

    // Handle OTP submission
    const handleOTPSubmit = async (otp: string) => {
        setIsSubmitting(true);
        await verifyOTP(phone, otp);
        setIsSubmitting(false);
    };

    // Handle back to phone step
    const handleBack = () => {
        setStep('phone');
        clearError();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            {/* Logo */}
            <div className="mb-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-xl">
                    <span className="text-4xl">🚀</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">InstantWeb</h1>
                <p className="text-gray-500 mt-1">أنشئ موقعك في دقائق</p>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                {step === 'phone' ? (
                    <>
                        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                            تسجيل الدخول
                        </h2>
                        <p className="text-gray-500 text-center mb-6">
                            أدخل رقم هاتفك لاستلام رمز التحقق عبر واتساب
                        </p>
                        <PhoneInput
                            onSubmit={handlePhoneSubmit}
                            isLoading={isSubmitting}
                            error={error}
                        />
                    </>
                ) : (
                    <>
                        {/* Back button */}
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
                        >
                            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>تغيير الرقم</span>
                        </button>

                        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                            أدخل رمز التحقق
                        </h2>
                        <p className="text-gray-500 text-center mb-6">
                            تم إرسال رمز مكون من 6 أرقام إلى
                            <br />
                            <span className="font-mono text-gray-900 dir-ltr inline-block">{phone}</span>
                        </p>
                        <OTPInput
                            onSubmit={handleOTPSubmit}
                            isLoading={isSubmitting}
                            error={error}
                            onClearError={clearError}
                        />
                    </>
                )}
            </div>

            {/* Footer */}
            <p className="mt-8 text-sm text-gray-400 text-center">
                بالمتابعة، أنت توافق على{' '}
                <a href="#" className="text-teal-600 hover:underline">شروط الخدمة</a>
                {' '}و{' '}
                <a href="#" className="text-teal-600 hover:underline">سياسة الخصوصية</a>
            </p>
        </div>
    );
}
