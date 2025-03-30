'use client';

import { useTheme } from '@/providers/theme-provider';
import { useEffect, useState } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // İlk render'da içeriği sakla
    if (!isMounted) {
        return null;
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: theme === 'dark' ? '#141414' : '#f0f2f5',
            }}
        >
            {children}
        </div>
    );
} 