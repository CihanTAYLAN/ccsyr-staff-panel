'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Form, Image, Input, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, BulbOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';

const { Title, Text } = Typography;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const result = await signIn('credentials', {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (result?.error) {
                message.error('Invalid email or password');
            } else {
                message.success('Login successful');
                router.push('/dashboard');
            }
        } catch (error) {
            message.error('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    // İlk render'da içeriği sakla
    if (!isMounted) {
        return null;
    }

    return (
        <Card className="w-full mx-auto shadow-theme-md">
            <div className="text-center mb-6">
                <Image
                    src="/ccsyr-logo.png"
                    alt="logo"
                    preview={false}
                    height={64}
                    className="mx-auto mb-4"
                />
                <Title level={2} className="text-theme-text">CCSYR Staff Panel</Title>
                <Text type="secondary">Sign in to your account</Text>
            </div>

            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
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
                        Log in
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
        </Card >
    );
} 