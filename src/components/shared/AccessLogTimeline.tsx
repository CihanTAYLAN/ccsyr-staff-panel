import React, { useEffect, useState } from 'react';
import { Timeline, Alert, Tag, Select, DatePicker, Button, Space, Card, Skeleton, Pagination, message, Spin, Tooltip } from 'antd';
import {
    LoginOutlined,
    LogoutOutlined,
    UserOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    ClearOutlined,
    LinkOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;

export interface TimelineItem {
    id: string;
    actionType: 'CHECK_IN' | 'CHECK_OUT' | 'UPDATE_LOCATION';
    actionDate: string; // user specific action time
    ipAddress?: string;
    browser?: string;
    os?: string;
    device?: string;
    locationStaticName?: string;
    locationStaticAddress?: string;
    locationStaticLatitude?: number;
    locationStaticLongitude?: number;
    created_at?: string; // log recored time
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface TimelineFilter {
    dateRange?: [string, string];
    locationId?: string;
    userId?: string;
    limit: number;
    page: number;
}

interface AccessLogTimelineProps {
    items: TimelineItem[];
    loading?: boolean;
    total: number;
    filter: TimelineFilter;
    locations?: Array<{ id: string; name: string }>;
    users?: Array<{ id: string; name: string }>;
    locationFilter?: boolean;
    userFilter?: boolean;
    onFilterChange: (filter: TimelineFilter) => void;
}

interface LocationOption {
    id: string;
    name: string;
}

interface UserOption {
    id: string;
    name: string;
    email: string;
}

export const getItemColor = (actionType: string) => {
    switch (actionType) {
        case 'CHECK_IN': return 'green';
        case 'CHECK_OUT': return 'red';
        case 'UPDATE_LOCATION': return 'orange';
        default: return 'default';
    }
};

export const getItemIcon = (actionType: string) => {
    switch (actionType) {
        case 'CHECK_IN': return <LoginOutlined />;
        case 'CHECK_OUT': return <LogoutOutlined />;
        case 'UPDATE_LOCATION': return <EnvironmentOutlined />;
        default: return null;
    }
};

const AccessLogTimeline: React.FC<Omit<AccessLogTimelineProps, 'locations' | 'users'>> = ({
    items = [],
    loading = false,
    total,
    filter,
    locationFilter = true,
    userFilter = true,
    onFilterChange
}) => {
    const [locations, setLocations] = useState<LocationOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');


    // Lokasyonları yükle
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoadingLocations(true);
                const params = new URLSearchParams();
                if (locationSearch) {
                    params.append('search', locationSearch);
                }
                const response = await fetch(`/api/locations/search?${params}`);
                if (!response.ok) throw new Error('Failed to fetch locations');
                const data = await response.json();
                setLocations(data.locations);
            } catch (error) {
                console.error('Error fetching locations:', error);
                message.error('Failed to load locations');
            } finally {
                setLoadingLocations(false);
            }
        };

        const debounce = setTimeout(fetchLocations, 300);
        return () => clearTimeout(debounce);
    }, [locationSearch]);

    // Kullanıcıları yükle
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);
                const params = new URLSearchParams();
                if (userSearch) {
                    params.append('search', userSearch);
                }
                const response = await fetch(`/api/users/search?${params}`);
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
                setUsers(data.users);
            } catch (error) {
                console.error('Error fetching users:', error);
                message.error('Failed to load users');
            } finally {
                setLoadingUsers(false);
            }
        };

        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [userSearch]);

    const handleFilterChange = (changes: Partial<TimelineFilter>) => {
        onFilterChange({ ...filter, ...changes });
    };

    const handleClearFilters = () => {
        onFilterChange({
            dateRange: undefined,
            locationId: undefined,
            userId: undefined,
            limit: 5,
            page: 1
        });
        setLocationSearch('');
        setUserSearch('');
    };

    if (loading) {
        return (
            <Card>
                <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
        );
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space wrap>
                {locationFilter && (
                    <Select
                        showSearch
                        placeholder="Search location"
                        style={{ width: 200 }}
                        allowClear
                        value={filter.locationId}
                        onChange={(value) => handleFilterChange({ locationId: value })}
                        onSearch={setLocationSearch}
                        loading={loadingLocations}
                        filterOption={false}
                        notFoundContent={loadingLocations ? <Spin size="small" /> : null}
                    >
                        {locations.map((location) => (
                            <Select.Option key={location.id} value={location.id}>{location.name}</Select.Option>
                        ))}
                    </Select>
                )}
                {userFilter && (
                    <Select
                        showSearch
                        placeholder="Search user"
                        style={{ width: 200 }}
                        allowClear
                        value={filter.userId}
                        onChange={(value) => handleFilterChange({ userId: value })}
                        onSearch={setUserSearch}
                        loading={loadingUsers}
                        filterOption={false}
                        notFoundContent={loadingUsers ? <Spin size="small" /> : null}
                    >
                        {users.map((user) => (
                            <Select.Option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                            </Select.Option>
                        ))}
                    </Select>
                )}

                <RangePicker
                    onChange={(_, dateStrings) => handleFilterChange({
                        dateRange: dateStrings as [string, string]
                    })}
                    showTime
                    value={filter.dateRange ? [dayjs(filter.dateRange[0]), dayjs(filter.dateRange[1])] : undefined}
                />

                <Select
                    value={filter.limit}
                    onChange={(value) => handleFilterChange({ limit: value, page: 1 })}
                    style={{ width: 120 }}
                >
                    <Select.Option value={5}>5 / page</Select.Option>
                    <Select.Option value={10}>10 / page</Select.Option>
                    <Select.Option value={20}>20 / page</Select.Option>
                    <Select.Option value={50}>50 / page</Select.Option>
                </Select>

                <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                    Clear Filters
                </Button>
            </Space>

            {items?.length > 0 ? (
                <>
                    <Timeline
                        mode="left"
                        items={items.map((item) => ({
                            color: getItemColor(item.actionType),
                            dot: getItemIcon(item.actionType),
                            children: (
                                <div className='flex flex-col gap-2'>
                                    <div>
                                        <div className='flex flex-row justify-between items-center gap-2 w-full'>
                                            <div>
                                                <Tag color={getItemColor(item.actionType)}>
                                                    {item.actionType === 'CHECK_IN' ? 'Check In' :
                                                        item.actionType === 'CHECK_OUT' ? 'Check Out' :
                                                            'Location Update'}
                                                </Tag>
                                            </div>
                                            <div className='flex flex-row gap-2'>
                                                <div>
                                                    <Tooltip title={'Go to log'}>
                                                        <Link href={`/access-logs/${item.id}`}>
                                                            <LinkOutlined />
                                                        </Link>
                                                    </Tooltip>
                                                </div>
                                                <div>
                                                    <Tooltip title={dayjs(item.actionDate).fromNow()}>
                                                        {dayjs(item.actionDate).format('YYYY-MM-DD HH:mm:ss')}
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-0'>
                                        {item.user && (
                                            <div>
                                                <UserOutlined /> <strong>{item.user.name}</strong> ({item.user.email})
                                            </div>
                                        )}
                                        {item.locationStaticName && (
                                            <div>
                                                <EnvironmentOutlined /> {item.locationStaticName}
                                                {item.locationStaticAddress && ` - ${item.locationStaticAddress}`}
                                            </div>
                                        )}
                                        {(item.browser || item.os || item.device) && (
                                            <div>
                                                <GlobalOutlined /> {item.browser} on {item.os} ({item.device})
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ),
                        }))}
                    />
                    <Pagination
                        align='center'
                        current={filter.page}
                        pageSize={filter.limit}
                        total={total}
                        onChange={(page) => handleFilterChange({ page })}
                        showSizeChanger={false}
                    />
                </>
            ) : (
                <Alert message="No timeline data available" type="info" showIcon />
            )}
        </Space>
    );
};

export default AccessLogTimeline; 