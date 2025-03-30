'use client';

import { useState, useEffect } from 'react';
import { Card, Descriptions, Table, Tag, Button, Spin, Tabs, Empty, message, Breadcrumb, Space, Modal, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { EActionType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';

const { TabPane } = Tabs;
const { confirm } = Modal;

// Lokasyon detayları sayfası
export default function LocationDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [location, setLocation] = useState<any>(null);
    const [accessLogs, setAccessLogs] = useState<any[]>([]);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const locationId = params.id;

    // Lokasyon detaylarını getir
    const fetchLocationDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/locations/${locationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch location details');
            }

            const data = await response.json();
            setLocation(data.location);
            setActiveUsers(data.location.activeUsers || []);
            setAccessLogs(data.accessLogs || []);
        } catch (error) {
            console.error('Error fetching location details:', error);
            message.error('Failed to load location details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocationDetails();
    }, [locationId]);

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
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user: any) => (
                <Link href={`/users/${user.id}`}>
                    {user.name || user.email}
                </Link>
            ),
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            render: (text: string) => text || 'N/A',
        },
    ];

    // Aktif kullanıcılar için tablo sütunları
    const activeUsersColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <Link href={`/users/${record.id}`}>
                    {text || 'N/A'}
                </Link>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'User Type',
            dataIndex: 'userType',
            key: 'userType',
            render: (type: string) => (
                <Tag color={
                    type === 'SUPER_ADMIN' ? 'red' :
                        type === 'MANAGER_ADMIN' ? 'blue' : 'green'
                }>
                    {type.replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'ONLINE' ? 'success' : 'default'}>
                    {status}
                </Tag>
            ),
        },
    ];

    const confirmDeleteLocation = (locationId: string, locationName: string) => {
        confirm({
            title: `Are you sure you want to delete ${locationName}?`,
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            cancelText: 'No',
            okType: 'danger',
            async onOk() {
                try {
                    const response = await fetch(`/api/locations/${locationId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete location');
                    }

                    message.success('Location deleted successfully');
                    router.push('/locations');
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete location');
                    console.error('Error deleting location:', error);
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!location) {
        return (
            <div className="text-center">
                <Empty description="Location not found" />
                <Button type="primary" onClick={() => router.push('/locations')} className="mt-4">
                    Back to Locations
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6 h-16">
                <Breadcrumb
                    items={[
                        { title: <Link href="/dashboard">Dashboard</Link> },
                        { title: <Link href="/locations">Locations</Link> },
                        { title: location.name },
                    ]}
                />
                <div className="flex items-center gap-2">
                    <Tooltip title="Refresh">
                        <Button type='default' onClick={() => fetchLocationDetails()} icon={<ReloadOutlined />} loading={loading}></Button>
                    </Tooltip>
                    <Tooltip title="Edit Location">
                        <Link href={`/locations/${locationId}/edit`}>
                            <Button type="primary" icon={<EditOutlined />}></Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Delete Location">
                        <Button
                            type="primary"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => confirmDeleteLocation(locationId, location.name)}
                        ></Button>
                    </Tooltip>
                </div>
            </div>

            <Card className="mb-6" title="Location Information" styles={{ body: { padding: 0 } }} size='small'>
                <Descriptions bordered size='small'>
                    <Descriptions.Item label="Name" span={3}>
                        <Space>
                            <EnvironmentOutlined />
                            {location.name}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Description" span={3}>
                        {location.description || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address" span={3}>
                        {location.address || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Coordinates" span={3}>
                        {location.latitude && location.longitude
                            ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                            : 'N/A'
                        }
                    </Descriptions.Item>
                    <Descriptions.Item label="Active Users">
                        {location._count?.activeUsers || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        <Tooltip title={dayjs(location.created_at).fromNow()}>
                            {dayjs(location.created_at).format('LLL')}
                        </Tooltip>
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                        <Tooltip title={dayjs(location.updated_at).fromNow()}>
                            {dayjs(location.updated_at).format('LLL')}
                        </Tooltip>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Tabs defaultActiveKey="1" className="mb-6" items={[
                {
                    key: '1',
                    label: `Active Users (${activeUsers.length})`,
                    children: (
                        <Card styles={{ body: { padding: 0 } }}>
                            {activeUsers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table
                                        columns={activeUsersColumns}
                                        dataSource={activeUsers}
                                        rowKey="id"
                                        className="custom-table"
                                        scroll={{ x: 800 }}
                                        pagination={{ pageSize: 10, hideOnSinglePage: true }}
                                    />
                                </div>
                            ) : (
                                <Empty description="No active users at this location" />
                            )}
                        </Card>
                    )
                },
                {
                    key: '2',
                    label: `Access Logs (${accessLogs.length})`,
                    children: (
                        <Card styles={{ body: { padding: 0 } }}>
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
                    )
                }
            ]} />
        </>
    );
} 