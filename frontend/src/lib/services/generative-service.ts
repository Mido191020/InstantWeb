import { safeValidateBusinessData } from '@/lib/schemas';
import type { BusinessData } from '@/lib/schemas';

/**
 * ARABIC DIGIT CONVERSION ASSUMPTIONS:
 * 
 * 1. Arabic numerals (٠١٢٣٤٥٦٧٨٩) are converted to Latin (0123456789) BEFORE Zod validation
 * 2. Conversion happens in normalizeArabicDigits() utility, not in LLM prompt
 * 3. Mixed-script numbers (٠1٢3) are handled by converting each character individually
 */

/**
 * Custom error for extraction failures
 * Thrown when LLM output is malformed - NO manual fixing allowed
 */
export class ExtractionError extends Error {
    public readonly rawOutput: string;
    public readonly phase: 'json_parse' | 'zod_validation' | 'llm_call';

    constructor(message: string, rawOutput: string, phase: ExtractionError['phase']) {
        super(message);
        this.name = 'ExtractionError';
        this.rawOutput = rawOutput;
        this.phase = phase;
    }
}

/**
 * Convert Arabic numerals to Latin numerals
 * ٠١٢٣٤٥٦٧٨٩ → 0123456789
 */
export function normalizeArabicDigits(text: string): string {
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const latinDigits = '0123456789';

    let result = text;
    for (let i = 0; i < arabicDigits.length; i++) {
        result = result.replace(new RegExp(arabicDigits[i], 'g'), latinDigits[i]);
    }

    return result;
}

/**
 * System prompt for business data extraction
 */
const SYSTEM_PROMPT = `أنت مستخرج بيانات أعمال تجارية. استخرج المعلومات من المحادثة واعطني JSON فقط.

القواعد:
1. أجب بـ JSON صالح فقط، بدون أي نص أو شرح
2. رقم الهاتف المصري يبدأ بـ 01 ويتكون من 11 رقم
3. إذا لم تجد معلومة، اجعل القيمة null
4. نوع النشاط: restaurant, store, services, clinic, salon, other

الحقول المطلوبة:
{
  "businessName": "اسم النشاط التجاري",
  "tagline": "شعار أو وصف قصير",
  "phone": "01XXXXXXXXX",
  "whatsapp": "01XXXXXXXXX أو null",
  "email": "email@example.com أو null",
  "address": "العنوان أو null",
  "services": [{"title": "اسم الخدمة", "description": "وصف قصير"}],
  "businessType": "restaurant|store|services|clinic|salon|other"
}`;

/**
 * Few-shot examples for consistent extraction
 */
const FEW_SHOT_EXAMPLES = [
    {
        input: 'اسمي أحمد وعندي مطعم اسمه مطعم النيل ورقمي 01012345678',
        output: {
            businessName: 'مطعم النيل',
            tagline: null,
            phone: '01012345678',
            whatsapp: null,
            email: null,
            address: null,
            services: [],
            businessType: 'restaurant',
        },
    },
    {
        input: 'صالون جمال الست فاطمة في المعادي، بنعمل شعر ومكياج، الموبايل ٠١٢٣٤٥٦٧٨٩٠',
        output: {
            businessName: 'صالون جمال الست فاطمة',
            tagline: null,
            phone: '01234567890',
            whatsapp: null,
            email: null,
            address: 'المعادي',
            services: [
                { title: 'شعر', description: 'خدمات الشعر' },
                { title: 'مكياج', description: 'خدمات المكياج' },
            ],
            businessType: 'salon',
        },
    },
];

/**
 * Build the full prompt with system message and few-shot examples
 */
function buildExtractionPrompt(chatHistory: string): string {
    const examples = FEW_SHOT_EXAMPLES.map(
        (ex) => `محادثة: "${ex.input}"\nJSON: ${JSON.stringify(ex.output, null, 2)}`
    ).join('\n\n');

    return `${SYSTEM_PROMPT}

أمثلة:
${examples}

---

المحادثة الحالية:
"${chatHistory}"

JSON:`;
}

/**
 * Extraction result
 */
export interface ExtractionResult {
    success: boolean;
    data?: Partial<BusinessData>;
    error?: string;
}

/**
 * Extract business data from chat history using LLM
 * 
 * @param chatHistory - The chat conversation text
 * @param apiEndpoint - LLM API endpoint (Groq/Cloudflare)
 * @param apiKey - API key for authentication
 */
export async function extractBusinessData(
    chatHistory: string,
    apiEndpoint: string,
    apiKey: string
): Promise<ExtractionResult> {
    const prompt = buildExtractionPrompt(chatHistory);

    try {
        // Call LLM API
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Groq model
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.1, // Low temperature for consistent JSON
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new ExtractionError(
                `LLM API error: ${response.status}`,
                await response.text(),
                'llm_call'
            );
        }

        const result = await response.json();
        const rawOutput = result.choices?.[0]?.message?.content || '';

        // Step 1: Normalize Arabic digits BEFORE parsing
        const normalizedOutput = normalizeArabicDigits(rawOutput);

        // Step 2: Parse JSON - NO manual fixing (sycophancy prevention)
        let parsed: unknown;
        try {
            // Try to extract JSON from response (in case LLM adds extra text)
            const jsonMatch = normalizedOutput.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON object found in response');
            }
            parsed = JSON.parse(jsonMatch[0]);
        } catch {
            throw new ExtractionError(
                'Invalid JSON from LLM',
                rawOutput,
                'json_parse'
            );
        }

        // Step 3: Validate with Zod
        const validation = safeValidateBusinessData(parsed);

        if (!validation.success) {
            throw new ExtractionError(
                validation.error || 'Zod validation failed',
                rawOutput,
                'zod_validation'
            );
        }

        return {
            success: true,
            data: validation.data,
        };
    } catch (error) {
        if (error instanceof ExtractionError) {
            return {
                success: false,
                error: `خطأ في الاستخراج: ${error.message}`,
            };
        }

        return {
            success: false,
            error: 'فشل الاتصال بالخادم',
        };
    }
}

/**
 * Extract business data using live /api/extract route
 * Includes retry logic for 429 rate limit
 */
export async function extractBusinessDataLive(
    transcript: string,
    maxRetries = 1
): Promise<ExtractionResult> {
    let attempts = 0;

    while (attempts <= maxRetries) {
        try {
            const response = await fetch('/api/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transcript }),
            });

            // Handle rate limit with retry
            if (response.status === 429 && attempts < maxRetries) {
                attempts++;
                console.log(`Rate limited, retrying in 2s (attempt ${attempts}/${maxRetries})`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                continue;
            }

            // Handle timeout
            if (response.status === 504) {
                return {
                    success: false,
                    error: 'الخادم بطيء، حاول مرة أخرى',
                };
            }

            // Handle other errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: errorData.error || 'فشل في الاستخراج',
                };
            }

            // Success
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Extract API error:', error);
            return {
                success: false,
                error: 'فشل الاتصال بالخادم',
            };
        }
    }

    // Max retries exceeded
    return {
        success: false,
        error: 'الخادم مشغول، حاول لاحقاً',
    };
}

/**
 * Mock extraction for testing (without LLM call)
 * Uses pattern matching for basic extraction
 */
export function mockExtractBusinessData(
    chatHistory: string
): ExtractionResult {
    // Normalize Arabic digits
    const normalized = normalizeArabicDigits(chatHistory);

    // Extract phone number (Egyptian format)
    const phoneMatch = normalized.match(/01\d{9}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;

    // Simple name extraction (between common patterns)
    const namePatterns = [
        /اسم[ه]?\s*[:\s]+([^\n,،]+)/,
        /مطعم\s+([^\n,،]+)/,
        /صالون\s+([^\n,،]+)/,
        /محل\s+([^\n,،]+)/,
    ];

    let businessName: string | undefined;
    for (const pattern of namePatterns) {
        const match = chatHistory.match(pattern);
        if (match) {
            businessName = match[1].trim();
            break;
        }
    }

    // Detect business type
    let businessType: BusinessData['businessType'] = 'other';
    if (/مطعم|اكل|طبخ/.test(chatHistory)) businessType = 'restaurant';
    else if (/صالون|تجميل|شعر|مكياج/.test(chatHistory)) businessType = 'salon';
    else if (/عياد[ة]|دكتور|طبيب/.test(chatHistory)) businessType = 'clinic';
    else if (/محل|متجر|بيع/.test(chatHistory)) businessType = 'store';

    // Build partial data
    const data: Partial<BusinessData> = {};
    if (businessName) data.businessName = businessName;
    if (phone) data.phone = phone;
    data.businessType = businessType;

    // Validate what we have
    if (!businessName && !phone) {
        return {
            success: false,
            error: 'لم يتم العثور على معلومات كافية',
        };
    }

    return {
        success: true,
        data,
    };
}

/**
 * Test the extraction with a messy Arabic transcript
 */
export async function runExtractionTest(): Promise<{
    success: boolean;
    message: string;
    data?: Partial<BusinessData>;
}> {
    console.log('🧪 Running Extraction Test...\n');

    const messyTranscript = `
    مرحبا انا عندي صالون تجميل
    اسمه صالون الجمال
    الموبايل بتاعي ٠١٢٣٤٥٦٧٨٩٠
    بنعمل شعر ومكياج
    في المعادي
  `;

    console.log('📝 Input Transcript:');
    console.log(messyTranscript);
    console.log('');

    // Use mock extraction (no LLM call needed for test)
    const result = mockExtractBusinessData(messyTranscript);

    console.log('📊 Extraction Result:');
    console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
        return {
            success: false,
            message: `❌ Extraction failed: ${result.error}`,
        };
    }

    // Verify expected values
    const checks = [
        {
            name: 'Business Name',
            expected: 'صالون الجمال',
            found: result.data?.businessName === 'صالون الجمال',
        },
        {
            name: 'Phone (normalized)',
            expected: '01234567890',
            found: result.data?.phone === '01234567890',
        },
        {
            name: 'Business Type',
            expected: 'salon',
            found: result.data?.businessType === 'salon',
        },
    ];

    console.log('\n✅ Verification:');
    let allPassed = true;
    checks.forEach((c) => {
        const status = c.found ? '✅' : '❌';
        console.log(`  ${status} ${c.name}: ${c.expected}`);
        if (!c.found) allPassed = false;
    });

    return {
        success: allPassed,
        message: allPassed ? '✅ All checks passed!' : '❌ Some checks failed',
        data: result.data,
    };
}
