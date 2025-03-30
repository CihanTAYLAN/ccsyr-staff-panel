'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Typography, Result } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';

const { Title, Text } = Typography;

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams?.get('error') || 'Unknown error';
    const { theme, toggleTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getErrorMessage = () => {
        switch (error) {
            case 'CredentialsSignin':
                return 'Invalid email or password';
            case 'SessionRequired':
                return 'You need to be signed in to access this page';
            case 'AccessDenied':
                return 'You do not have permission to access this resource';
            case 'Verification':
                return 'The verification link is invalid or has expired';
            default:
                return 'An authentication error occurred';
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Card className="w-full max-w-md shadow-theme-md card-hover-effect">
            <Result
                status="error"
                title={<Title level={3} className="text-theme-text m-0">Authentication Error</Title>}
                subTitle={<Text type="secondary">{getErrorMessage()}</Text>}
            />

            <div className="text-center mt-4">
                <Link href="/auth/login">
                    <Button
                        type="primary"
                        size="large"
                        className="bg-gradient-primary hover:bg-primary-dark button-hover-effect"
                    >
                        Back to Login
                    </Button>
                </Link>
            </div>

            <div className="text-center mt-4">
                <Button
                    type="text"
                    icon={<BulbOutlined />}
                    onClick={toggleTheme}
                    className="text-theme-text hover:text-primary"
                >
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
            </div>
        </Card>
    );
} 