'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Modal, Form, message, Tooltip, Breadcrumb, Input, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    DataTable,
    PaginationData,
    FilterState,
    FilterConfig,
    SortingState
} from '@/components/shared/DataTable';

const { confirm } = Modal;

type LocationData = {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    updated_at: string;
    _count: {
        activeUsers: number;
        logs: number;
    };
};

export default function LocationsPage() {
    const router = useRouter();
    const [locations, setLocations] = useState<LocationData[]>([]);
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
    });
    const [sorting, setSorting] = useState<SortingState>({
        sortField: 'name',
        sortOrder: 'asc',
    });
    const [addLocationModalVisible, setAddLocationModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);

    // Tablo filtre konfigürasyonu
    const tableFilters: Record<string, FilterConfig> = {
        search: {
            type: 'text',
            placeholder: 'Search by name, description or address',
            filterKey: 'search'
        }
    };

    // Lokasyonları getir
    const fetchLocations = async () => {
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

            const response = await fetch(`/api/locations?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }

            const data = await response.json();
            setLocations(data.locations);
            setPagination(data.pagination || pagination);
        } catch (error) {
            console.error('Error fetching locations:', error);
            message.error('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    // Lokasyon ekleme
    const handleAddLocation = async (values: any) => {
        setSubmitLoading(true);
        try {
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create location');
            }

            message.success('Location created successfully');
            form.resetFields();
            setAddLocationModalVisible(false);
            fetchLocations(); // Listeyi yenile
        } catch (error: any) {
            message.error(error.message || 'Failed to create location');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Lokasyon silme
    const confirmDeleteLocation = (locationId: string, locationName: string) => {
        confirm({
            title: `Are you sure you want to delete ${locationName}?`,
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            cancelText: 'No',
            okType: 'danger',
            async onOk() {
                try {
                    const response = await fetch(`/api/locations/${locationId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete location');
                    }

                    message.success('Location deleted successfully');
                    fetchLocations(); // Listeyi yenile
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete location');
                    console.error('Error deleting location:', error);
                }
            },
        });
    };

    // Filtreleri sıfırla
    const resetFilters = () => {
        setFilters({
            search: '',
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Sayfa değişikliğinde veya ilk yüklemede lokasyonları getir
    useEffect(() => {
        fetchLocations();
    }, [pagination.page, pagination.pageSize, filters, sorting]);

    // Tablo sütunları
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_: string, record: LocationData) => {
                return (
                    <Link href={`/locations/${record.id}`} className="flex items-center gap-2 text-theme-text">
                        <EnvironmentOutlined />
                        {record.name}
                    </Link>
                );
            },
            sorter: true,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text: string | null) => text || 'N/A',
            sorter: true,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: (text: string | null) => text || 'N/A',
            sorter: true,
        },
        {
            title: 'Coordinates',
            key: 'coordinates',
            render: (_: any, record: LocationData) => (
                record.latitude && record.longitude ?
                    `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}` :
                    'N/A'
            ),
        },
        {
            title: 'Active Users',
            dataIndex: '_count',
            key: 'activeUsers',
            render: (count: any) => count.activeUsers || 0,
            sorter: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: LocationData) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Link href={`/locations/${record.id}`}>
                            <Button type="text" icon={<EyeOutlined />} />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Link href={`/locations/${record.id}/edit`}>
                            <Button type="text" icon={<EditOutlined />} />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => confirmDeleteLocation(record.id, record.name)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Tablo değişikliklerini yönet
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        // Sayfalama değişikliği
        if (pagination) {
            setPagination(prev => ({
                ...prev,
                page: pagination.current || 1,
                pageSize: pagination.pageSize || 10,
            }));
        }

        // Sıralama değişikliği
        if (sorter && sorter.field) {
            setSorting({
                sortField: sorter.field,
                sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
            });
        }
    };

    // Filtre değişikliklerini yönet
    const handleFiltersChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 })); // Sayfa numarasını sıfırla
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <Breadcrumb
                    items={[
                        { title: <Link href="/dashboard">Dashboard</Link> },
                        { title: 'Locations' },
                    ]}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAddLocationModalVisible(true)}
                >
                    Add Location
                </Button>
            </div>

            <Card title="Locations" className="shadow-theme border-theme" styles={{ body: { padding: 0 } }}>
                <DataTable
                    columns={columns}
                    dataSource={locations}
                    loading={loading}
                    pagination={pagination}
                    filters={tableFilters}
                    filterValues={filters}
                    onTableChange={handleTableChange}
                    onFiltersChange={handleFiltersChange}
                    onResetFilters={resetFilters}
                    onRefresh={fetchLocations}
                />
            </Card>

            {/* Lokasyon Ekleme Modal */}
            <Modal
                title="Add New Location"
                open={addLocationModalVisible}
                onCancel={() => setAddLocationModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddLocation}
                >
                    <Form.Item
                        name="name"
                        label="Location Name"
                        rules={[{ required: true, message: 'Please enter location name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <div className="flex gap-4">
                        <Form.Item
                            name="latitude"
                            label="Latitude"
                            className="w-1/2"
                        >
                            <Input type="number" step="0.0001" />
                        </Form.Item>
                        <Form.Item
                            name="longitude"
                            label="Longitude"
                            className="w-1/2"
                        >
                            <Input type="number" step="0.0001" />
                        </Form.Item>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setAddLocationModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitLoading}>
                            Create Location
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
} 