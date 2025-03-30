'use client';

import { useState } from 'react';
import { Button, Card, Form, Input, message, Space, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';

const { Title, Text } = Typography;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

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
            <Card
                style={{
                    width: 400,
                    maxWidth: '90%',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    background: theme === 'dark' ? '#1f1f1f' : '#fff',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2}>CCSYR Staff Panel</Title>
                    <Text type="secondary">Sign in to your account</Text>
                </div>

                <Form
                    name="login"
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
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Link href="/auth/forgot-password">Forgot password?</Link>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                        >
                            Log in
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button type="text" icon={<UserOutlined />} onClick={toggleTheme}>
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );
} 