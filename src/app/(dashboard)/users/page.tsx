'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Tag, Modal, Form, message, Tooltip, Breadcrumb, Input, Select, Space, Avatar, Popconfirm, Upload } from 'antd';
import { UserAddOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ImportOutlined, DownloadOutlined } from '@ant-design/icons';
import { EUserStatus, EUserType, EUserAccountStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    DataTable,
    PaginationData,
    FilterState,
    FilterConfig,
    SortingState
} from '@/components/shared/DataTable';
import * as XLSX from 'xlsx';


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

// Kullanıcı hesap durumu bilgileri
const userAccountStatusOptions = [
    { value: EUserAccountStatus.ACTIVE, label: 'Active' },
    { value: EUserAccountStatus.INACTIVE, label: 'Inactive' },
];

type UserData = {
    id: string;
    name: string | null;
    email: string;
    userType: EUserType;
    status: EUserStatus;
    userAccountStatus: EUserAccountStatus;
    forcePasswordChange: boolean;
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
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        userType: '',
        status: '',
        userAccountStatus: '',
    });
    const [sorting, setSorting] = useState<SortingState>({
        sortField: 'created_at',
        sortOrder: 'desc',
    });
    const [addUserModalVisible, setAddUserModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    // Tablo filtre konfigürasyonu
    const tableFilters: Record<string, FilterConfig> = {
        search: {
            type: 'text',
            placeholder: 'Search by name or email',
            filterKey: 'search'
        },
        userType: {
            type: 'select',
            placeholder: 'Filter by user type',
            options: userTypeOptions,
            filterKey: 'userType'
        },
        status: {
            type: 'select',
            placeholder: 'Filter by online status',
            options: userStatusOptions,
            filterKey: 'status'
        },
        userAccountStatus: {
            type: 'select',
            placeholder: 'Filter by account status',
            options: userAccountStatusOptions,
            filterKey: 'userAccountStatus'
        }
    };

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
            if (filters.userAccountStatus) params.append('userAccountStatus', filters.userAccountStatus);

            const response = await fetch(`/api/users?${params.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            message.error(error.message || "Failed to load users");
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
                body: JSON.stringify({
                    ...values,
                    userAccountStatus: EUserAccountStatus.ACTIVE,
                    forcePasswordChange: false
                }),
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
            fetchUsers(); // Listeyi yenile
        } catch (error: any) {
            message.error(error.message || 'Failed to delete user');
            console.error('Error deleting user:', error);
        }
    };

    // Filtreleri sıfırla
    const resetFilters = () => {
        setFilters({
            search: '',
            userType: '',
            status: '',
            userAccountStatus: '',
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

    // Kullanıcı hesap durumu için renk belirle
    const getUserAccountStatusColor = (status: EUserAccountStatus) => {
        return status === EUserAccountStatus.ACTIVE ? 'success' : 'error';
    };

    // Tablo sütunları
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_: string, record: UserData) => {
                return (
                    <Link href={`/users/${record.id}`} className="flex items-center gap-2 text-theme-text">
                        <Avatar size={32} style={{ backgroundColor: 'var(--theme)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}>
                            {record.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        {record.name}
                    </Link>
                );
            },
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
            title: 'Online Status',
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
            title: 'Account Status',
            dataIndex: 'userAccountStatus',
            key: 'userAccountStatus',
            render: (status: EUserAccountStatus) => (
                <Tag color={getUserAccountStatusColor(status)}>
                    {status}
                </Tag>
            ),
            sorter: true,
        },
        {
            title: 'Current Location',
            dataIndex: 'currentLocation.name',
            key: 'currentLocation',
            render: (_: any, record: UserData) => (
                <Tooltip title="Automatically updated based on user check-in/check-out">
                    {record.currentLocation?.name || 'Not assigned'}
                </Tooltip>
            ),
            sorter: true,
        },
        {
            title: 'Access Logs',
            dataIndex: ['_count', 'logs'],
            key: 'logs',
            render: (logs: number) => logs || 0,
            sorter: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: UserData) => (
                <Space>
                    <Tooltip title="View User">
                        <Link href={`/users/${record.id}`}>
                            <Button icon={<EyeOutlined />} size="small" type="text"></Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Edit User">
                        <Link href={`/users/${record.id}/edit`}>
                            <Button icon={<EditOutlined />} size="small" type="text"></Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Delete User">
                        <Popconfirm
                            title="Delete user"
                            description={`Are you sure you want to delete ${record.name || 'this user'}?`}
                            onConfirm={() => deleteUser(record.id, record.name)}
                            okText="Yes"
                            cancelText="No"
                            placement='left'
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                type="text"
                                danger
                            ></Button>
                        </Popconfirm>

                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Tablo değişikliklerini yönet (sayfalama, sıralama)
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setPagination(prev => ({
            ...prev,
            page: pagination.current,
            pageSize: pagination.pageSize,
        }));

        if (sorter.field && sorter.order) {
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

    // Filtre değişikliklerini yönet
    const handleFiltersChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Excel template indirme fonksiyonu
    const handleDownloadTemplate = () => {
        const template = [
            ['name', 'email', 'password', 'userType'],
            ['John Doe', 'john@example.com', 'password123', 'SUPER_ADMIN'],
            ['Jane Doe', 'jane@example.com', 'password123', 'MANAGER_ADMIN'],
            ['John Smith', 'johnsmith@example.com', 'password123', 'PERSONAL'],
        ];

        const ws = XLSX.utils.aoa_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'user_import_template.xlsx');
    };

    // Excel dosyasını işleme fonksiyonu
    const handleImportExcel = async (file: File) => {
        setImportLoading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Veri doğrulama
            const errors = [];
            const validUsers = [];

            for (const row of jsonData) {
                const user = row as any;
                if (!user.name || !user.email || !user.password || !user.userType) {
                    errors.push(`Missing required fields for user: ${user.email || 'Unknown'}`);
                    continue;
                }

                if (!Object.values(EUserType).includes(user.userType)) {
                    errors.push(`Invalid user type for user: ${user.email} userType must be one of the following: (SUPER_ADMIN, MANAGER_ADMIN, PERSONAL)`);
                    continue;
                }

                validUsers.push(user);
            }

            if (errors.length > 0) {
                throw new Error(`Validation errors:\n${errors.join('\n')}`);
            }

            // Email kontrolü ve bulk insert
            const response = await fetch('/api/users/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: validUsers }),
            }).catch(err => {
                console.log(err.response.json());

                throw new Error(err.message);
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            message.success('Users imported successfully');
            setImportModalVisible(false);
            fetchUsers();
        } catch (error: any) {
            message.error(error.message || 'Failed to import users');
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6 h-6">
                <Breadcrumb
                    items={[
                        { title: <Link href="/dashboard">Dashboard</Link> },
                        { title: 'Users' },
                    ]}
                />
                <Space>
                    <Button
                        icon={<ImportOutlined />}
                        onClick={() => setImportModalVisible(true)}
                    >
                        Import from Excel
                    </Button>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => setAddUserModalVisible(true)}
                    >
                        Add User
                    </Button>
                </Space>
            </div>

            <Card title="Users" className="shadow-theme border-theme" styles={{ body: { padding: 0 } }}>
                <DataTable
                    dataSource={users}
                    columns={columns}
                    loading={loading}
                    pagination={pagination}
                    filters={tableFilters}
                    filterValues={filters}
                    onFiltersChange={handleFiltersChange}
                    onTableChange={handleTableChange}
                    onResetFilters={resetFilters}
                    onRefresh={fetchUsers}
                />
            </Card>

            <Modal
                title="Add New User"
                open={addUserModalVisible}
                onCancel={() => setAddUserModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddUser}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                        <Input placeholder='Enter name' />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter an email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder='Enter email' />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please enter a password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password placeholder='Enter password' />
                    </Form.Item>

                    <Form.Item
                        name="userType"
                        label="User Type"
                        rules={[{ required: true, message: 'Please select a user type' }]}
                    >
                        <Select options={userTypeOptions} placeholder='Select user type' />
                    </Form.Item>

                    <Form.Item>
                        <div className="flex justify-end space-x-2">
                            <Button onClick={() => setAddUserModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>
                                Create User
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Import Users from Excel"
                open={importModalVisible}
                onCancel={() => setImportModalVisible(false)}
                footer={null}
            >
                <div className="space-y-4">
                    <div>
                        <Button
                            icon={<DownloadOutlined />}
                            type="link"
                            onClick={handleDownloadTemplate}
                        >
                            Download Template
                        </Button>
                    </div>


                    <Upload.Dragger
                        name="file"
                        accept=".xlsx,.xls"
                        showUploadList={false}
                        beforeUpload={(file) => {
                            handleImportExcel(file);
                            return false;
                        }}
                        disabled={importLoading}
                    >
                        <p className="ant-upload-drag-icon">
                            <ImportOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag Excel file to upload</p>
                    </Upload.Dragger>

                    {importLoading && (
                        <div className="text-center mt-4">
                            <div>Processing...</div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}