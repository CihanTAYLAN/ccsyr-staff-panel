'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { MailOutlined, BulbOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            // API isteği gerçekleştirilecek
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            message.success('Password reset instructions have been sent to your email address');
        } catch (error) {
            message.error('There was an error sending the password reset email');
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Card className="w-full max-w-md shadow-theme-md card-hover-effect">
            <div className="text-center mb-6">
                <Title level={2} className="text-theme-text">Reset Password</Title>
                <Text type="secondary">Enter your email to receive password reset instructions</Text>
            </div>

            <Form
                name="forgot-password"
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
                        prefix={<MailOutlined className="text-theme-secondary" />}
                        placeholder="Email"
                        size="large"
                        className="bg-theme-input"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        className="bg-gradient-primary hover:bg-primary-dark button-hover-effect"
                    >
                        Send Reset Link
                    </Button>
                </Form.Item>

                <div className="text-center mt-4">
                    <Link href="/auth/login" className="text-primary hover:text-primary-dark">
                        Back to Login
                    </Link>
                </div>
            </Form>

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