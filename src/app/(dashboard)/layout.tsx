'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect } from 'react';
import { useState } from 'react';

export default function Admin({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }
    return <AdminLayout>{children}</AdminLayout>;
}