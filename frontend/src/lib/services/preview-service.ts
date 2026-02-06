import type { BusinessData } from '@/lib/schemas';
import { safeValidateBusinessData } from '@/lib/schemas';
import { injectIntoTemplate, TemplateMismatchError } from '@/lib/template';

/**
 * Preview Service
 * Handles template fetching, validation, and injection
 */

/** Cached template HTML */
let templateCache: string | null = null;

/**
 * Fetch template HTML from public directory
 */
export async function fetchTemplate(
    templatePath = '/templates/landwind-v1/index.html'
): Promise<string> {
    if (templateCache) {
        return templateCache;
    }

    const response = await fetch(templatePath);

    if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
    }

    templateCache = await response.text();
    return templateCache;
}

/**
 * Clear template cache (for development/testing)
 */
export function clearTemplateCache(): void {
    templateCache = null;
}

/**
 * Result of preview generation
 */
export interface PreviewResult {
    success: boolean;
    html?: string;
    error?: string;
}

/**
 * Generate preview HTML from business data
 * 1. Validates data with Zod
 * 2. Fetches template (with cache)
 * 3. Injects data into template
 */
export async function generatePreview(
    data: Partial<BusinessData>
): Promise<PreviewResult> {
    // Step 1: Validate with Zod
    const validation = safeValidateBusinessData(data);

    if (!validation.success || !validation.data) {
        return {
            success: false,
            error: validation.error || 'بيانات غير صالحة',
        };
    }

    try {
        // Step 2: Fetch template
        const templateHtml = await fetchTemplate();

        // Step 3: Inject data
        const html = injectIntoTemplate(templateHtml, validation.data);

        return {
            success: true,
            html,
        };
    } catch (err) {
        if (err instanceof TemplateMismatchError) {
            return {
                success: false,
                error: `خطأ في القالب: ${err.selector} غير موجود`,
            };
        }

        return {
            success: false,
            error: 'فشل في إنشاء المعاينة',
        };
    }
}

/**
 * Mock data for E2E testing
 */
export const mockBusinessData: BusinessData = {
    businessName: 'مطعم النيل',
    tagline: 'أفضل مأكولات مصرية',
    phone: '01012345678',
    services: [
        { title: 'توصيل سريع', description: 'توصيل خلال 30 دقيقة' },
        { title: 'طلبات جماعية', description: 'خصومات للمجموعات' },
    ],
    businessType: 'restaurant',
};

/**
 * Run E2E test with mock data
 * Returns true if injection succeeds and contains expected content
 */
export async function runE2ETest(): Promise<{
    success: boolean;
    message: string;
    html?: string;
}> {
    console.log('🧪 Running E2E Preview Test...');
    console.log('📝 Mock Data:', mockBusinessData);

    const result = await generatePreview(mockBusinessData);

    if (!result.success || !result.html) {
        return {
            success: false,
            message: `❌ Preview generation failed: ${result.error}`,
        };
    }

    // Verify expected content
    const checks = [
        { name: 'Business Name', expected: 'مطعم النيل', found: result.html.includes('مطعم النيل') },
        { name: 'Phone Number', expected: '01012345678', found: result.html.includes('01012345678') },
    ];

    const allPassed = checks.every(c => c.found);

    console.log('\n📊 Verification Results:');
    checks.forEach(c => {
        console.log(`  ${c.found ? '✅' : '❌'} ${c.name}: ${c.expected}`);
    });

    return {
        success: allPassed,
        message: allPassed ? '✅ E2E Test Passed!' : '❌ Some content not found in output',
        html: result.html,
    };
}
