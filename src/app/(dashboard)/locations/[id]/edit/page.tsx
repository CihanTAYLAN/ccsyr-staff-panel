'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Breadcrumb, Checkbox } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { DynamicMapProps } from '@/types/map';

// dynamic import for DynamicMap
const DynamicMap = dynamic<DynamicMapProps>(
    () => import('@/components/shared/DynamicMap'),
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

export default function EditLocationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const locationId = params.id;
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
    const [centerPosition, setCenterPosition] = useState<[number, number]>([43.7181228, -79.5428638]);
    const [useManualAddress, setUseManualAddress] = useState(false);

    // Lokasyon bilgilerini getir
    const fetchLocation = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/locations/${locationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch location details');
            }

            const data = await response.json();

            // Koordinatlar varsa marker'ı ayarla
            if (data.location.latitude && data.location.longitude) {
                setMarkerPosition([data.location.latitude, data.location.longitude]);
                setCenterPosition([data.location.latitude, data.location.longitude]);
            }

            // Form alanlarını doldur
            form.setFieldsValue({
                name: data.location.name,
                description: data.location.description,
                address: data.location.address,
                latitude: data.location.latitude,
                longitude: data.location.longitude,
            });
        } catch (error: any) {
            console.error('Error fetching location details:', error);
            message.error(error.message || 'Failed to load location details');
            router.push('/locations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocation();
    }, [locationId]);

    // Harita tıklama olayı
    const handleMapClick = (lat: number, lng: number) => {
        setMarkerPosition([lat, lng]);
        setCenterPosition([lat, lng]);
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
                            'Accept-Language': 'en',
                            'User-Agent': 'CCSYR Staff Panel'
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
            } catch (error: any) {
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

    // Lokasyon güncelleme
    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            // Koordinat alanlarını float'a dönüştür veya null yap
            const payload = {
                ...values,
                latitude: parseFloat(values.latitude),
                longitude: parseFloat(values.longitude),
            };

            const response = await fetch(`/api/locations/${locationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update location');
            }

            message.success('Location updated successfully');
            router.push(`/locations/${locationId}`);
        } catch (error: any) {
            message.error(error.message || 'Failed to update location');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { title: <Link href="/dashboard">Dashboard</Link> },
                        { title: <Link href="/locations">Locations</Link> },
                        { title: <Link href={`/locations/${locationId}`}>{form.getFieldValue('name')}</Link> },
                        { title: 'Edit Location' },
                    ]}
                />
            </div>

            <Card title="Edit Location" size='small'>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={submitting}
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
                                        onChange={(e) => {
                                            setMarkerPosition([parseFloat(e.target.value), markerPosition ? markerPosition[1] : 0]);
                                            setCenterPosition([parseFloat(e.target.value), markerPosition ? markerPosition[1] : 0]);
                                            form.setFieldsValue({
                                                latitude: parseFloat(e.target.value),
                                            });
                                        }}
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
                                        onChange={(e) => {
                                            setMarkerPosition([markerPosition ? markerPosition[0] : 0, parseFloat(e.target.value)]);
                                            setCenterPosition([markerPosition ? markerPosition[0] : 0, parseFloat(e.target.value)]);
                                            form.setFieldsValue({
                                                longitude: parseFloat(e.target.value),
                                            });
                                        }}
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex justify-between items-center">
                                <span className='text-theme-text-secondary h-6'>Select Location on Map</span>
                            </div>
                            <div style={{ height: 400, width: '100%', position: 'relative' }}>
                                <DynamicMap
                                    center={centerPosition}
                                    markers={markerPosition ? [{ lat: markerPosition[0], lng: markerPosition[1] }] : []}
                                    onMapClick={handleMapClick}
                                    height="400px"
                                    enableSearch={true}
                                />
                            </div>
                            <div className="text-xs text-theme-text-secondary mt-1">
                                Click on the map to select a location.
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={submitting}
                        >
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Card>
        </>
    );
} 