import { AuthProvider } from '@/features/auth';
import { AppShell } from '@/layouts/app-shell';
import { DashboardLayout } from '@/features/dashboard';

/**
 * App Route - Protected Dashboard
 * Wrapped with AuthProvider for OTP authentication
 */
export default function AppPage() {
    return (
        <AuthProvider>
            <AppShell>
                <div className="h-[calc(100vh-64px)] lg:h-screen">
                    <DashboardLayout />
                </div>
            </AppShell>
        </AuthProvider>
    );
}
