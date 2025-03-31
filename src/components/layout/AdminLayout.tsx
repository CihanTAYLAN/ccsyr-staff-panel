'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Spin, Image } from 'antd';
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
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: () => signOut({ callbackUrl: '/auth/login' }),
        },
    ];

    const menuItems = [
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
                <Link href="/dashboard" className={`${!collapsed ? 'px-4' : ''} h-8 m-4 flex items-center gap-4 justify-start`}>
                    <Image src="/images/ccsyr-logo.png" alt="logo" className='h-8 w-auto' preview={false} />
                    {!collapsed && <h1 className='text-primary'>CCSYR</h1>}
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
                                {session?.user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                        </Dropdown>
                    </div>
                </Header>
                <Content className="m-6 p-6 rounded shadow-theme flex-1 overflow-auto">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
} 