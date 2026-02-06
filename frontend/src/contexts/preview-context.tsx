'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react';
import type { BusinessData } from '@/lib/schemas';
import { safeValidateBusinessData } from '@/lib/schemas';

/**
 * IFRAME LOADING STATE ASSUMPTIONS:
 * 
 * 1. Iframe shows built-in placeholder initially (from IFRAME_BOOTSTRAP in live-preview.tsx)
 * 2. Template fetch happens on first valid businessData update
 * 3. isValidating=true during fetch + validate + inject cycle
 * 4. Error state displayed in chat, not in iframe (iframe keeps last valid state)
 */

/**
 * Preview Context Value Interface
 */
interface PreviewContextValue {
    /** Current validated business data */
    businessData: BusinessData | null;
    /** Generated HTML for iframe injection */
    previewHtml: string | null;
    /** True during validation/injection cycle */
    isValidating: boolean;
    /** Error message if validation fails */
    error: string | null;
    /** Update business data (triggers re-injection) */
    updateBusinessData: (data: Partial<BusinessData>) => void;
    /** Merge partial data with existing */
    mergeBusinessData: (data: Partial<BusinessData>) => void;
    /** Reset preview to initial state */
    resetPreview: () => void;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

/**
 * Preview Provider Props
 */
interface PreviewProviderProps {
    children: ReactNode;
}

/**
 * Preview Provider Component
 * Manages business data state and preview HTML generation
 */
export function PreviewProvider({ children }: PreviewProviderProps) {
    const [businessData, setBusinessData] = useState<BusinessData | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [templateHtml, setTemplateHtml] = useState<string | null>(null);

    // Fetch template on mount
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const response = await fetch('/templates/landwind-v1/index.html');
                if (!response.ok) {
                    throw new Error('Template not found');
                }
                const html = await response.text();
                setTemplateHtml(html);
            } catch (err) {
                console.error('Failed to load template:', err);
                setError('فشل في تحميل القالب');
            }
        };

        fetchTemplate();
    }, []);

    // Update business data (replace entire object)
    const updateBusinessData = useCallback((data: Partial<BusinessData>) => {
        setIsValidating(true);
        setError(null);

        // Validate data
        const result = safeValidateBusinessData(data);

        if (result.success && result.data) {
            setBusinessData(result.data);
        } else {
            setError(result.error || 'بيانات غير صالحة');
        }

        setIsValidating(false);
    }, []);

    // Merge partial data with existing
    const mergeBusinessData = useCallback((data: Partial<BusinessData>) => {
        setIsValidating(true);
        setError(null);

        const merged = {
            ...businessData,
            ...data,
        };

        // Validate merged data
        const result = safeValidateBusinessData(merged);

        if (result.success && result.data) {
            setBusinessData(result.data);
        } else {
            // Keep previous valid state, just set error
            setError(result.error || 'بيانات غير صالحة');
        }

        setIsValidating(false);
    }, [businessData]);

    // Reset preview to initial state
    const resetPreview = useCallback(() => {
        setBusinessData(null);
        setPreviewHtml(null);
        setError(null);
        setIsValidating(false);
    }, []);

    // Generate preview HTML when businessData or template changes
    useEffect(() => {
        const generatePreview = async () => {
            if (!businessData || !templateHtml) {
                return;
            }

            setIsValidating(true);

            try {
                // Dynamic import to avoid SSR issues with Cheerio
                const { injectIntoTemplate } = await import('@/lib/template');
                const html = injectIntoTemplate(templateHtml, businessData);
                setPreviewHtml(html);
                setError(null);
            } catch (err) {
                console.error('Template injection failed:', err);
                setError('فشل في إنشاء المعاينة');
            } finally {
                setIsValidating(false);
            }
        };

        generatePreview();
    }, [businessData, templateHtml]);

    const value: PreviewContextValue = {
        businessData,
        previewHtml,
        isValidating,
        error,
        updateBusinessData,
        mergeBusinessData,
        resetPreview,
    };

    return (
        <PreviewContext.Provider value={value}>
            {children}
        </PreviewContext.Provider>
    );
}

/**
 * Hook to consume Preview Context
 */
export function usePreview(): PreviewContextValue {
    const context = useContext(PreviewContext);

    if (!context) {
        throw new Error('usePreview must be used within a PreviewProvider');
    }

    return context;
}

/**
 * Hook for preview HTML only (for LivePreview component)
 */
export function usePreviewHtml(): string | null {
    const { previewHtml } = usePreview();
    return previewHtml;
}
