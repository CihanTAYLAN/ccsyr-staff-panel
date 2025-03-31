'use client';

import { useEffect, useState } from 'react';
import { Card, Descriptions, message, Breadcrumb, Spin } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { DynamicMapProps } from '@/types/map';
import Link from 'next/link';
import AccessLogTimeline, { TimelineItem, TimelineFilter } from '@/components/shared/AccessLogTimeline';

const DynamicMap = dynamic<DynamicMapProps>(() => import('../../../../components/shared/DynamicMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 flex items-center justify-center">Loading map...</div>
});

// Tip tanımlamaları
type AccessLogDetailData = {
    id: string;
    actionType: string;
    actionDate: string;
    ipAddress: string;
    userAgent: string;
    browser: string;
    os: string;
    device: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    location: {
        id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
};

export default function AccessLogDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [logDetail, setLogDetail] = useState<AccessLogDetailData | null>(null);
    const [userTimeline, setUserTimeline] = useState<TimelineItem[]>([]);
    const [locationTimeline, setLocationTimeline] = useState<TimelineItem[]>([]);
    const [userTimelineFilter, setUserTimelineFilter] = useState<TimelineFilter>({
        limit: 10,
        page: 1
    });
    const [locationTimelineFilter, setLocationTimelineFilter] = useState<TimelineFilter>({
        limit: 10,
        page: 1
    });
    const [userTimelineTotal, setUserTimelineTotal] = useState(0);
    const [locationTimelineTotal, setLocationTimelineTotal] = useState(0);

    useEffect(() => {
        const fetchLogDetail = async () => {
            try {
                const response = await fetch(`/api/access-logs/${params.id}`);
                if (!response.ok) throw new Error('Failed to fetch log detail');
                const data = await response.json();
                setLogDetail(data);

                // Fetch user timeline
                if (data.user?.id) {
                    const userTimelineResponse = await fetch(`/api/access-logs/user/${data.user.id}/timeline`);
                    if (userTimelineResponse.ok) {
                        const userTimelineData = await userTimelineResponse.json();
                        setUserTimeline(userTimelineData.items);
                        setUserTimelineTotal(userTimelineData.total);
                    }
                }

                // Fetch location timeline
                if (data.location?.id) {
                    const locationTimelineResponse = await fetch(`/api/access-logs/location/${data.location.id}/timeline`);
                    if (locationTimelineResponse.ok) {
                        const locationTimelineData = await locationTimelineResponse.json();
                        setLocationTimeline(locationTimelineData.items);
                        setLocationTimelineTotal(locationTimelineData.total);
                    }
                }
            } catch (error) {
                console.error('Error fetching log detail:', error);
                message.error('Failed to load log details');
            } finally {
                setLoading(false);
            }
        };

        fetchLogDetail();
    }, [params.id]);

    const handleUserTimelineFilterChange = async (filter: TimelineFilter) => {
        setUserTimelineFilter(filter);
        if (logDetail?.user?.id) {
            try {
                const response = await fetch(`/api/access-logs/user/${logDetail.user.id}/timeline?${new URLSearchParams({
                    page: filter.page.toString(),
                    limit: filter.limit.toString(),
                    ...(filter.dateRange ? {
                        startDate: filter.dateRange[0],
                        endDate: filter.dateRange[1]
                    } : {}),
                    ...(filter.locationId ? { locationId: filter.locationId } : {})
                })}`);

                if (response.ok) {
                    const data = await response.json();
                    setUserTimeline(data.items);
                    setUserTimelineTotal(data.total);
                }
            } catch (error) {
                console.error('Error fetching user timeline:', error);
                message.error('Failed to update user timeline');
            }
        }
    };

    const handleLocationTimelineFilterChange = async (filter: TimelineFilter) => {
        setLocationTimelineFilter(filter);
        if (logDetail?.location?.id) {
            try {
                const response = await fetch(`/api/access-logs/location/${logDetail.location.id}/timeline?${new URLSearchParams({
                    page: filter.page.toString(),
                    limit: filter.limit.toString(),
                    ...(filter.dateRange ? {
                        startDate: filter.dateRange[0],
                        endDate: filter.dateRange[1]
                    } : {}),
                    ...(filter.userId ? { userId: filter.userId } : {})
                })}`);

                if (response.ok) {
                    const data = await response.json();
                    setLocationTimeline(data.items);
                    setLocationTimelineTotal(data.total);
                }
            } catch (error) {
                console.error('Error fetching location timeline:', error);
                message.error('Failed to update location timeline');
            }
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6 h-6">
                <Breadcrumb
                    items={[
                        { title: <Link href="/dashboard">Dashboard</Link> },
                        { title: <Link href="/access-logs">Access Logs</Link> },
                        {
                            title: loading ? 'Loading...' : logDetail?.user?.name && logDetail?.location?.name ? (
                                <>
                                    <UserOutlined /> {logDetail.user?.name} - <EnvironmentOutlined /> {logDetail.location?.name}
                                </>
                            ) : 'Unknown Log'
                        },
                    ]}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <div className="flex flex-col gap-4 w-full">
                    <Card title="Access Log Details" size='small'>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Action Type">{logDetail?.actionType || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Action Date">{logDetail?.actionDate ? new Date(logDetail?.actionDate).toLocaleString() : 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="IP Address">{logDetail?.ipAddress || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="User Agent">{logDetail?.userAgent || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Browser">{logDetail?.browser || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="OS">{logDetail?.os || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Device">{logDetail?.device || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title="User Information" size='small'>
                        <Descriptions bordered>
                            <Descriptions.Item label="Name">{logDetail?.user?.name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{logDetail?.user?.email || 'N/A'}</Descriptions.Item>
                        </Descriptions>

                        <div className="mt-4">
                            <AccessLogTimeline
                                items={userTimeline}
                                total={userTimelineTotal}
                                filter={userTimelineFilter}
                                onFilterChange={handleUserTimelineFilterChange}
                            />
                        </div>
                    </Card>

                    <Card title="Location Information" size='small'>
                        {logDetail?.location && (
                            <>
                                <Descriptions bordered>
                                    <Descriptions.Item label="Name">{logDetail?.location?.name || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Address">{logDetail?.location?.address || 'N/A'}</Descriptions.Item>
                                </Descriptions>

                                <div className="mt-4 h-[400px]">
                                    <DynamicMap
                                        center={[logDetail?.location?.latitude, logDetail?.location?.longitude]}
                                        markers={[{
                                            lat: logDetail?.location?.latitude,
                                            lng: logDetail?.location?.longitude,
                                            title: logDetail?.location?.name
                                        }]}
                                    />
                                </div>

                                <div className="mt-4">
                                    <AccessLogTimeline
                                        items={locationTimeline}
                                        total={locationTimelineTotal}
                                        filter={locationTimelineFilter}
                                        onFilterChange={handleLocationTimelineFilterChange}
                                    />
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            )}
        </>
    );
} 