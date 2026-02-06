'use client';

import { cn } from '@/lib/utils';
import type { ChatMessage } from './mock-messages';

interface ChatBubbleProps {
    message: ChatMessage;
}

/**
 * Chat bubble component
 * - AI: Left-aligned, gray background with purple accent border
 * - User: Right-aligned, teal background
 */
export function ChatBubble({ message }: ChatBubbleProps) {
    const isAI = message.role === 'ai';

    // Format timestamp
    const timeString = message.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <div
            className={cn(
                'flex w-full mb-3',
                isAI ? 'justify-start' : 'justify-end'
            )}
        >
            <div
                className={cn(
                    'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3',
                    'break-words whitespace-pre-wrap',
                    isAI
                        ? 'bg-gray-100 text-gray-900 border-l-4 border-purple-500 rounded-tl-sm'
                        : 'bg-teal-500 text-white rounded-tr-sm'
                )}
            >
                {/* AI Icon for AI messages */}
                {isAI && (
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-600 text-sm font-semibold">🤖 InstantWeb</span>
                    </div>
                )}

                {/* Message content */}
                <p className="text-[15px] leading-relaxed">{message.content}</p>

                {/* Timestamp */}
                <div
                    className={cn(
                        'text-xs mt-2',
                        isAI ? 'text-gray-500' : 'text-teal-100'
                    )}
                >
                    {timeString}
                </div>
            </div>
        </div>
    );
}
