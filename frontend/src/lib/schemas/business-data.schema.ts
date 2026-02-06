import { z } from 'zod';

/**
 * Service/Feature item schema
 */
export const ServiceSchema = z.object({
    title: z.string().min(2).max(100),
    description: z.string().max(300),
    icon: z.string().optional(), // Emoji or icon class
});

/**
 * Business Data Schema
 * Validated output from GenerativeService before preview injection
 */
export const BusinessDataSchema = z.object({
    // Core Identity
    businessName: z.string().min(2).max(100),
    tagline: z.string().max(200).nullable().optional(),

    // Contact (Egyptian phone format: 01XXXXXXXXX)
    phone: z.string().regex(/^01\d{9}$/, 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01'),
    whatsapp: z.string().regex(/^01\d{9}$/).nullable().optional(),
    email: z.string().email().nullable().optional(),

    // Location
    address: z.string().max(200).nullable().optional(),
    city: z.string().max(50).nullable().optional(),

    // Services (max 6 for template grid)
    services: z.array(ServiceSchema).max(6).default([]),

    // Media (validated URLs)
    heroImage: z.string().url().nullable().optional(),
    logo: z.string().url().nullable().optional(),

    // Social Links
    facebook: z.string().url().nullable().optional(),
    instagram: z.string().url().nullable().optional(),

    // Business Type (for template selection)
    businessType: z.enum([
        'restaurant',
        'store',
        'services',
        'clinic',
        'salon',
        'other',
    ]).default('other'),
});

export type BusinessData = z.infer<typeof BusinessDataSchema>;
export type Service = z.infer<typeof ServiceSchema>;

/**
 * Site Configuration Schema
 * Template-level settings
 */
export const SiteConfigSchema = z.object({
    templateId: z.string().default('landwind-v1'),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#14b8a6'),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#7e3af2'),
    fontFamily: z.string().default('Cairo'),
    rtl: z.boolean().default(true),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

/**
 * Full Preview Data Schema
 * Combines business data + site config
 */
export const PreviewDataSchema = z.object({
    business: BusinessDataSchema,
    config: SiteConfigSchema.default({}),
    generatedAt: z.string().datetime().optional(),
});

export type PreviewData = z.infer<typeof PreviewDataSchema>;

/**
 * Validate GenerativeService output
 * @throws ZodError if validation fails
 */
export function validateBusinessData(data: unknown): BusinessData {
    return BusinessDataSchema.parse(data);
}

/**
 * Safe validation with error result
 */
export function safeValidateBusinessData(data: unknown): {
    success: boolean;
    data?: BusinessData;
    error?: string;
} {
    const result = BusinessDataSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    // Extract first error message for user display
    const firstError = result.error.errors[0];
    return {
        success: false,
        error: firstError?.message || 'بيانات غير صالحة',
    };
}
