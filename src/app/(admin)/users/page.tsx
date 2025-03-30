'use client';

import { useState } from 'react';
import { Button, Card, Table, Tag, Input, Space } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { EUserStatus, EUserType } from '@prisma/client';

type UserData = {
    id: string;
    name: string | null;
    email: string;
    userType: EUserType;
    status: EUserStatus;
};

// Demo data - gerçek uygulamada API'den gelecek
const mockUsers: UserData[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        userType: EUserType.SUPER_ADMIN,
        status: EUserStatus.ONLINE,
    },
    {
        id: '2',
        name: 'Manager User',
        email: 'manager@example.com',
        userType: EUserType.MANAGER_ADMIN,
        status: EUserStatus.OFFLINE,
    },
    {
        id: '3',
        name: 'Staff Member',
        email: 'staff@example.com',
        userType: EUserType.PERSONAL,
        status: EUserStatus.OFFLINE,
    },
];

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>(mockUsers);
    const [searchText, setSearchText] = useState('');

    const getUserTypeColor = (type: EUserType) => {
        switch (type) {
            case EUserType.SUPER_ADMIN:
                return 'red';
            case EUserType.MANAGER_ADMIN:
                return 'blue';
            case EUserType.PERSONAL:
                return 'green';
            default:
                return 'default';
        }
    };

    const getUserStatusColor = (status: EUserStatus) => {
        return status === EUserStatus.ONLINE ? 'success' : 'default';
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string | null) => text || 'N/A',
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
            render: (type: EUserType) => (
                <Tag color={getUserTypeColor(type)}>
                    {type.replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: EUserStatus) => (
                <Tag color={getUserStatusColor(status)}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: UserData) => (
                <Space size="small">
                    <Button type="link" size="small">
                        Edit
                    </Button>
                    <Button type="link" size="small" danger>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Users</h1>
                <Button type="primary" icon={<UserAddOutlined />}>
                    Add User
                </Button>
            </div>

            <Card>
                <div className="mb-4">
                    <Input
                        placeholder="Search users"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </>
    );
} 