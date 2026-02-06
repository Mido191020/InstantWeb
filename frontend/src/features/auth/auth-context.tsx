'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';

interface User {
    id: string;
    phone: string;
    editCredits: number;
    isPaid: boolean;
}

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    error: string | null;
    verifyOTP: (phone: string, otp: string) => Promise<boolean>;
    requestOTP: (phone: string) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth Provider Component
 * Manages authentication state with WhatsApp OTP flow
 * 
 * Flow:
 * 1. User enters phone → requestOTP()
 * 2. User receives OTP via WhatsApp
 * 3. User enters OTP → verifyOTP()
 * 4. Backend validates & returns JWT in httpOnly cookie
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check auth status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);
            // TODO: Replace with actual API endpoint
            const response = await fetch('/api/auth/me', {
                credentials: 'include', // Include httpOnly cookies
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const requestOTP = useCallback(async (phone: string): Promise<boolean> => {
        try {
            setError(null);
            setIsLoading(true);

            // TODO: Replace with actual API endpoint
            const response = await fetch('/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error?.message || 'فشل في إرسال رمز التحقق');
                return false;
            }

            return true;
        } catch {
            setError('حدث خطأ في الاتصال. حاول مرة أخرى.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyOTP = useCallback(async (phone: string, otp: string): Promise<boolean> => {
        try {
            setError(null);
            setIsLoading(true);

            // TODO: Replace with actual API endpoint
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp }),
                credentials: 'include', // For httpOnly cookie
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error?.message || 'رمز التحقق غير صحيح');
                return false;
            }

            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);
            return true;
        } catch {
            setError('حدث خطأ في الاتصال. حاول مرة أخرى.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        // TODO: Call logout endpoint to clear httpOnly cookie
        fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        }).finally(() => {
            setIsAuthenticated(false);
            setUser(null);
        });
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                error,
                verifyOTP,
                requestOTP,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
