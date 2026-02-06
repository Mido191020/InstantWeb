/**
 * Features Grid - Landwind Style
 * 3-column grid with icons and Arabic descriptions
 */

const features = [
    {
        icon: '💬',
        title: 'شات ذكي',
        description: 'أجب على أسئلة بسيطة عن مشروعك وسنفهم احتياجاتك تلقائياً.',
    },
    {
        icon: '🎨',
        title: 'تصميمات احترافية',
        description: 'قوالب جاهزة بتصميمات عصرية تناسب جميع المجالات.',
    },
    {
        icon: '🚀',
        title: 'نشر فوري',
        description: 'موقعك جاهز للنشر على الإنترنت خلال دقائق.',
    },
    {
        icon: '📱',
        title: 'متوافق مع الموبايل',
        description: 'تصميم متجاوب يظهر بشكل مثالي على جميع الأجهزة.',
    },
    {
        icon: '🔒',
        title: 'آمن وموثوق',
        description: 'استضافة آمنة مع شهادة SSL مجانية لموقعك.',
    },
    {
        icon: '💳',
        title: 'دفع سهل',
        description: 'ادفع بسهولة عبر واتساب - بدون بطاقات ائتمان.',
    },
];

export function FeaturesGrid() {
    return (
        <section className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        لماذا تختار{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-400">
                            InstantWeb
                        </span>
                        ؟
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        كل ما تحتاجه لإنشاء موقعك الاحترافي في مكان واحد
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300"
                        >
                            {/* Icon */}
                            <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center text-3xl shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Hover arrow */}
                            <div className="absolute left-8 bottom-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                    className="w-6 h-6 text-teal-500 rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
