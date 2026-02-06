import { HeroSection, FeaturesGrid, CTASection } from '@/components/marketing';

/**
 * Public Landing Page
 * Landwind-style marketing page with WhatsApp CTAs
 */
export default function LandingPage() {
    return (
        <main className="min-h-screen" dir="rtl" lang="ar">
            <HeroSection />
            <FeaturesGrid />
            <CTASection />

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center text-xl">
                            🚀
                        </div>
                        <span className="text-xl font-bold text-white">InstantWeb</span>
                    </div>
                    <p className="text-sm mb-4">
                        أنشئ موقعك الاحترافي في دقائق
                    </p>
                    <div className="flex justify-center gap-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">شروط الخدمة</a>
                        <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
                        <a href="#" className="hover:text-white transition-colors">تواصل معنا</a>
                    </div>
                    <p className="mt-8 text-xs text-gray-500">
                        © 2026 InstantWeb. جميع الحقوق محفوظة.
                    </p>
                </div>
            </footer>
        </main>
    );
}
