'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * Chat input with auto-expanding textarea
 * 
 * Assumptions for mobile keyboard handling:
 * 1. Using CSS `position: sticky` with `bottom: 0` to keep input visible
 * 2. The textarea maxHeight is capped at 150px to prevent overflow
 * 3. On mobile, the viewport meta tag handles keyboard resize
 * 4. Using `enterkeyhint="send"` for mobile keyboard optimization
 */
export function ChatInput({
    onSendMessage,
    disabled = false,
    placeholder = 'اكتب رسالتك هنا...',
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea based on content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to calculate new scrollHeight
            textarea.style.height = 'auto';
            // Set new height with max limit
            const newHeight = Math.min(textarea.scrollHeight, 150);
            textarea.style.height = `${newHeight}px`;
        }
    }, [message]);

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage && !disabled) {
            onSendMessage(trimmedMessage);
            setMessage('');
            // Reset textarea height after sending
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter (not Shift+Enter for newlines)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
                {/* Auto-expanding textarea */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        enterKeyHint="send"
                        className={cn(
                            'w-full resize-none rounded-xl border border-gray-300',
                            'px-4 py-3 text-[16px] leading-relaxed',
                            'min-h-[44px] max-h-[150px]', // Mobile Thumb Rule + max height
                            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
                            'disabled:bg-gray-50 disabled:text-gray-400',
                            'placeholder:text-gray-400'
                        )}
                        style={{ height: 'auto' }}
                        dir="auto" // Auto RTL/LTR for Arabic support
                    />
                </div>

                {/* Send button - 44px min for Mobile Thumb Rule */}
                <Button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    variant="primary"
                    className="shrink-0 w-12 h-12 rounded-xl p-0"
                    aria-label="إرسال الرسالة"
                >
                    <svg
                        className="w-5 h-5 rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                    </svg>
                </Button>
            </div>

            {/* Hint for desktop users */}
            <p className="hidden sm:block text-xs text-gray-400 text-center mt-2">
                Press Enter to send, Shift+Enter for new line
            </p>
        </div>
    );
}
