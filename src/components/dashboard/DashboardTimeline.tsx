'use client';

import React, { useEffect, useState } from 'react';
import { Timeline, Card, Spin, Alert, Tag, Select, DatePicker, Button, Space } from 'antd';
import {
    LoginOutlined,
    LogoutOutlined,
    UserOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    ClockCircleOutlined, ClearOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// dayjs eklentisini yükle
dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;
const { Option } = Select;

interface TimelineItem {
    id: string;
    actionType: string;
    created_at: string;
    actionDate: string;
    ipAddress: string;
    browser: string;
    os: string;
    device: string;
    locationStaticName: string;
    locationStaticAddress: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    location: {
        id: string;
        name: string;
        address: string;
    };
}

interface TimelineData {
    items: TimelineItem[];
    totalCount: number;
    hasMore: boolean;
}

interface FilterParams {
    limit: number;
    startDate: string | null;
    endDate: string | null;
    locationId: string | null;
    userId: string | null;
}

const DashboardTimeline: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
    const [locations, setLocations] = useState<{ id: string, name: string }[]>([]);
    const [users, setUsers] = useState<{ id: string, name: string }[]>([]);
    const [filters, setFilters] = useState<FilterParams>({
        limit: 10,
        startDate: null,
        endDate: null,
        locationId: null,
        userId: null
    });

    // Lokasyonları yükle
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('/api/locations');
                if (!response.ok) {
                    throw new Error('Failed to fetch locations');
                }
                const data = await response.json();
                setLocations(data.locations);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        fetchLocations();
    }, []);

    // Zaman çizelgesi verilerini yükle
    useEffect(() => {
        const fetchTimelineData = async () => {
            try {
                setLoading(true);

                // Query parametrelerini oluştur
                const params = new URLSearchParams();
                params.append('limit', filters.limit.toString());
                if (filters.startDate) params.append('startDate', filters.startDate);
                if (filters.endDate) params.append('endDate', filters.endDate);
                if (filters.locationId) params.append('locationId', filters.locationId);
                if (filters.userId) params.append('userId', filters.userId);

                const response = await fetch(`/api/dashboard/timeline?${params.toString()}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch timeline data');
                }

                const data: TimelineData = await response.json();
                setTimelineData(data.items);
                setError(null);
            } catch (err) {
                console.error('Error fetching timeline data:', err);
                setError('Failed to load timeline data');
            } finally {
                setLoading(false);
            }
        };

        fetchTimelineData();
    }, [filters]);

    const handleFilterChange = (newFilters: Partial<FilterParams>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleClearFilters = () => {
        setFilters({
            limit: 10,
            startDate: null,
            endDate: null,
            locationId: null,
            userId: null
        });
    };

    const getItemColor = (actionType: string) => {
        return actionType === 'CHECK_IN' ? 'green' : actionType === 'CHECK_OUT' ? 'red' : actionType === 'UPDATE_LOCATION' ? 'orange' : 'default';
    };

    const getItemIcon = (actionType: string) => {
        return actionType === 'CHECK_IN' ? <LoginOutlined /> : actionType === 'CHECK_OUT' ? <LogoutOutlined /> : actionType === 'UPDATE_LOCATION' ? <EnvironmentOutlined /> : null;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large">
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                        Loading timeline data...
                    </div>
                </Spin>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
            />
        );
    }

    return (
        <Card className="dashboard-timeline-card" size='small'>
            <div className="timeline-filters" style={{ marginBottom: 16 }}>
                <Space wrap>
                    <Select
                        placeholder="Select location"
                        style={{ width: 200 }}
                        allowClear
                        value={filters.locationId}
                        onChange={(value) => handleFilterChange({ locationId: value })}
                    >
                        {locations.map((location) => (
                            <Option key={location.id} value={location.id}>{location.name}</Option>
                        ))}
                    </Select>

                    <RangePicker
                        onChange={(dates, dateStrings) => {
                            handleFilterChange({
                                startDate: dateStrings[0] || null,
                                endDate: dateStrings[1] || null
                            });
                        }}
                        allowClear
                    />

                    <Select
                        placeholder="Number of records"
                        style={{ width: 120 }}
                        value={filters.limit}
                        onChange={(value) => handleFilterChange({ limit: value })}
                    >
                        <Option value={5}>5 records</Option>
                        <Option value={10}>10 records</Option>
                        <Option value={20}>20 records</Option>
                        <Option value={50}>50 records</Option>
                    </Select>

                    <Button
                        icon={<ClearOutlined />}
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </Button>
                </Space>
            </div>

            {timelineData && timelineData.length > 0 ? (
                <Timeline
                    mode="left"
                    items={timelineData.map((item) => ({
                        color: getItemColor(item.actionType),
                        dot: getItemIcon(item.actionType),
                        children: (
                            <div className="timeline-item">
                                <div className="timeline-item-header">
                                    <Tag color={item.actionType === 'CHECK_IN' ? 'success' : item.actionType === 'CHECK_OUT' ? 'error' : item.actionType === 'UPDATE_LOCATION' ? 'warning' : 'default'}>
                                        {item.actionType === 'CHECK_IN' ? 'Check In' : item.actionType === 'CHECK_OUT' ? 'Check Out' : item.actionType === 'UPDATE_LOCATION' ? 'Location Update' : 'Unknown'}
                                    </Tag>
                                    <span className="timeline-time">
                                        <ClockCircleOutlined /> {dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                        ({dayjs(item.created_at).fromNow()})
                                    </span>
                                </div>

                                <div className="timeline-item-content">
                                    <p>
                                        <UserOutlined /> <strong>{item.user.name}</strong> ({item.user.email})
                                    </p>
                                    <p>
                                        <EnvironmentOutlined /> {item.locationStaticName}
                                        {item.locationStaticAddress && ` - ${item.locationStaticAddress}`}
                                    </p>
                                    <p>
                                        <GlobalOutlined /> {item.browser} on {item.os} ({item.device})
                                    </p>
                                </div>
                            </div>
                        ),
                    }))}
                />
            ) : (
                <Alert message="No timeline data available" type="info" showIcon />
            )}
        </Card>
    );
};

export default DashboardTimeline; 