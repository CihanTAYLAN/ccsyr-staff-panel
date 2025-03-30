'use client';

import { useState } from 'react';
import { Card, Table, Input, DatePicker, Space, Select, Tag } from 'antd';
import { SearchOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { EActionType } from '@prisma/client';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

type LogData = {
    id: string;
    userId: string;
    userName: string;
    locationId: string;
    locationName: string;
    actionType: EActionType;
    timestamp: Date;
    userAgent: string | null;
    ipAddress: string | null;
};

// Demo data - gerçek uygulamada API'den gelecek
const mockLogs: LogData[] = [
    {
        id: '1',
        userId: '1',
        userName: 'Admin User',
        locationId: '1',
        locationName: 'Main Office',
        actionType: EActionType.CHECK_IN,
        timestamp: new Date(2023, 3, 15, 9, 0, 0),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '192.168.1.1',
    },
    {
        id: '2',
        userId: '1',
        userName: 'Admin User',
        locationId: '1',
        locationName: 'Main Office',
        actionType: EActionType.CHECK_OUT,
        timestamp: new Date(2023, 3, 15, 17, 30, 0),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '192.168.1.1',
    },
    {
        id: '3',
        userId: '2',
        userName: 'Manager User',
        locationId: '2',
        locationName: 'Warehouse',
        actionType: EActionType.CHECK_IN,
        timestamp: new Date(2023, 3, 15, 8, 45, 0),
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X)',
        ipAddress: '192.168.1.2',
    },
    {
        id: '4',
        userId: '2',
        userName: 'Manager User',
        locationId: '2',
        locationName: 'Warehouse',
        actionType: EActionType.CHECK_OUT,
        timestamp: new Date(2023, 3, 15, 16, 50, 0),
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X)',
        ipAddress: '192.168.1.2',
    },
    {
        id: '5',
        userId: '3',
        userName: 'Staff Member',
        locationId: '3',
        locationName: 'Branch Office',
        actionType: EActionType.CHECK_IN,
        timestamp: new Date(2023, 3, 15, 9, 15, 0),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ipAddress: '192.168.1.3',
    },
];

export default function AccessLogsPage() {
    const [logs, setLogs] = useState<LogData[]>(mockLogs);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [actionTypeFilter, setActionTypeFilter] = useState<EActionType | 'ALL'>('ALL');

    const columns = [
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Location',
            dataIndex: 'locationName',
            key: 'locationName',
        },
        {
            title: 'Action',
            dataIndex: 'actionType',
            key: 'actionType',
            render: (actionType: EActionType) => (
                <Tag
                    icon={actionType === EActionType.CHECK_IN ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={actionType === EActionType.CHECK_IN ? 'success' : 'error'}
                >
                    {actionType.replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp: Date) => (
                <Space>
                    <ClockCircleOutlined />
                    {timestamp.toLocaleString()}
                </Space>
            ),
            sorter: (a: LogData, b: LogData) => a.timestamp.getTime() - b.timestamp.getTime(),
            defaultSortOrder: 'descend' as 'descend',
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            render: (text: string | null) => text || 'N/A',
        },
    ];

    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
    };

    const handleActionTypeChange = (value: EActionType | 'ALL') => {
        setActionTypeFilter(value);
    };

    // Filtre işlemleri
    const getFilteredLogs = () => {
        let filtered = [...logs];

        // Metin araması
        if (searchText) {
            filtered = filtered.filter(log =>
                log.userName.toLowerCase().includes(searchText.toLowerCase()) ||
                log.locationName.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Tarih aralığı
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].startOf('day');
            const endDate = dateRange[1].endOf('day');

            filtered = filtered.filter(log => {
                const logDate = dayjs(log.timestamp);
                return logDate.isAfter(startDate) && logDate.isBefore(endDate);
            });
        }

        // İşlem tipi
        if (actionTypeFilter !== 'ALL') {
            filtered = filtered.filter(log => log.actionType === actionTypeFilter);
        }

        return filtered;
    };

    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Access Logs</h1>

            <Card>
                <div className="mb-4 flex flex-wrap gap-4">
                    <Input
                        placeholder="Search user or location"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />

                    <RangePicker onChange={handleDateRangeChange} />

                    <Select
                        defaultValue="ALL"
                        style={{ width: 150 }}
                        onChange={handleActionTypeChange}
                    >
                        <Option value="ALL">All Actions</Option>
                        <Option value={EActionType.CHECK_IN}>Check In</Option>
                        <Option value={EActionType.CHECK_OUT}>Check Out</Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={getFilteredLogs()}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </>
    );
} 