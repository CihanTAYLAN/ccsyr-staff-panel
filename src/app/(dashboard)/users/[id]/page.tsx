'use client';

import { useState, useEffect } from 'react';
import { Card, Descriptions, Table, Tag, Button, Spin, Tabs, Empty, message, Breadcrumb, Space, Modal, Tooltip, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { EUserStatus, EUserType, EActionType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';

const { TabPane } = Tabs;
const { confirm } = Modal;

// Kullanıcı tipi bilgileri
const getUserTypeLabel = (type: EUserType) => {
    switch (type) {
        case EUserType.SUPER_ADMIN:
            return { text: 'Super Admin', color: 'red' };
        case EUserType.MANAGER_ADMIN:
            return { text: 'Manager Admin', color: 'blue' };
        case EUserType.PERSONAL:
            return { text: 'Personal', color: 'green' };
        default:
            return { text: type, color: 'default' };
    }
};

// Kullanıcı detayları sayfası
export default function UserDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [accessLogs, setAccessLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userId = params.id;

    // Kullanıcı detaylarını getir
    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const data = await response.json();
            setUser(data.user);
            setAccessLogs(data.accessLogs);
        } catch (error) {
            console.error('Error fetching user details:', error);
            message.error('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    // Erişim kayıtları için tablo sütunları
    const accessLogsColumns = [
        {
            title: 'Date & Time',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text: string) => dayjs(text).format('LLL'),
        },
        {
            title: 'Action',
            dataIndex: 'actionType',
            key: 'actionType',
            render: (actionType: EActionType) => (
                <Tag color={actionType === EActionType.CHECK_IN ? 'green' : 'orange'}>
                    {actionType.replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (location: any) => location.name,
        },
        {
            title: 'Address',
            dataIndex: 'location',
            key: 'address',
            render: (location: any) => location.address || 'N/A',
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            render: (text: string) => text || 'N/A',
        },
    ];

    const deleteUser = async (userId: string, userName: string | null) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            message.success('User deleted successfully');
            router.push('/users');
        } catch (error) {
            message.error('Failed to delete user');
            console.error('Error deleting user:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center">
                <Empty description="User not found" />
                <Button type="primary" onClick={() => router.push('/users')} className="mt-4">
                    Back to Users
                </Button>
            </div>
        );
    }

    const userTypeInfo = getUserTypeLabel(user.userType);

    return (
        <>
            <div className="flex justify-between items-center mb-6 h-6">
                <Breadcrumb
                    items={[
                        { title: <Link href="/dashboard">Dashboard</Link> },
                        { title: <Link href="/users">Users</Link> },
                        { title: user.name },
                    ]}
                />
                <div className="flex items-center gap-2">
                    <Tooltip title="Refresh">
                        <Button type='default' onClick={() => fetchUserDetails()} icon={<ReloadOutlined />} loading={loading}></Button>
                    </Tooltip>
                    <Tooltip title="Edit User">
                        <Link href={`/users/${userId}/edit`}>
                            <Button type="primary" icon={<EditOutlined />}></Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Delete User">
                        <Popconfirm
                            title="Delete user"
                            description={`Are you sure you want to delete ${user.name || 'this user'}?`}
                            onConfirm={() => deleteUser(userId, user.name)}
                            okText="Yes"
                            cancelText="No"
                            placement='left'
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="primary" icon={<DeleteOutlined />} danger></Button>
                        </Popconfirm>
                    </Tooltip>
                </div>
            </div>

            <Card className="mb-6" title="User Information" styles={{ body: { padding: 0 } }} size='small'>
                <Descriptions bordered size='small' column={3}>
                    <Descriptions.Item label="Name" span={2}>
                        {user.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="User Type">
                        <Tag color={userTypeInfo.color}>{userTypeInfo.text}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email" span={3}>
                        {user.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tooltip title='Will be updated automatically on next check-in or check-out'>
                            <Tag color={user.status === EUserStatus.ONLINE ? 'success' : 'default'}>
                                {user.status}
                            </Tag>
                        </Tooltip>
                    </Descriptions.Item>
                    <Descriptions.Item label="Current Location" span={2}>
                        {user.currentLocation ? (
                            <Space>
                                <EnvironmentOutlined />
                                {user.currentLocation.name}
                                {user.currentLocation.address && (
                                    <span className="text-theme-text-secondary">({user.currentLocation.address})</span>
                                )}
                                <span className="ml-2 text-theme-text-secondary text-sm">(Automatically updated based on user check-in/check-out)</span>
                            </Space>
                        ) : (
                            <Space>
                                <span className="text-theme-text-secondary">Not assigned</span>
                                <span className="text-theme-text-secondary text-sm">(Will be updated automatically on next check-in)</span>
                            </Space>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        <Tooltip title={dayjs(user.created_at).fromNow()}>
                            {dayjs(user.created_at).format('LLL')}
                        </Tooltip>
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                        <Tooltip title={dayjs(user.updated_at).fromNow()}>
                            {dayjs(user.updated_at).format('LLL')}
                        </Tooltip>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Access Logs" className="mb-6">
                {accessLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table
                            columns={accessLogsColumns}
                            dataSource={accessLogs}
                            rowKey="id"
                            className="custom-table"
                            scroll={{ x: 800 }}
                            pagination={{ pageSize: 10, hideOnSinglePage: true }}
                        />
                    </div>
                ) : (
                    <Empty description="No access logs found" />
                )}
            </Card>
        </>
    );
} 