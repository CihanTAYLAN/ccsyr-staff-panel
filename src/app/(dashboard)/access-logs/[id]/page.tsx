'use client';

import { useEffect, useState } from 'react';
import { Card, Descriptions, message, Breadcrumb, Spin, Tag, Tooltip } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { DynamicMapProps } from '@/types/map';
import Link from 'next/link';
import AccessLogTimeline, { TimelineItem, TimelineFilter, getItemColor } from '@/components/shared/AccessLogTimeline';
import dayjs from 'dayjs';
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

    // User Timeline States
    const [userTimeline, setUserTimeline] = useState<TimelineItem[]>([]);
    const [userTimelineTotal, setUserTimelineTotal] = useState(0);
    const [userTimelineFilter, setUserTimelineFilter] = useState<TimelineFilter>({
        limit: 5,
        page: 1
    });
    const [loadingUserTimeline, setLoadingUserTimeline] = useState(false);

    // Location Timeline States
    const [locationTimeline, setLocationTimeline] = useState<TimelineItem[]>([]);
    const [locationTimelineTotal, setLocationTimelineTotal] = useState(0);
    const [locationTimelineFilter, setLocationTimelineFilter] = useState<TimelineFilter>({
        limit: 5,
        page: 1
    });
    const [loadingLocationTimeline, setLoadingLocationTimeline] = useState(false);

    // Fetch log detail
    useEffect(() => {
        const fetchLogDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/access-logs/${params.id}`);
                if (!response.ok) throw new Error('Failed to fetch log detail');
                const data = await response.json();
                setLogDetail(data);
            } catch (error) {
                console.error('Error fetching log detail:', error);
                message.error('Failed to load log details');
            } finally {
                setLoading(false);
            }
        };

        fetchLogDetail();
    }, [params.id]);

    // Fetch user timeline
    useEffect(() => {
        const fetchUserTimeline = async () => {
            if (!logDetail?.user?.id) return;

            try {
                setLoadingUserTimeline(true);
                const params = new URLSearchParams({
                    page: userTimelineFilter.page.toString(),
                    limit: userTimelineFilter.limit.toString(),
                    ...(userTimelineFilter.dateRange ? {
                        startDate: userTimelineFilter.dateRange[0],
                        endDate: userTimelineFilter.dateRange[1]
                    } : {}),
                    ...(userTimelineFilter.locationId ? { locationId: userTimelineFilter.locationId } : {})
                });

                const response = await fetch(`/api/access-logs/user/${logDetail.user.id}/timeline?${params}`);
                if (!response.ok) throw new Error('Failed to fetch user timeline');

                const data = await response.json();
                setUserTimeline(data.items);
                setUserTimelineTotal(data.total);
            } catch (error) {
                console.error('Error fetching user timeline:', error);
                message.error('Failed to load user timeline');
            } finally {
                setLoadingUserTimeline(false);
            }
        };

        fetchUserTimeline();
    }, [logDetail?.user?.id, userTimelineFilter]);

    // Fetch location timeline
    useEffect(() => {
        const fetchLocationTimeline = async () => {
            if (!logDetail?.location?.id) return;

            try {
                setLoadingLocationTimeline(true);
                const params = new URLSearchParams({
                    page: locationTimelineFilter.page.toString(),
                    limit: locationTimelineFilter.limit.toString(),
                    ...(locationTimelineFilter.dateRange ? {
                        startDate: locationTimelineFilter.dateRange[0],
                        endDate: locationTimelineFilter.dateRange[1]
                    } : {}),
                    ...(locationTimelineFilter.userId ? { userId: locationTimelineFilter.userId } : {})
                });

                const response = await fetch(`/api/access-logs/location/${logDetail.location.id}/timeline?${params}`);
                if (!response.ok) throw new Error('Failed to fetch location timeline');

                const data = await response.json();
                setLocationTimeline(data.items);
                setLocationTimelineTotal(data.total);
            } catch (error) {
                console.error('Error fetching location timeline:', error);
                message.error('Failed to load location timeline');
            } finally {
                setLoadingLocationTimeline(false);
            }
        };

        fetchLocationTimeline();
    }, [logDetail?.location?.id, locationTimelineFilter]);

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
                            <Descriptions.Item label="Action Type">
                                <Tag color={getItemColor(logDetail?.actionType || '')}>
                                    {logDetail?.actionType || 'N/A'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Action Date">
                                <Tooltip title={dayjs(logDetail?.actionDate).fromNow()}>
                                    {logDetail?.actionDate ? dayjs(logDetail?.actionDate).format('LLL') : 'N/A'}
                                </Tooltip>
                            </Descriptions.Item>
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
                                loading={loadingUserTimeline}
                                total={userTimelineTotal}
                                filter={userTimelineFilter}
                                onFilterChange={setUserTimelineFilter}
                                userFilter={false}
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
                                            html: `<div class='flex flex-col gap-1'>
                                            <a href="/locations/${logDetail?.location?.id}" target="_blank"><strong>${logDetail?.location?.name} 🔗</strong></a>
                                            <div>${logDetail?.location?.address}</div>
                                            <a href="https://www.google.com/maps/search/?api=1&query=${logDetail?.location?.latitude},${logDetail?.location?.longitude}" target="_blank"><strong>View on google maps 🔗</strong></a>
                                            </div>`
                                        }]}
                                    />
                                </div>

                                <div className="mt-4">
                                    <AccessLogTimeline
                                        items={locationTimeline}
                                        loading={loadingLocationTimeline}
                                        total={locationTimelineTotal}
                                        filter={locationTimelineFilter}
                                        onFilterChange={setLocationTimelineFilter}
                                        locationFilter={false}
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