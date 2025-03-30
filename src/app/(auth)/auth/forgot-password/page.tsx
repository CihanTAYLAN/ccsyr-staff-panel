'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            // Bu kısım gerçek şifre sıfırlama işlemini yapacak şekilde düzenlenecek.
            // Şimdilik sadece yer tutucu olarak mesaj gösteriyoruz.
            message.success('Password reset instructions sent to your email');
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // İlk render'da içeriği sakla
    if (!isMounted) {
        return null;
    }

    return (
        <Card
            style={{
                width: 400,
                maxWidth: '90%',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                background: theme === 'dark' ? '#1f1f1f' : '#fff',
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={2}>Reset Password</Title>
                <Text type="secondary">
                    Enter your email and we'll send you a link to reset your password
                </Text>
            </div>

            <Form
                name="forgotPassword"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email' },
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                    >
                        Send Reset Link
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                    <Link href="/auth/login">Back to Login</Link>
                </div>
            </Form>
        </Card>
    );
} 