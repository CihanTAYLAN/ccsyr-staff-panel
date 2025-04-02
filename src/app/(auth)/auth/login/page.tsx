'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Form, Image, Input, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, BulbOutlined } from '@ant-design/icons';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';
import { EUserType } from '@prisma/client';

const { Title, Text } = Typography;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme, toggleTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const { status, data: session } = useSession();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (status === 'authenticated') {
            const callbackUrl = searchParams.get('callbackUrl');
            if (session?.user.userType === EUserType.PERSONAL) {
                router.push(callbackUrl || '/profile');
            } else {
                router.push(callbackUrl || '/dashboard');
            }
            router.refresh();
        }
    }, [status, router, searchParams]);

    const [form] = Form.useForm();

    const handleLoginSubmit = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
            const result = await signIn('credentials', {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                message.error(result.error);
            } else {
                message.success('Login successful');
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error: any) {
            message.error(error.message || 'An error occurred during login');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Card className="w-full mx-auto shadow-theme-md">
            <div className="text-center mb-6">
                <Image
                    src="/images/ccsyr-logo.png"
                    alt="logo"
                    preview={false}
                    height={64}
                    className="mx-auto mb-4"
                />
                <Title level={2} className="text-theme-text">CCSYR Staff Panel</Title>
                <Text type="secondary">Sign in to your account</Text>
            </div>

            <Form
                form={form}
                name="login-form"
                initialValues={{ remember: true }}
                onFinish={handleLoginSubmit}
                layout="vertical"
                className="w-full"
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email' },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined className="text-theme-secondary" />}
                        placeholder="Email"
                        size="large"
                        className="bg-theme-input"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-theme-secondary" />}
                        placeholder="Password"
                        size="large"
                        className="bg-theme-input"
                    />
                </Form.Item>

                <Form.Item>
                    <Link href="/auth/forgot-password" className="text-primary hover:text-primary-dark">
                        Forgot password?
                    </Link>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        className="bg-gradient-primary hover:bg-primary-dark"
                    >
                        Sign In
                    </Button>
                </Form.Item>
            </Form>

            <div className="text-center">
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