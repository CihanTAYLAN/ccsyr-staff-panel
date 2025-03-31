'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Modal, Form, message, Tooltip, Breadcrumb, Input, Space, Tabs, Checkbox } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    DataTable,
    PaginationData,
    FilterState,
    FilterConfig,
    SortingState
} from '@/components/shared/DataTable';

const { confirm } = Modal;
const { TabPane } = Tabs;

// dynamic import for MapWithNoSSR
const MapWithNoSSR = dynamic(
    () => import('@/components/Map'),
    {
        ssr: false,
        loading: () => (
            <div
                className="h-[300px] w-full bg-theme-background-light flex items-center justify-center"
                style={{
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '8px'
                }}
            >
                Loading map...
            </div>
        )
    }
);

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
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
    const [useManualAddress, setUseManualAddress] = useState(false);

    // Toronto koordinatları (varsayılan konum)
    const defaultPosition: [number, number] = [43.7181228, -79.5428638];

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
            // Koordinatları markerPosition'dan al veya manuel giriş değerlerini kullan
            const payload = {
                ...values,
                latitude: markerPosition ? markerPosition[0] : values.latitude ? parseFloat(values.latitude) : null,
                longitude: markerPosition ? markerPosition[1] : values.longitude ? parseFloat(values.longitude) : null,
            };

            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create location');
            }

            message.success('Location created successfully');
            resetForm();
            setAddLocationModalVisible(false);
            fetchLocations(); // Listeyi yenile
        } catch (error: any) {
            message.error(error.message || 'Failed to create location');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Form ve ilişkili durumları sıfırla
    const resetForm = () => {
        form.resetFields();
        setMarkerPosition(null);
        setUseManualAddress(false);
    };

    // Harita tıklama olayı
    const handleMapClick = (lat: number, lng: number) => {
        setMarkerPosition([lat, lng]);

        // Form alanlarını güncelle
        form.setFieldsValue({
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
        });

        // OpenStreetMap Nominatim API'si ile tersine geocoding
        const getReverseGeocode = async (lat: number, lng: number) => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                    {
                        headers: {
                            'Accept-Language': 'en', // Dil tercihini isteğe bağlı olarak değiştirebilirsiniz
                            'User-Agent': 'CCSYR Staff Panel' // Kullanıcı ajanınızı belirtin
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Geocoding request failed');
                }

                const data = await response.json();

                if (data && data.display_name) {
                    // Bulunan adresi forma ekle
                    form.setFieldsValue({
                        address: data.display_name
                    });
                } else {
                    // Geocoding başarısız olduysa koordinatları kullan
                    form.setFieldsValue({
                        address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
                    });
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                // Hata durumunda koordinatları kullan
                form.setFieldsValue({
                    address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
                });
            }
        };

        // Tersine geocoding işlemini başlat
        getReverseGeocode(lat, lng);
    };

    // Modal kapatıldığında formu sıfırla
    const handleModalCancel = () => {
        resetForm();
        setAddLocationModalVisible(false);
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
            dataIndex: 'activeUsers._count',
            key: 'activeUsers',
            render: (count: any, row: LocationData) => row._count.activeUsers || 0,
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
            <div className="flex justify-between items-center mb-6 h-6">
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
                onCancel={handleModalCancel}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddLocation}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
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
                                <Input.TextArea rows={3} />
                            </Form.Item>

                            <Form.Item>
                                <Checkbox
                                    checked={useManualAddress}
                                    onChange={(e) => setUseManualAddress(e.target.checked)}
                                >
                                    Enter address and coordinates manually
                                </Checkbox>
                            </Form.Item>

                            <Form.Item
                                name="address"
                                label="Address"
                            >
                                <Input.TextArea
                                    rows={2}
                                    disabled={!useManualAddress && markerPosition !== null}
                                />
                            </Form.Item>

                            <div className="flex gap-4">
                                <Form.Item
                                    name="latitude"
                                    label="Latitude"
                                    className="w-1/2"
                                >
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        disabled={!useManualAddress && markerPosition !== null}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="longitude"
                                    label="Longitude"
                                    className="w-1/2"
                                >
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        disabled={!useManualAddress && markerPosition !== null}
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex justify-between items-center">
                                <span className='text-theme-text-secondary h-6'>Select Location on Map</span>
                            </div>
                            <div style={{ height: 400, width: '100%', position: 'relative' }}>
                                <MapWithNoSSR
                                    centerPosition={defaultPosition}
                                    markerPosition={markerPosition}
                                    onMapClick={handleMapClick}
                                />
                            </div>
                            <div className="text-xs text-theme-text-secondary mt-1">
                                Click on the map to select a location.
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={handleModalCancel}>
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