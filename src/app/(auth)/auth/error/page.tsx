'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Result } from 'antd';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    let errorMessage = 'An authentication error occurred';

    if (error === 'CredentialsSignin') {
        errorMessage = 'Invalid email or password';
    } else if (error === 'AccessDenied') {
        errorMessage = 'You do not have permission to access this resource';
    } else if (error === 'SessionRequired') {
        errorMessage = 'You need to be signed in to access this page';
    }

    // İlk render'da içeriği sakla
    if (!isMounted) {
        return null;
    }

    return (
        <Card
            style={{
                width: 500,
                maxWidth: '90%',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                background: theme === 'dark' ? '#1f1f1f' : '#fff',
            }}
        >
            <Result
                status="error"
                title="Authentication Error"
                subTitle={errorMessage}
                extra={[
                    <Button type="primary" key="login">
                        <Link href="/auth/login">Back to Login</Link>
                    </Button>,
                ]}
            />
        </Card>
    );
} 