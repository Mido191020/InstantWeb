'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AppShellProps {
    children: React.ReactNode;
}

// Navigation items for sidebar
const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'My Websites', href: '/websites', icon: '🌐' },
    { label: 'Templates', href: '/templates', icon: '📄' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export function AppShell({ children }: AppShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const credits = 3; // Hardcoded for MVP - will integrate with backend User model

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Sidebar - Fixed */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[280px] lg:flex-col">
                <div className="flex flex-1 flex-col bg-white border-r border-gray-200">
                    {/* Logo Area */}
                    <div className="flex h-16 items-center px-6 border-b border-gray-200">
                        <span className="text-xl font-bold text-teal-600">InstantWeb</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-4 min-h-[44px] rounded-lg',
                                    'text-gray-700 hover:bg-gray-100 transition-colors',
                                    'font-medium'
                                )}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </nav>

                    {/* Credits Badge - Bottom */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Edit Credits</span>
                            <Badge variant="success">Credits: {credits}</Badge>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Navbar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between h-16 px-4">
                    {/* Hamburger Menu Button - 44px touch target */}
                    <Button
                        variant="ghost"
                        size="md"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        className="p-2"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </Button>

                    {/* Logo */}
                    <span className="text-lg font-bold text-teal-600">InstantWeb</span>

                    {/* Credits Badge */}
                    <Badge variant="success">Credits: {credits}</Badge>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <nav className="px-4 py-4 bg-white border-t border-gray-100 shadow-lg">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-4 min-h-[44px] rounded-lg',
                                    'text-gray-700 hover:bg-gray-100 transition-colors',
                                    'font-medium'
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </nav>
                )}
            </header>

            {/* Main Content Area */}
            <main className="lg:pl-[280px]">
                {/* Add top padding on mobile to account for fixed navbar */}
                <div className="pt-16 lg:pt-0 min-h-screen">
                    {children}
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}
