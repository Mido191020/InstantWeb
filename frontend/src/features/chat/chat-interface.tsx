'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatBubble } from './chat-bubble';
import { ChatInput } from './chat-input';
import { mockMessages, type ChatMessage } from './mock-messages';
import { extractBusinessDataLive, mockExtractBusinessData } from '@/lib/services';
import { usePreview } from '@/contexts';

// Friendly Arabic error message for extraction failures
const EXTRACTION_ERROR_MESSAGE =
    'عذراً، لم نتمكن من استخراج جميع البيانات. يرجى التأكد من كتابة التفاصيل بوضوح.';

/**
 * WhatsApp-style chat interface with extraction trigger
 * - Scrollable message container
 * - Auto-scroll to bottom on new messages
 * - Sticky input footer
 * - Extraction on AI response completion
 */
export function ChatInterface() {
    const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionSuccess, setExtractionSuccess] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { mergeBusinessData } = usePreview();

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Extract business data from chat history
    const triggerExtraction = useCallback(async () => {
        setIsExtracting(true);
        setExtractionError(null);
        setExtractionSuccess(false);

        // Build chat transcript from messages
        const transcript = messages
            .map((m) => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`)
            .join('\n');

        try {
            // Try live extraction first, fallback to mock
            let result;
            try {
                result = await extractBusinessDataLive(transcript);
            } catch {
                // Fallback to mock if API unavailable
                result = mockExtractBusinessData(transcript);
            }

            if (result.success && result.data) {
                mergeBusinessData(result.data);
                // Show success flash
                setExtractionSuccess(true);
                setTimeout(() => setExtractionSuccess(false), 2000);
            } else if (result.error) {
                setExtractionError(EXTRACTION_ERROR_MESSAGE);
                setTimeout(() => setExtractionError(null), 5000);
            }
        } catch {
            setExtractionError(EXTRACTION_ERROR_MESSAGE);
            setTimeout(() => setExtractionError(null), 5000);
        } finally {
            setIsExtracting(false);
        }
    }, [messages, mergeBusinessData]);

    const handleSendMessage = (content: string) => {
        const newMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);

        // Simulate AI response after a short delay (mock behavior)
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: `ai-${Date.now()}`,
                role: 'ai',
                content: 'شكراً على رسالتك! جاري المعالجة... 🔄',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);

            // Trigger extraction after AI response (debounced)
            setTimeout(() => {
                triggerExtraction();
            }, 500);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Chat Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                        <span className="text-white text-lg">🤖</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="font-semibold text-gray-900">InstantWeb AI</h2>
                        <p className="text-xs text-teal-600">متصل الآن • يساعدك في إنشاء موقعك</p>
                    </div>

                    {/* Extraction Indicator */}
                    {isExtracting && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full animate-pulse">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                            <span>جاري استخراج البيانات...</span>
                        </div>
                    )}

                    {/* Success Flash */}
                    {extractionSuccess && !isExtracting && (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full transition-all duration-300">
                            <span className="text-green-500">✓</span>
                            <span>تم تحديث المعاينة!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Extraction Error Toast */}
            {extractionError && (
                <div className="mx-4 mt-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                    <span className="flex-shrink-0">⚠️</span>
                    <span>{extractionError}</span>
                </div>
            )}

            {/* Messages Container - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    {messages.map((message) => (
                        <ChatBubble key={message.id} message={message} />
                    ))}
                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Footer - Sticky */}
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
}

