'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    Descriptions,
    Table,
    Tag,
    Button,
    Spin,
    Tabs,
    Empty,
    Breadcrumb,
    Space,
    Tooltip,
    Popconfirm,
} from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';
import { App } from 'antd';
import AccessLogTimeline, { TimelineItem, TimelineFilter } from '@/components/shared/AccessLogTimeline';
import DynamicMap from '../../../../components/shared/DynamicMap';

// Lokasyon detayları sayfası
export default function LocationDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { message } = App.useApp();
    const [location, setLocation] = useState<any>(null);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const locationId = params.id;

    // Timeline States
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [timelineTotal, setTimelineTotal] = useState(0);
    const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>({
        limit: 5,
        page: 1,
        locationId: locationId,

    });
    const [loadingTimeline, setLoadingTimeline] = useState(false);

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

    // Timeline verilerini getir
    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                setLoadingTimeline(true);
                const params = new URLSearchParams({
                    page: timelineFilter.page.toString(),
                    limit: timelineFilter.limit.toString(),
                    ...(timelineFilter.dateRange ? {
                        startDate: timelineFilter.dateRange[0],
                        endDate: timelineFilter.dateRange[1]
                    } : {}),
                    ...(timelineFilter.userId ? { userId: timelineFilter.userId } : {})
                });

                const response = await fetch(`/api/access-logs/location/${locationId}/timeline?${params}`);
                if (!response.ok) throw new Error('Failed to fetch timeline');

                const data = await response.json();
                setTimeline(data.items);
                setTimelineTotal(data.total);
            } catch (error) {
                console.error('Error fetching timeline:', error);
                message.error('Failed to load timeline');
            } finally {
                setLoadingTimeline(false);
            }
        };

        fetchTimeline();
    }, [locationId, timelineFilter]);

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

    const deleteLocation = async (locationId: string, locationName: string) => {
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
            <div className="flex justify-between items-center mb-6 h-6">
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
                        <Popconfirm
                            title={`Are you sure you want to delete ${location.name}?`}
                            onConfirm={() => deleteLocation(locationId, location.name)}
                            okText="Yes"
                            cancelText="No"
                            okType="danger"
                            placement="left"
                        >
                            <Button
                                type="primary"
                                icon={<DeleteOutlined />}
                                danger
                            ></Button>
                        </Popconfirm>
                    </Tooltip>
                </div>
            </div>

            <div className='flex flex-col lg:flex-row gap-4 mb-6 w-full'>
                <Card title="Location Information" styles={{ body: { padding: 0 } }} size='small' className='w-full lg:w-1/2'>
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
                            {location.activeUsers.length || 0}
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
                <Card title="Location Map" styles={{ body: { padding: 0 } }} size='small' className='w-full lg:w-1/2'>
                    <DynamicMap center={[location.latitude, location.longitude]} zoom={15} markers={[{
                        lat: location.latitude,
                        lng: location.longitude,
                        html: `<div class='flex flex-col gap-1'>
                        <a href="/locations/${location.id}" target="_blank"><strong>${location.name} 🔗</strong></a>
                        <div>${location.address}</div>
                        <strong style="color: #6abe39">Active users: ${location.activeUsers.length}</strong>
                        <a href="https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}" target="_blank"><strong>View on google maps 🔗</strong></a>
                        </div>`
                    }]} />
                </Card>
            </div>

            <Tabs defaultActiveKey="1" className="mb-6" items={[
                {
                    key: '1',
                    label: `Active Users (${activeUsers.length})`,
                    children: (
                        <Card styles={{ body: { padding: 0 } }} >
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
                    label: `Access Logs (${timelineTotal})`,
                    children: (
                        <Card size='small' >
                            <AccessLogTimeline
                                items={timeline}
                                loading={loadingTimeline}
                                total={timelineTotal}
                                filter={timelineFilter}
                                onFilterChange={setTimelineFilter}
                                locationFilter={false}
                            />
                        </Card>
                    )
                }
            ]} />
        </>
    );
} 