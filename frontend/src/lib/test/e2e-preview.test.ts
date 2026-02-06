/**
 * E2E Test Runner for Preview Service
 * Run with: npx tsx src/lib/test/e2e-preview.test.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { BusinessDataSchema } from '../schemas/business-data.schema';
import { injectIntoTemplate } from '../template/template-injector';

// Mock business data for testing
const mockData = {
    businessName: 'مطعم النيل',
    tagline: 'أفضل مأكولات مصرية',
    phone: '01012345678',
    services: [
        { title: 'توصيل سريع', description: 'توصيل خلال 30 دقيقة' },
        { title: 'طلبات جماعية', description: 'خصومات للمجموعات' },
    ],
    businessType: 'restaurant' as const,
};

async function runE2ETest(): Promise<void> {
    console.log('🚀 E2E Preview Test Starting...\n');
    console.log('📝 Mock Data:');
    console.log(JSON.stringify(mockData, null, 2));
    console.log('');

    // Step 1: Validate with Zod
    console.log('Step 1: Validating with Zod...');
    try {
        const validated = BusinessDataSchema.parse(mockData);
        console.log('✅ Zod validation passed\n');

        // Step 2: Load template
        console.log('Step 2: Loading template...');
        const templatePath = join(
            process.cwd(),
            'public/templates/landwind-v1/index.html'
        );
        const templateHtml = readFileSync(templatePath, 'utf-8');
        console.log(`✅ Template loaded (${templateHtml.length} bytes)\n`);

        // Step 3: Inject data
        console.log('Step 3: Injecting data into template...');
        const resultHtml = injectIntoTemplate(templateHtml, validated);
        console.log(`✅ Injection complete (${resultHtml.length} bytes)\n`);

        // Step 4: Verify expected content
        console.log('Step 4: Verifying content...');
        const checks = [
            {
                name: 'Business Name',
                expected: 'مطعم النيل',
                found: resultHtml.includes('مطعم النيل'),
            },
            {
                name: 'Tagline',
                expected: 'أفضل مأكولات مصرية',
                found: resultHtml.includes('أفضل مأكولات مصرية'),
            },
            {
                name: 'Phone Number',
                expected: '01012345678',
                found: resultHtml.includes('01012345678'),
            },
            {
                name: 'Phone tel: link',
                expected: 'tel:+201012345678',
                found: resultHtml.includes('tel:+201012345678'),
            },
            {
                name: 'WhatsApp link',
                expected: 'wa.me/201012345678',
                found: resultHtml.includes('wa.me/201012345678'),
            },
        ];

        console.log('\n📊 Verification Results:');
        let allPassed = true;
        checks.forEach((c) => {
            const status = c.found ? '✅' : '❌';
            console.log(`  ${status} ${c.name}: ${c.expected}`);
            if (!c.found) allPassed = false;
        });

        console.log('\n' + '─'.repeat(50));
        if (allPassed) {
            console.log('✅ E2E TEST PASSED: All content verified in output!');
        } else {
            console.log('❌ E2E TEST FAILED: Some content not found');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        process.exit(1);
    }
}

// Run the test
runE2ETest();
