import { NextResponse } from 'next/server';
import { safeValidateBusinessData } from '@/lib/schemas';
import { normalizeArabicDigits } from '@/lib/services';

/**
 * TIMEOUT ASSUMPTIONS:
 * 
 * 1. AbortController with 10s timeout for Groq fetch
 * 2. On timeout: Return 504 Gateway Timeout, NOT retry
 * 3. Client-side shows "الخادم بطيء، حاول مرة أخرى" on timeout
 */

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
const FEW_SHOT_EXAMPLES = `
أمثلة:

محادثة: "اسمي أحمد وعندي مطعم اسمه مطعم النيل ورقمي 01012345678"
JSON: {"businessName":"مطعم النيل","tagline":null,"phone":"01012345678","whatsapp":null,"email":null,"address":null,"services":[],"businessType":"restaurant"}

محادثة: "صالون جمال الست فاطمة في المعادي، بنعمل شعر ومكياج، الموبايل ٠١٢٣٤٥٦٧٨٩٠"
JSON: {"businessName":"صالون جمال الست فاطمة","tagline":null,"phone":"01234567890","whatsapp":null,"email":null,"address":"المعادي","services":[{"title":"شعر","description":"خدمات الشعر"},{"title":"مكياج","description":"خدمات المكياج"}],"businessType":"salon"}
`;

/**
 * POST /api/extract
 * Proxies extraction requests to Groq API
 */
export async function POST(request: Request) {
    // Check API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('GROQ_API_KEY not configured');
        return NextResponse.json(
            { success: false, error: 'Server configuration error' },
            { status: 500 }
        );
    }

    try {
        // Parse request body
        const body = await request.json();
        const { transcript } = body;

        if (!transcript || typeof transcript !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Missing transcript' },
                { status: 400 }
            );
        }

        // Build prompt
        const userPrompt = `${FEW_SHOT_EXAMPLES}

---

المحادثة الحالية:
"${transcript}"

JSON:`;

        // Create abort controller for 10s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            // Call Groq API
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.1,
                    max_tokens: 1000,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle rate limit
            if (response.status === 429) {
                return NextResponse.json(
                    { success: false, error: 'Rate limited', retryAfter: 2000 },
                    { status: 429 }
                );
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Groq API error:', response.status, errorText);
                return NextResponse.json(
                    { success: false, error: 'LLM service error' },
                    { status: 502 }
                );
            }

            const result = await response.json();
            const rawOutput = result.choices?.[0]?.message?.content || '';

            // Normalize Arabic digits
            const normalizedOutput = normalizeArabicDigits(rawOutput);

            // Parse JSON - NO manual fixing (sycophancy prevention)
            let parsed: unknown;
            try {
                const jsonMatch = normalizedOutput.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No JSON object found');
                }
                parsed = JSON.parse(jsonMatch[0]);
            } catch {
                console.error('JSON parse failed:', rawOutput);
                return NextResponse.json(
                    { success: false, error: 'Invalid LLM output' },
                    { status: 422 }
                );
            }

            // Validate with Zod
            const validation = safeValidateBusinessData(parsed);

            if (!validation.success) {
                console.error('Zod validation failed:', validation.error);
                return NextResponse.json(
                    { success: false, error: validation.error },
                    { status: 422 }
                );
            }

            return NextResponse.json({
                success: true,
                data: validation.data,
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { success: false, error: 'Request timeout' },
                    { status: 504 }
                );
            }

            throw fetchError;
        }
    } catch (error) {
        console.error('Extraction API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
