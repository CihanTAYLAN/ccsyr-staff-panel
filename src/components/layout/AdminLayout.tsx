'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Spin, Image, Modal, Select, DatePicker, message, Form, Space } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    LogoutOutlined,
    MoonOutlined,
    SunOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';
import dayjs from 'dayjs';
import { EUserType } from '@prisma/client';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

// Lokasyon arayüzü
interface Location {
    id: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Kullanıcı konumunu al
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
    const findClosestLocation = (): Location | null => {
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

        let closestLocation: Location | null = null;
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

        return closestLocation;
    };

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

    // Kullanıcının konumu ve lokasyonlar değiştiğinde form alanını güncelle
    useEffect(() => {
        if (locationModalVisible && userLocation && locations.length > 0) {
            const closestLocation = findClosestLocation();
            if (closestLocation) {
                form.setFieldsValue({ locationId: closestLocation.id });
            }
        }
    }, [userLocation, locations, locationModalVisible, form]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Kullanıcı girişini ve lokasyon durumunu kontrol et
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session) {
            // Kullanıcının lokasyon bilgisi yoksa modal'ı aç
            if (!session.user.currentLocation) {
                setLocationModalVisible(true);
                fetchLocations();
                getUserLocation();
            }
        }
    }, [status, session, router]);

    // Check-in işlemi yap
    const handleCheckIn = async (values: { locationId: string; sessionDate?: dayjs.Dayjs }) => {
        if (!values.locationId) {
            message.error('Please select a location');
            return;
        }

        setSubmitting(true);
        try {
            const checkInData = {
                locationId: values.locationId,
                sessionDate: values.sessionDate ? values.sessionDate.toDate() : new Date(),
                // Kullanıcı zaten giriş yapmışsa (lokasyonu varsa) bu bir lokasyon güncelleme işlemidir
                actionType: session?.user?.currentLocation ? 'UPDATE_LOCATION' : 'CHECK_IN'
            };

            // API endpoint'i
            const endpoint = session?.user?.currentLocation
                ? '/api/access-logs/update-location'
                : '/api/access-logs/check-in';

            // Check-in veya Update Location işlemi
            const checkInResponse = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkInData),
            });

            if (checkInResponse.ok) {
                const responseData = await checkInResponse.json();
                message.success(session?.user?.currentLocation
                    ? 'Location updated successfully'
                    : 'Check-in successful');
                setLocationModalVisible(false);

                // API'den dönen location bilgisini kullan
                if (responseData.currentLocation) {
                    await update({
                        currentLocation: responseData.currentLocation
                    });
                } else {
                    // Fallback olarak eski yöntemi kullan
                    const selectedLocation = locations.find(loc => loc.id === values.locationId);
                    if (selectedLocation) {
                        await update({
                            currentLocation: {
                                id: selectedLocation.id,
                                name: selectedLocation.name,
                                address: selectedLocation.address
                            }
                        });
                    } else {
                        await update();
                    }
                }
            } else {
                const errorData = await checkInResponse.json();
                message.error(`${session?.user?.currentLocation ? 'Location update' : 'Check-in'} failed: ${errorData?.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(`Error during ${session?.user?.currentLocation ? 'location update' : 'check-in'}:`, error);
            message.error(`${session?.user?.currentLocation ? 'Location update' : 'Check-in'} failed. Please try again.`);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isMounted) {
        return null; // İlk render sırasında hiçbir şey render etme
    }

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-theme-bg">
                <Spin size="large" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const userMenu = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <UserOutlined />,
            onClick: () => router.push('/profile'),
        },
        {
            key: 'location',
            label: 'Change Location',
            icon: <EnvironmentOutlined />,
            onClick: () => {
                form.setFieldsValue({ sessionDate: dayjs() });
                setLocationModalVisible(true);
                fetchLocations();
                getUserLocation();
            },
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: async () => {
                // Kullanıcının yeri varsa check-out işlemi yap
                if (session?.user?.currentLocation) {
                    try {
                        const checkOutResponse = await fetch('/api/access-logs/check-out', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                sessionDate: new Date()
                            }),
                        });

                        if (checkOutResponse.ok) {
                            message.success('Check-out successful');
                        } else {
                            message.error('Check-out failed, but continuing with logout');
                        }
                    } catch (error) {
                        console.error('Error during check-out:', error);
                        message.error('Check-out failed, but continuing with logout');
                    }
                }

                // Ardından çıkış yap
                signOut({ callbackUrl: '/auth/login' });
            },
        },
    ];

    const menuItems = session?.user?.userType === EUserType.PERSONAL ? [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link href="/profile">Profile</Link>
        }
    ] : [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link href="/dashboard">Dashboard</Link>,
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: <Link href="/users">Users</Link>,
        },
        {
            key: 'locations',
            icon: <EnvironmentOutlined />,
            label: <Link href="/locations">Locations</Link>,
        },
        {
            key: 'access-logs',
            icon: <ClockCircleOutlined />,
            label: <Link href="/access-logs">Access Logs</Link>,
        },
    ];

    return (
        <Layout className="min-h-screen h-screen">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme={theme === 'dark' ? 'dark' : 'light'}
                className="border-r border-theme h-full"
            >
                <Link href="/dashboard" className={`h-10 m-4 flex items-center gap-4 justify-start`}>
                    {collapsed ? (
                        <Image src="/images/ccsyr-logo.png" alt="logo" className='h-10 w-auto' preview={false} />
                    ) : (
                        <Image src="/images/ccsyr-logo-2.png" alt="logo" className='h-10 w-auto' preview={false} />
                    )}
                    {/* {!collapsed && <h1 className='text-primary'>CCSYR</h1>} */}
                </Link>
                <Menu
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    mode="inline"
                    defaultSelectedKeys={window.location.pathname.split('/').slice(1)}
                    items={menuItems}
                    className="border-r-0"
                    style={{ backgroundColor: 'var(--theme-bg-elevated)' }}
                />
            </Sider>
            <Layout className="h-full flex flex-col">
                <Header className="p-0 flex justify-between items-center px-4 border-b border-theme h-16 bg-theme-bg">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={toggleCollapsed}
                        className="text-base w-16 h-16"
                    />
                    <div className="flex items-center gap-4">
                        <Space>
                            {session?.user?.currentLocation && (
                                <div className="hidden md:flex items-center gap-2 text-theme-text">
                                    <EnvironmentOutlined />
                                    <span>{session.user.currentLocation.name}</span>
                                </div>
                            )}
                        </Space>
                        <Button
                            type="text"
                            icon={theme === 'dark' ? <SunOutlined className='text-yellow-500' /> : <MoonOutlined className='text-gray-500' />}
                            onClick={toggleTheme}
                            className="text-base w-10 h-10"
                        />
                        <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                            <Avatar size="large" className="cursor-pointer"
                                style={{ backgroundColor: 'var(--theme)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}
                            >
                                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                        </Dropdown>
                    </div>
                </Header>
                <Content className="m-6 p-6 rounded shadow-theme flex-1 overflow-auto">
                    {children}
                </Content>
            </Layout>

            {/* Location Seçim Modalı */}
            <Modal
                title="Select Your Location"
                open={locationModalVisible}
                footer={null}
                closable={!!session?.user?.currentLocation}
                maskClosable={false}
                onCancel={() => session?.user?.currentLocation && setLocationModalVisible(false)}
            >
                <Form
                    form={form}
                    name="location-form"
                    initialValues={{ sessionDate: dayjs() }}
                    onFinish={handleCheckIn}
                    layout="vertical"
                >
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

                    <Form.Item
                        name="sessionDate"
                        label="Session Date"
                        tooltip="Select the date for this session (default: current date/time)"
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            size="large"
                            className="w-full"
                            suffixIcon={<CalendarOutlined />}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            block
                            size="large"
                        >
                            {session?.user?.currentLocation ? 'Update Location' : 'Check In'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
} 