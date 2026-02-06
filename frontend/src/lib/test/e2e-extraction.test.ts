/**
 * Extraction Test Runner
 * Run with: npx tsx src/lib/test/e2e-extraction.test.ts
 */

import { runExtractionTest, normalizeArabicDigits } from '../services/generative-service';

async function main(): Promise<void> {
    console.log('='.repeat(50));
    console.log('🔤 Arabic Digit Normalization Test');
    console.log('='.repeat(50));

    const testCases = [
        { input: '٠١٢٣٤٥٦٧٨٩٠', expected: '01234567890' },
        { input: '01234567890', expected: '01234567890' },
        { input: '٠1٢3٤5٦7٨9٠', expected: '01234567890' }, // Mixed
    ];

    testCases.forEach(({ input, expected }) => {
        const result = normalizeArabicDigits(input);
        const passed = result === expected;
        console.log(`  ${passed ? '✅' : '❌'} "${input}" → "${result}" (expected: "${expected}")`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('🧪 Messy Arabic Transcript Test');
    console.log('='.repeat(50) + '\n');

    const result = await runExtractionTest();

    console.log('\n' + '─'.repeat(50));
    console.log(result.message);

    process.exit(result.success ? 0 : 1);
}

main();
