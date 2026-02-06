'use client';

/**
 * Preview Dashboard placeholder
 * Will eventually contain the live template preview in an iframe
 */
export function PreviewDashboard() {
    return (
        <div className="h-full w-full bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">معاينة الموقع</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Live Preview
                </span>
            </div>

            {/* Preview Content Placeholder */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-xl">
                        <span className="text-5xl">🌐</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Landwind Template Preview
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                        بمجرد إكمال المحادثة، سيظهر موقعك هنا للمعاينة قبل النشر.
                    </p>
                </div>
            </div>
        </div>
    );
}
