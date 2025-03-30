'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Input, Space, Select, Modal, Form, message, Tooltip, Breadcrumb } from 'antd';
import { SearchOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { EUserStatus, EUserType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { confirm } = Modal;

// Kullanıcı tipi bilgileri
const userTypeOptions = [
    { value: EUserType.SUPER_ADMIN, label: 'Super Admin' },
    { value: EUserType.MANAGER_ADMIN, label: 'Manager Admin' },
    { value: EUserType.PERSONAL, label: 'Personal' },
];

// Kullanıcı durumu bilgileri
const userStatusOptions = [
    { value: EUserStatus.ONLINE, label: 'Online' },
    { value: EUserStatus.OFFLINE, label: 'Offline' },
];

type UserData = {
    id: string;
    name: string | null;
    email: string;
    userType: EUserType;
    status: EUserStatus;
    created_at: string;
    updated_at: string;
    currentLocation?: {
        id: string;
        name: string;
    } | null;
    _count: {
        logs: number;
    };
};

type PaginationData = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
    });
    const [filters, setFilters] = useState({
        search: '',
        userType: '',
        status: '',
    });
    const [sorting, setSorting] = useState({
        sortField: 'created_at',
        sortOrder: 'desc',
    });
    const [addUserModalVisible, setAddUserModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);

    // Kullanıcıları getir
    const fetchUsers = async () => {
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
            if (filters.userType) params.append('userType', filters.userType);
            if (filters.status) params.append('status', filters.status);

            const response = await fetch(`/api/users?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Kullanıcı ekleme
    const handleAddUser = async (values: any) => {
        setSubmitLoading(true);
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user');
            }

            message.success('User created successfully');
            form.resetFields();
            setAddUserModalVisible(false);
            fetchUsers(); // Listeyi yenile
        } catch (error: any) {
            message.error(error.message || 'Failed to create user');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Kullanıcı silme
    const confirmDeleteUser = (userId: string, userName: string | null) => {
        confirm({
            title: `Are you sure you want to delete ${userName || 'this user'}?`,
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                try {
                    const response = await fetch(`/api/users/${userId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete user');
                    }

                    message.success('User deleted successfully');
                    fetchUsers(); // Listeyi yenile
                } catch (error) {
                    message.error('Failed to delete user');
                    console.error('Error deleting user:', error);
                }
            },
        });
    };

    // Filtreleri sıfırla
    const resetFilters = () => {
        setFilters({
            search: '',
            userType: '',
            status: '',
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Sayfa değişikliğinde veya ilk yüklemede kullanıcıları getir
    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.pageSize, filters, sorting]);

    // Kullanıcı tipi için renk belirle
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

    // Kullanıcı durumu için renk belirle
    const getUserStatusColor = (status: EUserStatus) => {
        return status === EUserStatus.ONLINE ? 'success' : 'default';
    };

    // Tablo sütunları
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string | null) => text || 'N/A',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
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
            sorter: true,
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
            sorter: true,
        },
        {
            title: 'Current Location',
            dataIndex: 'currentLocation.name',
            key: 'currentLocation',
            render: (location: string | null) => (
                <Tooltip title="Automatically updated based on user check-in/check-out">
                    {location ? location : 'Not assigned'}
                </Tooltip>
            ),
            sorter: true,
        },
        {
            title: 'Access Logs',
            dataIndex: '_count',
            key: 'logs',
            render: (count: { logs: number }) => count.logs,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: UserData) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Link href={`/users/${record.id}`}>
                            <Button type="text" icon={<EyeOutlined />} />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Edit User">
                        <Link href={`/users/${record.id}/edit`}>
                            <Button type="text" icon={<EditOutlined />} />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Delete User">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => confirmDeleteUser(record.id, record.name)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Sıralama değiştiğinde yapılacak işlem
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        if (sorter && sorter.field) {
            setSorting({
                sortField: sorter.field,
                sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
            });
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6 h-16">
                <Breadcrumb
                    items={[
                        { title: 'Dashboard', href: '/' },
                        { title: 'Users' },
                    ]}
                />
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setAddUserModalVisible(true)}
                >
                    Add User
                </Button>
            </div>

            <Card styles={{ body: { padding: 0, overflowX: 'auto' } }}>
                <div className="p-6 pb-0">
                    <div className="mb-6 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search by name or email"
                            prefix={<SearchOutlined />}
                            value={filters.search || undefined}
                            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            style={{ width: 250 }}
                            allowClear
                        />

                        <Select
                            placeholder="Filter by user type"
                            style={{ width: 200 }}
                            value={filters.userType || undefined}
                            onChange={value => setFilters(prev => ({ ...prev, userType: value }))}
                            options={userTypeOptions}
                            allowClear
                        />

                        <Select
                            placeholder="Filter by status"
                            style={{ width: 150 }}
                            value={filters.status || undefined}
                            onChange={value => setFilters(prev => ({ ...prev, status: value }))}
                            options={userStatusOptions}
                            allowClear
                        />

                        <Button onClick={resetFilters}>Reset Filters</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        loading={loading}
                        scroll={{ x: 800 }}
                        onChange={handleTableChange}
                        pagination={{
                            current: pagination.page,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} users`,
                            onChange: (page, pageSize) => {
                                setPagination(prev => ({ ...prev, page, pageSize }));
                            },
                        }}
                    />
                </div>
            </Card>

            {/* Kullanıcı Ekleme Modalı */}
            <Modal
                title="Add New User"
                open={addUserModalVisible}
                onCancel={() => setAddUserModalVisible(false)}
                footer={false}
            >
                <p className='text-theme-text-secondary text-sm'>Please fill in the form below to add a new user.</p>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddUser}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please enter password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password placeholder="Enter password" />
                    </Form.Item>

                    <Form.Item
                        name="userType"
                        label="User Type"
                        rules={[{ required: true, message: 'Please select user type' }]}
                    >
                        <Select options={userTypeOptions} placeholder="Select user type" />
                    </Form.Item>

                    <Form.Item className="mb-0 text-right">
                        <Space>
                            <Button onClick={() => setAddUserModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>
                                Add User
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}