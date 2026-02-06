'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * postMessage Protocol Types
 */
export type PreviewMessage =
    | { type: 'UPDATE_CONTENT'; html: string }
    | { type: 'RESET' };

export type PreviewResponse =
    | { type: 'READY' }
    | { type: 'ERROR'; message: string }
    | { type: 'CONTENT_UPDATED' };

interface LivePreviewProps {
    /** HTML content to render */
    html?: string;
    /** Called when iframe is ready */
    onReady?: () => void;
    /** Called on preview errors */
    onError?: (message: string) => void;
    /** Additional className */
    className?: string;
}

/**
 * Default iframe content with postMessage listener
 */
const IFRAME_BOOTSTRAP = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; }
    .placeholder {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%);
      color: #6b7280;
      font-size: 1.125rem;
      text-align: center;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <div class="placeholder">
    <div>
      <div style="font-size: 4rem; margin-bottom: 1rem;">🌐</div>
      <div>Landwind Template Preview</div>
      <div style="font-size: 0.875rem; margin-top: 0.5rem; color: #9ca3af;">
        سيظهر موقعك هنا بعد إدخال البيانات
      </div>
    </div>
  </div>
  <script>
    // Notify parent that iframe is ready
    parent.postMessage({ type: 'READY' }, '*');

    // Listen for content updates from parent
    window.addEventListener('message', function(event) {
      try {
        const message = event.data;
        
        if (message.type === 'UPDATE_CONTENT' && message.html) {
          // Replace entire document content
          document.open();
          document.write(message.html);
          document.close();
          
          // Notify parent of successful update
          parent.postMessage({ type: 'CONTENT_UPDATED' }, '*');
        }
        
        if (message.type === 'RESET') {
          location.reload();
        }
      } catch (error) {
        parent.postMessage({ 
          type: 'ERROR', 
          message: error.message || 'Unknown error' 
        }, '*');
      }
    });
  </script>
</body>
</html>
`;

/**
 * LivePreview Component
 * Sandboxed iframe with postMessage communication
 */
export function LivePreview({
    html,
    onReady,
    onError,
    className,
}: LivePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Handle messages from iframe
    const handleMessage = useCallback(
        (event: MessageEvent<PreviewResponse>) => {
            // Validate origin (same-origin for srcdoc)
            if (event.source !== iframeRef.current?.contentWindow) {
                return;
            }

            const message = event.data;

            switch (message.type) {
                case 'READY':
                    setIsReady(true);
                    setIsLoading(false);
                    onReady?.();
                    break;

                case 'ERROR':
                    onError?.(message.message);
                    break;

                case 'CONTENT_UPDATED':
                    setIsLoading(false);
                    break;
            }
        },
        [onReady, onError]
    );

    // Set up message listener
    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    // Send content update when html changes
    useEffect(() => {
        if (!isReady || !html || !iframeRef.current?.contentWindow) {
            return;
        }

        setIsLoading(true);

        const message: PreviewMessage = {
            type: 'UPDATE_CONTENT',
            html,
        };

        iframeRef.current.contentWindow.postMessage(message, '*');
    }, [html, isReady]);

    return (
        <div className={cn('relative w-full h-full bg-gray-100', className)}>
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="mt-3 text-sm text-gray-600">جاري تحميل المعاينة...</p>
                    </div>
                </div>
            )}

            {/* Sandboxed iframe */}
            <iframe
                ref={iframeRef}
                srcDoc={IFRAME_BOOTSTRAP}
                sandbox="allow-scripts allow-same-origin"
                title="Website Preview"
                className="w-full h-full border-0"
                aria-label="معاينة الموقع"
            />
        </div>
    );
}

/**
 * Hook for controlling LivePreview externally
 */
export function useLivePreview() {
    const [html, setHtml] = useState<string | undefined>();
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateContent = useCallback((newHtml: string) => {
        setHtml(newHtml);
    }, []);

    const reset = useCallback(() => {
        setHtml(undefined);
    }, []);

    return {
        html,
        isReady,
        error,
        updateContent,
        reset,
        handlers: {
            onReady: () => setIsReady(true),
            onError: (message: string) => setError(message),
        },
    };
}
