'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Space, Select, Tag, Button, Breadcrumb, Tooltip, DatePicker, message, Avatar, Input } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, CalendarOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { EActionType, EUserStatus } from '@prisma/client';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Access log verileri için tip tanımlaması
type AccessLogData = {
    id: string;
    actionType: EActionType;
    actionDate: string;
    ipAddress: string | null;
    userAgent: string | null;
    browser: string | null;
    os: string | null;
    device: string | null;
    locationStaticName: string | null;
    locationStaticAddress: string | null;
    locationStaticLat: number | null;
    locationStaticLong: number | null;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        status: EUserStatus;
    };
    location: {
        id: string;
        name: string;
        address: string | null;
    };
};

// Action tipi seçenekleri
const actionTypeOptions = [
    { value: EActionType.CHECK_IN, label: 'Check In' },
    { value: EActionType.CHECK_OUT, label: 'Check Out' },
];

// Pagination veri tipi
type PaginationData = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

// Filtre durumu tipi
type FilterState = {
    search: string;
    actionType: string;
    dateFrom: string;
    dateTo: string;
};

// Sıralama durumu tipi
type SortingState = {
    sortField: string;
    sortOrder: 'asc' | 'desc';
};

export default function AccessLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AccessLogData[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
    });
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        actionType: '',
        dateFrom: '',
        dateTo: '',
    });
    const [sorting, setSorting] = useState<SortingState>({
        sortField: 'created_at',
        sortOrder: 'desc',
    });
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

    // Access logları getir
    const fetchAccessLogs = async () => {
        setLoading(true);
        try {
            // API parametrelerini oluştur
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                pageSize: pagination.pageSize.toString(),
                sortField: sorting.sortField,
                sortOrder: sorting.sortOrder,
            });

            if (filters.search) params.append('search', filters.search);
            if (filters.actionType) params.append('actionType', filters.actionType);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);

            const response = await fetch(`/api/access-logs?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch access logs');
            }

            const data = await response.json();
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching access logs:', error);
            message.error('Failed to load access logs');
        } finally {
            setLoading(false);
        }
    };

    // İlk yüklemede ve filtrelerde değişiklik olduğunda logları getir
    useEffect(() => {
        fetchAccessLogs();
    }, [pagination.page, pagination.pageSize, sorting, filters]);

    // Filtreleri sıfırla
    const resetFilters = () => {
        setFilters({
            search: '',
            actionType: '',
            dateFrom: '',
            dateTo: '',
        });
        setDateRange(null);
    };

    // Action tipi için renk ve ikon belirleme
    const getActionTypeDisplay = (actionType: EActionType) => {
        switch (actionType) {
            case EActionType.CHECK_IN:
                return {
                    color: 'success',
                    icon: <CheckCircleOutlined />,
                    text: 'Check In'
                };
            case EActionType.CHECK_OUT:
                return {
                    color: 'error',
                    icon: <CloseCircleOutlined />,
                    text: 'Check Out'
                };
            default:
                return {
                    color: 'default',
                    icon: null,
                    text: String(actionType).replace('_', ' ')
                };
        }
    };

    // Arama değişikliklerini işle
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    // Tarih aralığı değişikliklerini işle
    const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        setDateRange(dates);
        if (dates && dates[0] && dates[1]) {
            setFilters(prev => ({
                ...prev,
                dateFrom: dates[0]?.format('YYYY-MM-DD') || '',
                dateTo: dates[1]?.format('YYYY-MM-DD') || '',
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                dateFrom: '',
                dateTo: '',
            }));
        }
    };

    // Action tipi değişikliklerini işle
    const handleActionTypeChange = (value: string) => {
        setFilters(prev => ({ ...prev, actionType: value }));
    };

    // Tablo sütunları
    const columns = [
        {
            title: 'User',
            dataIndex: ['user', 'name'],
            key: 'user.name',
            render: (_: any, record: AccessLogData) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} className="bg-primary">
                        {record.user.name ? record.user.name.substring(0, 1).toUpperCase() : 'U'}
                    </Avatar>
                    <Link href={`/users/${record.user.id}`} className="text-primary hover:text-primary-dark">
                        {record.user.name || record.user.email}
                    </Link>
                </Space>
            ),
            sorter: true,
        },
        {
            title: 'Location',
            dataIndex: ['location', 'name'],
            key: 'location.name',
            render: (_: any, record: AccessLogData) => (
                <Space>
                    <EnvironmentOutlined />
                    <Link href={`/locations/${record.location.id}`} className="text-primary hover:text-primary-dark">
                        {record.location.name}
                    </Link>
                </Space>
            ),
            sorter: true,
        },
        {
            title: 'Action',
            dataIndex: 'actionType',
            key: 'actionType',
            render: (actionType: EActionType) => {
                const { color, icon, text } = getActionTypeDisplay(actionType);
                return (
                    <Tag icon={icon} color={color as any}>
                        {text}
                    </Tag>
                );
            },
            sorter: true,
            filters: actionTypeOptions.map(option => ({
                text: option.label,
                value: option.value
            })),
            onFilter: (value: any, record: AccessLogData) => record.actionType === value,
        },
        {
            title: 'Date / Time',
            dataIndex: 'actionDate',
            key: 'actionDate',
            render: (date: string) => (
                <Space>
                    <CalendarOutlined />
                    {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
                </Space>
            ),
            sorter: true,
        },
        {
            title: 'Browser / Device',
            key: 'deviceInfo',
            render: (record: AccessLogData) => (
                <Space direction="vertical" size="small">
                    <div>{record.browser || 'Unknown'}</div>
                    <div className="text-xs text-theme-text-secondary">{record.device || 'Unknown'}</div>
                </Space>
            )
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            render: (ipAddress: string | null) => ipAddress || 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: AccessLogData) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => router.push(`/access-logs/${record.id}`)}
                            className="text-theme-text hover:text-primary"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Tablo değişikliklerini yakala (sayfalama, sıralama)
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        // Sayfalama
        setPagination(prev => ({
            ...prev,
            page: pagination.current || 1,
            pageSize: pagination.pageSize || 10,
        }));

        // Sıralama
        if (sorter && sorter.field) {
            setSorting({
                sortField: sorter.field,
                sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
            });
        } else {
            setSorting({
                sortField: 'created_at',
                sortOrder: 'desc',
            });
        }
    };

    return (
        <div className="access-logs-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Breadcrumb items={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Access Logs' },
                    ]} className="mb-2" />
                    <h1 className="text-2xl font-semibold">Access Logs</h1>
                </div>
            </div>

            <Card>
                <div className="mb-4 flex flex-wrap gap-4">
                    <Input
                        placeholder="Search user or location"
                        prefix={<SearchOutlined />}
                        value={filters.search}
                        onChange={handleSearchChange}
                        style={{ width: 250 }}
                    />

                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                    />

                    <Select
                        value={filters.actionType || 'ALL'}
                        style={{ width: 150 }}
                        onChange={handleActionTypeChange}
                    >
                        <Option value="">All Actions</Option>
                        {actionTypeOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>

                    <Button onClick={resetFilters}>
                        Reset Filters
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={logs}
                    loading={loading}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                    rowKey="id"
                />
            </Card>
        </div>
    );
} 