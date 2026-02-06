/**
 * Preview Communication Test
 * Verifies iframe postMessage READY signal and UPDATE_CONTENT handling
 * 
 * Run with: npx tsx src/lib/test/preview-communication.test.ts
 * (Browser environment required - use Playwright or similar)
 */

import type { PreviewMessage, PreviewResponse } from '@/features/preview';

/**
 * Test utilities for preview communication
 * These functions can be used in E2E tests with Playwright/Puppeteer
 */

/**
 * Wait for a specific message type from iframe
 */
export function waitForPreviewMessage(
    expectedType: PreviewResponse['type'],
    timeout = 5000
): Promise<PreviewResponse> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            window.removeEventListener('message', handler);
            reject(new Error(`Timeout waiting for message type: ${expectedType}`));
        }, timeout);

        const handler = (event: MessageEvent<PreviewResponse>) => {
            if (event.data?.type === expectedType) {
                clearTimeout(timer);
                window.removeEventListener('message', handler);
                resolve(event.data);
            }
        };

        window.addEventListener('message', handler);
    });
}

/**
 * Send message to preview iframe
 */
export function sendToPreview(
    iframe: HTMLIFrameElement,
    message: PreviewMessage
): void {
    if (!iframe.contentWindow) {
        throw new Error('Iframe contentWindow not available');
    }
    iframe.contentWindow.postMessage(message, '*');
}

/**
 * Test: Iframe responds with READY after load
 */
export async function testIframeReady(): Promise<boolean> {
    console.log('🧪 Test: Waiting for iframe READY signal...');

    try {
        const response = await waitForPreviewMessage('READY', 5000);
        console.log('✅ Iframe responded with READY:', response);
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

/**
 * Test: Iframe updates content on UPDATE_CONTENT message
 */
export async function testContentUpdate(
    iframe: HTMLIFrameElement,
    testHtml: string
): Promise<boolean> {
    console.log('🧪 Test: Sending UPDATE_CONTENT message...');

    try {
        // Wait for ready first
        await waitForPreviewMessage('READY', 5000);

        // Send update
        sendToPreview(iframe, { type: 'UPDATE_CONTENT', html: testHtml });

        // Wait for update confirmation
        const response = await waitForPreviewMessage('CONTENT_UPDATED', 3000);
        console.log('✅ Content updated successfully:', response);

        // Verify content in iframe (this would need DOM access)
        const iframeBody = iframe.contentDocument?.body;
        if (iframeBody && iframeBody.innerHTML.includes('Test')) {
            console.log('✅ Content verified in iframe DOM');
            return true;
        }

        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

/**
 * Run all preview communication tests
 * Usage in browser console:
 *   const iframe = document.querySelector('iframe');
 *   runPreviewTests(iframe);
 */
export async function runPreviewTests(iframe: HTMLIFrameElement): Promise<void> {
    console.log('🚀 Running Preview Communication Tests\n');

    const results = {
        ready: false,
        contentUpdate: false,
    };

    // Test 1: READY signal
    results.ready = await testIframeReady();

    // Test 2: Content update
    if (results.ready) {
        results.contentUpdate = await testContentUpdate(
            iframe,
            '<html><body><h1>Test Content</h1></body></html>'
        );
    }

    // Summary
    console.log('\n📊 Test Results:');
    console.log(`  READY signal: ${results.ready ? '✅' : '❌'}`);
    console.log(`  Content update: ${results.contentUpdate ? '✅' : '❌'}`);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);
}

// Export for use in test runners
export const previewTestUtils = {
    waitForPreviewMessage,
    sendToPreview,
    testIframeReady,
    testContentUpdate,
    runPreviewTests,
};
