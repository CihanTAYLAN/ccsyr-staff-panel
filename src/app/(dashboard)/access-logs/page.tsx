'use client';

import { useState, useEffect } from 'react';
import { Card, Space, Tag, Button, Breadcrumb, Tooltip, DatePicker, message, Avatar } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { EActionType, EUserStatus } from '@prisma/client';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    DataTable,
    PaginationData,
    FilterState,
    FilterConfig,
    SortingState
} from '@/components/shared/DataTable';

const { RangePicker } = DatePicker;

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

// Access Log filtreleri için alanlar
const actionTypeOptions = [
    { value: 'ALL', label: 'All Actions' },
    { value: 'CHECK_IN', label: 'Check In' },
    { value: 'CHECK_OUT', label: 'Check Out' },
    { value: 'UPDATE_LOCATION', label: 'Location Update' },
];

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

    // Tablo filtre konfigürasyonu
    const tableFilters: Record<string, FilterConfig> = {
        search: {
            type: 'text',
            placeholder: 'Search by user or location',
            filterKey: 'search'
        },
        actionType: {
            type: 'select',
            placeholder: 'Filter by action type',
            options: actionTypeOptions,
            filterKey: 'actionType'
        }
    };

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
        setPagination(prev => ({ ...prev, page: 1 }));
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
            case EActionType.UPDATE_LOCATION:
                return {
                    color: 'warning',
                    icon: <EnvironmentOutlined />,
                    text: 'Location Update'
                };
            default:
                return {
                    color: 'default',
                    icon: null,
                    text: String(actionType).replace('_', ' ')
                };
        }
    };

    // Filtre değişikliklerini yönet
    const handleFiltersChange = (newFilters: FilterState) => {
        const updatedFilters = { ...newFilters };

        // Tarih aralığı değerlerini koru
        if (filters.dateFrom) updatedFilters.dateFrom = filters.dateFrom;
        if (filters.dateTo) updatedFilters.dateTo = filters.dateTo;

        setFilters(updatedFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
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

    // Tablo sütunları
    const columns = [
        {
            title: 'User',
            dataIndex: ['user', 'name'],
            key: 'user.name',
            render: (_: any, record: AccessLogData) => (
                <Space>
                    <Avatar size={32} style={{ backgroundColor: 'var(--theme)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}>
                        {record.user.name?.charAt(0).toUpperCase()}
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
                        <Link href={`/access-logs/${record.id}`}>
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                className="text-theme-text hover:text-primary"
                            />
                        </Link>
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
        <>
            <div className="flex justify-between items-center mb-6 h-6">
                <Breadcrumb items={[
                    { title: <Link href="/dashboard">Dashboard</Link> },
                    { title: 'Access Logs' },
                ]} />
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchAccessLogs}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            <Card title="Access Logs" className="shadow-theme border-theme" styles={{ body: { padding: 0 } }}>
                <DataTable
                    dataSource={logs}
                    columns={columns}
                    loading={loading}
                    pagination={pagination}
                    filters={tableFilters}
                    filterValues={filters}
                    onFiltersChange={handleFiltersChange}
                    onTableChange={handleTableChange}
                    onResetFilters={resetFilters}
                    onRefresh={fetchAccessLogs}
                />
            </Card>
        </>
    );
} 