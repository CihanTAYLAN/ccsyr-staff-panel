'use client';

import { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useTheme } from '@/providers/theme-provider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Card: {
                        headerBg: 'transparent',
                    },
                },
            }}
        >
            <div className="min-h-screen flex flex-col items-center justify-center bg-theme-bg-secondary p-4">
                <div className="w-full max-w-md mx-auto">
                    {children}
                </div>
                <footer className="mt-8 text-center text-theme-text-secondary text-sm">
                    &copy; {new Date().getFullYear()} CCSYR Staff Panel. All rights reserved.
                </footer>
            </div>
        </ConfigProvider>
    );
} 