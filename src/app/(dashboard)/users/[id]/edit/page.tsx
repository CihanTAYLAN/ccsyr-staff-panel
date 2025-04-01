'use client';;
import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message, Spin, Breadcrumb, Switch } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { EUserType, EUserAccountStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Kullanıcı tipi seçenekleri
const userTypeOptions = [
    { value: EUserType.SUPER_ADMIN, label: 'Super Admin' },
    { value: EUserType.MANAGER_ADMIN, label: 'Manager Admin' },
    { value: EUserType.PERSONAL, label: 'Personal' },
];

// Kullanıcı hesap durumu seçenekleri
const userAccountStatusOptions = [
    { value: EUserAccountStatus.ACTIVE, label: 'Active' },
    { value: EUserAccountStatus.INACTIVE, label: 'Inactive' },
];

export default function EditUserPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const userId = params.id;

    // Kullanıcı bilgilerini getir
    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const data = await response.json();

            // Form alanlarını doldur
            form.setFieldsValue({
                name: data.user.name,
                email: data.user.email,
                userType: data.user.userType,
                status: data.user.status,
                userAccountStatus: data.user.userAccountStatus || EUserAccountStatus.ACTIVE,
                forcePasswordChange: data.user.forcePasswordChange || false,
                password: '', // Şifreyi güvenlik nedeniyle boş bırak
            });
        } catch (error: any) {
            console.error("Error fetching user details:", error);
            message.error(error.message || "Failed to load user details");
            router.push("/users");
        } finally {
            setLoading(false);
        }
    };

    // Kullanıcı bilgilerini güncelle
    const updateUser = async (values: any) => {
        setSubmitting(true);
        try {
            // Boş şifre alanını kaldır (değiştirilmemişse)
            if (!values.password) {
                delete values.password;
            }

            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user');
            }

            message.success('User updated successfully');
            router.push(`/users/${userId}`);
        } catch (error: any) {
            message.error(error.message || 'Failed to update user');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const handleCancel = () => {
        router.push(`/users/${userId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6 h-6">
                <Breadcrumb
                    items={[
                        { title: <Link href="/dashboard">Dashboard</Link> },
                        { title: <Link href="/users">Users</Link> },
                        { title: form.getFieldValue('name'), href: `/users/${userId}` },
                        { title: 'Edit User' },
                    ]}
                />
            </div>

            <Card title="Edit User" size='small'>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={updateUser}
                    className="max-w-xl"
                    initialValues={{
                        name: '',
                        email: '',
                        userType: undefined,
                        status: undefined,
                        userAccountStatus: EUserAccountStatus.ACTIVE,
                        forcePasswordChange: false,
                        password: '',
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        extra="Leave blank to keep current password"
                        rules={[
                            { min: 6, message: 'Password must be at least 6 characters', required: false }
                        ]}
                    >
                        <Input.Password placeholder="Enter new password (optional)" />
                    </Form.Item>

                    <Form.Item
                        name="userType"
                        label="User Type"
                        rules={[{ required: true, message: 'Please select user type' }]}
                    >
                        <Select placeholder="Select user type" options={userTypeOptions} />
                    </Form.Item>

                    <Form.Item
                        name="userAccountStatus"
                        label="Account Status"
                        rules={[{ required: true, message: 'Please select account status' }]}
                    >
                        <Select placeholder="Select account status" options={userAccountStatusOptions} />
                    </Form.Item>

                    <Form.Item
                        name="forcePasswordChange"
                        label="Force Password Change"
                        valuePropName="checked"
                        extra="If enabled, the user will be required to change their password on next login"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Online Status"
                    >
                        <Input disabled placeholder="Online status can only be changed by the user's activity" />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex justify-between">
                            <Button type="default" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<SaveOutlined />}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </>
    );
} 