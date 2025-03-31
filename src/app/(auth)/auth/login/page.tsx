'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Form, Image, Input, message, Typography, Select, Spin } from 'antd';
import { UserOutlined, LockOutlined, BulbOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';

const { Title, Text } = Typography;
const { Option } = Select;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<any[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    // Lokasyonları getir
    const fetchLocations = async () => {
        setLoadingLocations(true);
        try {
            const response = await fetch('/api/locations');
            if (response.ok) {
                const data = await response.json();
                setLocations(data.locations || []);
            } else {
                message.error('Failed to load locations');
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoadingLocations(false);
        }
    };

    // Kullanıcının konumunu al
    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    // En yakın lokasyonu hesapla
    const findClosestLocation = () => {
        if (!userLocation || !locations.length) return null;

        // Haversine formulü ile iki nokta arasındaki mesafeyi hesapla
        const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // Dünya yarıçapı km olarak
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        let closestLocation = null;
        let minDistance = Infinity;

        locations.forEach(location => {
            if (location.latitude && location.longitude) {
                const distance = getDistance(
                    userLocation.lat,
                    userLocation.lng,
                    location.latitude,
                    location.longitude
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestLocation = location;
                }
            }
        });

        return closestLocation ? closestLocation.id : null;
    };

    useEffect(() => {
        setIsMounted(true);
        fetchLocations();
        getUserLocation();
    }, []);

    // Kullanıcı konumu ve lokasyonlar değiştiğinde form alanını güncelle
    useEffect(() => {
        if (userLocation && locations.length > 0) {
            const closestLocationId = findClosestLocation();
            if (closestLocationId) {
                form.setFieldsValue({ locationId: closestLocationId });
            }
        }
    }, [userLocation, locations]);

    const [form] = Form.useForm();

    const onFinish = async (values: { email: string; password: string; locationId: string }) => {
        setLoading(true);
        try {
            // Önce auth işlemini yapalım
            const result = await signIn('credentials', {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (result?.error) {
                message.error('Invalid email or password');
            } else {
                // Kullanıcı kaydını oluşturalım
                try {
                    const checkInResponse = await fetch('/api/access-logs/check-in', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            locationId: values.locationId,
                        }),
                    });

                    if (checkInResponse.ok) {
                        message.success('Login successful');
                        router.push('/dashboard');
                    } else {
                        // Giriş başarılı ama log kaydı başarısız
                        message.warning('Logged in but failed to register location');
                        router.push('/dashboard');
                    }
                } catch (checkInError) {
                    console.error('Error during check-in:', checkInError);
                    message.warning('Logged in but failed to register location');
                    router.push('/dashboard');
                }
            }
        } catch (error) {
            message.error('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    // İlk render'da içeriği sakla
    if (!isMounted) {
        return null;
    }

    return (
        <Card className="w-full mx-auto shadow-theme-md">
            <div className="text-center mb-6">
                <Image
                    src="/images/ccsyr-logo.png"
                    alt="logo"
                    preview={false}
                    height={64}
                    className="mx-auto mb-4"
                />
                <Title level={2} className="text-theme-text">CCSYR Staff Panel</Title>
                <Text type="secondary">Sign in to your account</Text>
            </div>

            <Form
                form={form}
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                className="w-full"
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email' },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined className="text-theme-secondary" />}
                        placeholder="Email"
                        size="large"
                        className="bg-theme-input"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-theme-secondary" />}
                        placeholder="Password"
                        size="large"
                        className="bg-theme-input"
                    />
                </Form.Item>

                <Form.Item
                    name="locationId"
                    label="Location"
                    rules={[{ required: true, message: 'Please select your location!' }]}
                    tooltip="Select the location you are checking in from"
                >
                    {loadingLocations ? (
                        <div className="flex items-center justify-center p-4">
                            <Spin size="small" />
                            <span className="ml-2">Loading locations...</span>
                        </div>
                    ) : (
                        <Select
                            placeholder="Select your location"
                            size="large"
                            className="w-full"
                            suffixIcon={<EnvironmentOutlined />}
                        >
                            {locations.map(location => (
                                <Option key={location.id} value={location.id}>
                                    {location.name}
                                    {location.address && ` (${location.address})`}
                                </Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item>
                    <Link href="/auth/forgot-password" className="text-primary hover:text-primary-dark">
                        Forgot password?
                    </Link>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        className="bg-gradient-primary hover:bg-primary-dark"
                    >
                        Log in
                    </Button>
                </Form.Item>
            </Form>

            <div className="text-center">
                <Button
                    type="text"
                    icon={<BulbOutlined />}
                    onClick={toggleTheme}
                    className="text-theme-text hover:text-primary"
                >
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
            </div>
        </Card >
    );
} 