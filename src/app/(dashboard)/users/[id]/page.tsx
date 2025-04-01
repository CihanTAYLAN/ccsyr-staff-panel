'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    Descriptions,
    Tag,
    Button,
    Spin,
    Empty,
    Breadcrumb,
    Space,
    Tooltip,
    Popconfirm,
} from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { EUserStatus, EUserType, EUserAccountStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';
import { App } from 'antd';
import AccessLogTimeline, { TimelineItem, TimelineFilter } from '@/components/shared/AccessLogTimeline';

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
    const { message } = App.useApp();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const userId = params.id;

    // Timeline States
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [timelineTotal, setTimelineTotal] = useState(0);
    const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>({
        limit: 5,
        page: 1,
    });
    const [loadingTimeline, setLoadingTimeline] = useState(false);

    // Kullanıcı detaylarını getir
    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch user details');
            }

            const data = await response.json();
            setUser(data.user);
        } catch (error: any) {
            console.error("Error fetching user details:", error);
            message.error(error.message || "Failed to load user details");
        } finally {
            setLoading(false);
        }
    };

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
                    ...(timelineFilter.locationId ? { locationId: timelineFilter.locationId } : {})
                });

                const response = await fetch(`/api/access-logs/user/${userId}/timeline?${params}`);
                if (!response.ok) throw new Error('Failed to fetch timeline');

                const data = await response.json();
                setTimeline(data.items);
                setTimelineTotal(data.total);
            } catch (error: any) {
                console.error('Error fetching timeline:', error);
                message.error(error.message || 'Failed to load timeline');
            } finally {
                setLoadingTimeline(false);
            }
        };

        fetchTimeline();
    }, [userId, timelineFilter]);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const deleteUser = async (userId: string, userName: string | null) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete user');
            }

            message.success('User deleted successfully');
            router.push('/users');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            message.error(error.message || 'Failed to delete user');
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
                    <Descriptions.Item label="Online Status">
                        <Tooltip title='Will be updated automatically on next check-in or check-out'>
                            <Tag color={user.status === EUserStatus.ONLINE ? 'success' : 'default'}>
                                {user.status}
                            </Tag>
                        </Tooltip>
                    </Descriptions.Item>
                    <Descriptions.Item label="Account Status">
                        <Tooltip title='Account activation status'>
                            <Tag color={user.userAccountStatus === EUserAccountStatus.ACTIVE ? 'success' : 'error'}>
                                {user.userAccountStatus}
                            </Tag>
                        </Tooltip>
                    </Descriptions.Item>
                    <Descriptions.Item label="Force Password Change">
                        <Tag color={user.forcePasswordChange ? 'warning' : 'default'}>
                            {user.forcePasswordChange ? 'Yes' : 'No'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Current Location" span={3}>
                        {user.currentLocation ? (
                            <Space>
                                <EnvironmentOutlined />
                                {user.currentLocation.name}
                                {user.currentLocation.address ? (
                                    <span className="text-theme-text-secondary">({user.currentLocation.address})</span>
                                ) : 'N/A'}
                            </Space>
                        ) : (
                            <Space>
                                <span className="text-theme-text-secondary">Not assigned</span>
                                <span className="text-theme-text-secondary text-sm">(Will be updated automatically on next check-in)</span>
                            </Space>
                        )}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card className="mb-6" title="Last Login Information" styles={{ body: { padding: 0 } }} size='small'>
                <Descriptions bordered size='small' column={2}>
                    <Descriptions.Item label="Last Login Date">
                        {user.lastLoginDate ? (
                            <Tooltip title={dayjs(user.lastLoginDate).fromNow()}>
                                {dayjs(user.lastLoginDate).format('LLL')}
                            </Tooltip>
                        ) : 'Never logged in'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Logout Date">
                        {user.lastLogoutDate ? (
                            <Tooltip title={dayjs(user.lastLogoutDate).fromNow()}>
                                {dayjs(user.lastLogoutDate).format('LLL')}
                            </Tooltip>
                        ) : 'Never logged out'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Login IP">
                        {user.lastLoginIpAddress || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Login Browser">
                        {user.lastLoginBrowser || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Login OS">
                        {user.lastLoginOs || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Login Device">
                        {user.lastLoginDevice || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Login Location" span={2}>
                        {user.lastLoginLocationStaticName ? (
                            <Space>
                                <EnvironmentOutlined />
                                {user.lastLoginLocationStaticName}
                                {user.lastLoginLocationStaticAddress && (
                                    <span className="text-theme-text-secondary">({user.lastLoginLocationStaticAddress})</span>
                                )}
                            </Space>
                        ) : 'N/A'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card className="mb-6" title="System Information" styles={{ body: { padding: 0 } }} size='small'>
                <Descriptions bordered size='small' column={2}>
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

            <Card title="Access Logs" className="mb-6" size='small'>
                <AccessLogTimeline
                    items={timeline}
                    loading={loadingTimeline}
                    total={timelineTotal}
                    filter={timelineFilter}
                    onFilterChange={setTimelineFilter}
                    userFilter={false}
                />
            </Card>
        </>
    );
} 