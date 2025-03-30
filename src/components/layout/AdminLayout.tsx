'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
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
    BulbOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    if (!isMounted) {
        return null; // İlk render sırasında hiçbir şey render etme
    }

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        return null;
    }

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const userMenu = [
        {
            key: '1',
            label: 'Profile',
            icon: <UserOutlined />,
        },
        {
            key: '2',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: () => signOut({ callbackUrl: '/auth/login' }),
        },
    ];

    const menuItems = [
        {
            key: '1',
            icon: <DashboardOutlined />,
            label: <Link href="/dashboard">Dashboard</Link>,
        },
        {
            key: '2',
            icon: <UserOutlined />,
            label: <Link href="/users">Users</Link>,
        },
        {
            key: '3',
            icon: <EnvironmentOutlined />,
            label: <Link href="/locations">Locations</Link>,
        },
        {
            key: '4',
            icon: <ClockCircleOutlined />,
            label: <Link href="/access-logs">Access Logs</Link>,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme={theme === 'dark' ? 'dark' : 'light'}
            >
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: theme === 'dark' ? '#141414' : '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={toggleCollapsed}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Button
                                type="text"
                                icon={<BulbOutlined />}
                                onClick={toggleTheme}
                                style={{ fontSize: '16px', width: 40, height: 40 }}
                            />
                            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                                <Avatar size="large" icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                            </Dropdown>
                        </div>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        background: theme === 'dark' ? '#141414' : '#fff',
                        borderRadius: '4px',
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
} 