'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChatInterface } from '@/features/chat';
import { LivePreview } from '@/features/preview';
import { PreviewProvider, usePreview } from '@/contexts';

/**
 * Dashboard Layout Inner Component
 * Consumes PreviewContext for preview HTML
 */
function DashboardLayoutInner() {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { previewHtml, isValidating, error } = usePreview();

    return (
        <div className="h-full relative">
            {/* Desktop Layout: 30/70 Split */}
            <div className="hidden lg:grid lg:grid-cols-[30%_70%] h-full">
                {/* Left Panel: Chat (30%) */}
                <div className="h-full border-r border-gray-200 overflow-hidden">
                    <ChatInterface />
                </div>

                {/* Right Panel: Preview (70%) */}
                <div className="h-full overflow-hidden">
                    <LivePreview html={previewHtml ?? undefined} />
                    {error && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Layout: Full-screen Chat */}
            <div className="lg:hidden h-full">
                <ChatInterface />
            </div>

            {/* Mobile: Floating "Eye" Button (FAB) */}
            <button
                onClick={() => setIsPreviewOpen(true)}
                className={cn(
                    'lg:hidden fixed bottom-24 right-4 z-50',
                    'w-14 h-14 rounded-full shadow-lg',
                    'bg-gradient-to-br from-teal-500 to-teal-600',
                    'text-white flex items-center justify-center',
                    'hover:from-teal-600 hover:to-teal-700',
                    'active:scale-95 transition-all duration-150',
                    'focus:outline-none focus:ring-4 focus:ring-teal-500/30',
                    isValidating && 'animate-pulse'
                )}
                aria-label="معاينة الموقع"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                </svg>
            </button>

            {/* Mobile: Preview Modal Overlay */}
            {isPreviewOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                        <h2 className="text-lg font-semibold text-gray-900">معاينة الموقع</h2>
                        <button
                            onClick={() => setIsPreviewOpen(false)}
                            className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center',
                                'text-gray-500 hover:bg-gray-100',
                                'focus:outline-none focus:ring-2 focus:ring-teal-500'
                            )}
                            aria-label="إغلاق المعاينة"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-hidden">
                        <LivePreview html={previewHtml ?? undefined} />
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Dashboard Layout Component
 * Wraps content in PreviewProvider
 */
export function DashboardLayout() {
    return (
        <PreviewProvider>
            <DashboardLayoutInner />
        </PreviewProvider>
    );
}

