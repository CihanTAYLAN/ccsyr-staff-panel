'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Breadcrumb } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditLocationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const locationId = params.id;

    // Lokasyon bilgilerini getir
    const fetchLocation = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/locations/${locationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch location details');
            }

            const data = await response.json();

            // Form alanlarını doldur
            form.setFieldsValue({
                name: data.location.name,
                description: data.location.description,
                address: data.location.address,
                latitude: data.location.latitude,
                longitude: data.location.longitude,
            });
        } catch (error) {
            console.error('Error fetching location details:', error);
            message.error('Failed to load location details');
            router.push('/locations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocation();
    }, [locationId]);

    // Lokasyon güncelleme
    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            // Koordinat alanlarını float'a dönüştür veya null yap
            const payload = {
                ...values,
                latitude: values.latitude ? parseFloat(values.latitude) : null,
                longitude: values.longitude ? parseFloat(values.longitude) : null,
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

            <Card title="Edit Location">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={submitting}
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
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <div className="flex flex-col md:flex-row gap-4">
                        <Form.Item
                            name="latitude"
                            label="Latitude"
                            className="w-full md:w-1/2"
                        >
                            <Input type="number" step="0.0001" />
                        </Form.Item>

                        <Form.Item
                            name="longitude"
                            label="Longitude"
                            className="w-full md:w-1/2"
                        >
                            <Input type="number" step="0.0001" />
                        </Form.Item>
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