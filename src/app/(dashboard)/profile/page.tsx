'use client';

import { useEffect, useState } from 'react';
import { Avatar, Card, Button, Form, Input, Tabs, Descriptions, Badge, Timeline, Space, Divider, Tag, Alert, Modal } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { App } from 'antd';

// Zaman formatı için
dayjs.extend(relativeTime);

// Profil bilgileri arayüzü
interface ProfileData {
    id: string;
    name: string;
    email: string;
    userType: string;
    status: string;
    userAccountStatus: string;
    lastLoginDate: string;
    lastLoginBrowser: string;
    lastLoginOs: string;
    lastLoginDevice: string;
    lastLoginIpAddress: string;
    forcePasswordChange: boolean;
    currentLocation?: {
        id: string;
        name: string;
        address: string;
    } | null;
}

// Geçmiş kayıtları arayüzü
interface AccessLog {
    id: string;
    actionType: string;
    actionDate: string;
    created_at: string;
    locationStaticName: string;
    locationStaticAddress: string;
    browser: string;
    os: string;
    device: string;
    ipAddress: string;
}

const ProfilePage = () => {
    const { message } = App.useApp();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    // Profil bilgilerini yükle
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/profile');

                if (!response.ok) {
                    throw new Error('Failed to load profile data');
                }

                const data = await response.json();
                setProfile(data);

                // Form alanlarını doldur
                form.setFieldsValue({
                    name: data.name,
                });

                // Zorunlu şifre değiştirme kontrolü
                if (data.forcePasswordChange) {
                    message.warning('You need to change your password');
                    setShowPasswordModal(true);
                }

            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [form]);

    // Erişim kayıtlarını yükle
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('/api/profile/logs');

                if (!response.ok) {
                    throw new Error('Failed to load access logs');
                }

                const data = await response.json();
                setLogs(data.items);
            } catch (error) {
                console.error('Error fetching logs:', error);
            }
        };

        if (profile) {
            fetchLogs();
        }
    }, [profile]);

    // Profil bilgilerini güncelle
    const handleUpdateProfile = async (values: { name: string }) => {
        try {
            setUpdating(true);
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            setProfile(prev => prev ? { ...prev, ...data } : null);
            message.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    // Şifre değiştir
    const handleChangePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('New passwords do not match');
            return;
        }

        try {
            setUpdating(true);
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to change password');
            }

            const data = await response.json();
            setProfile(prev => prev ? { ...prev, forcePasswordChange: false } : null);
            message.success('Password changed successfully');
            setShowPasswordModal(false);
            passwordForm.resetFields();
        } catch (error: any) {
            console.error('Error changing password:', error);
            message.error(error.message || 'Failed to change password');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="page-loading">Loading profile data...</div>;
    }

    if (error) {
        return <Alert type="error" message="Error" description={error} />;
    }

    if (!profile) {
        return <Alert type="warning" message="No profile data available" />;
    }

    // Tabs için items
    const tabItems = [
        {
            key: 'details',
            label: 'Profile Details',
            children: (
                <Descriptions bordered column={1} size='small'>
                    <Descriptions.Item label="Name">{profile.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
                    <Descriptions.Item label="Role">{profile.userType}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Badge
                            status={profile.userAccountStatus === 'ACTIVE' ? 'success' : 'error'}
                            text={profile.userAccountStatus}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Current Location">
                        {profile.currentLocation ? (
                            <span>
                                <EnvironmentOutlined /> {profile.currentLocation.name}
                                {profile.currentLocation.address && ` (${profile.currentLocation.address})`}
                            </span>
                        ) : (
                            'Not checked in'
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Login">
                        {profile.lastLoginDate ? (
                            <span>
                                <ClockCircleOutlined /> {dayjs(profile.lastLoginDate).format('YYYY-MM-DD HH:mm:ss')}
                                ({dayjs(profile.lastLoginDate).fromNow()})
                            </span>
                        ) : (
                            'No login recorded'
                        )}
                    </Descriptions.Item>
                </Descriptions>
            )
        },
        {
            key: 'edit',
            label: 'Edit Profile',
            children: (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Name" />
                    </Form.Item>

                    <Form.Item label="Email">
                        <Input value={profile.email} disabled prefix={<UserOutlined />} />
                        <small>Email cannot be changed</small>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            onClick={() => setShowPasswordModal(true)}
                            icon={<LockOutlined />}
                        >
                            Change Password
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={updating}
                            icon={<SaveOutlined />}
                        >
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            )
        },
        {
            key: 'history',
            label: 'Access History',
            children: (
                <>
                    {logs.length > 0 ? (
                        <>
                            <Timeline
                                mode="left"
                                items={logs.map(log => ({
                                    color: log.actionType === 'CHECK_IN' ? 'green' : log.actionType === 'CHECK_OUT' ? 'red' : log.actionType === 'UPDATE_LOCATION' ? 'orange' : 'default',
                                    label: dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss'),
                                    children: (
                                        <div>
                                            <p>
                                                <strong>{log.actionType === 'CHECK_IN' ? 'Check-in' : log.actionType === 'CHECK_OUT' ? 'Check-out' : 'Location Update'}</strong>
                                                {' at '}
                                                <strong>{log.locationStaticName}</strong>
                                                {log.locationStaticAddress && ` (${log.locationStaticAddress})`}
                                            </p>
                                            <p>
                                                <small>
                                                    Device: {log.browser} on {log.os} ({log.device})
                                                </small>
                                            </p>
                                        </div>
                                    )
                                }))}
                            />
                        </>
                    ) : (
                        <Alert message="No access history available" type="info" />
                    )}
                </>
            )
        }
    ];

    return (
        <div className="profile-page">
            <h1>My Profile</h1>

            <Card className="profile-card" loading={loading}>
                <div className="profile-header">
                    <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1677ff' }}
                    />
                    <div className="profile-details">
                        <h2>{profile.name}</h2>
                        <p>{profile.email}</p>
                        <Space>
                            <Tag color="blue">{profile.userType}</Tag>
                            <Tag color={profile.userAccountStatus === 'ACTIVE' ? 'green' : 'red'}>
                                {profile.userAccountStatus}
                            </Tag>
                            <Tag color={profile.status === 'ONLINE' ? 'green' : 'default'}>
                                {profile.status}
                            </Tag>
                        </Space>
                    </div>
                </div>

                <Divider />

                <Tabs defaultActiveKey="details" items={tabItems} />
            </Card>

            <Modal
                title="Change Password"
                open={showPasswordModal}
                onCancel={() => {
                    if (!profile.forcePasswordChange) {
                        setShowPasswordModal(false);
                    }
                }}
                footer={null}
                closable={!profile.forcePasswordChange}
                maskClosable={!profile.forcePasswordChange}
            >
                {profile.forcePasswordChange && (
                    <Alert
                        message="Password change required"
                        description="You must change your password before continuing to use the system."
                        type="warning"
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        name="currentPassword"
                        label="Current Password"
                        rules={[{ required: true, message: 'Please input your current password!' }]}
                    >
                        <Input.Password placeholder="Current Password" />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, message: 'Please input your new password!' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                    >
                        <Input.Password placeholder="New Password" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        rules={[
                            { required: true, message: 'Please confirm your new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={updating}
                            block
                        >
                            Change Password
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage; 