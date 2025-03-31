'use client';

import React, { useEffect, useState } from 'react';
import { Card, Statistic, Spin, Alert, Progress } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    EnvironmentOutlined,
    LoginOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

interface DashboardStatsProps { }

interface StatsData {
    totalUsers: number;
    activeUsers: number;
    totalLocations: number;
    todayCheckIns: number;
    totalAccessLogs: number;
    locationStats: LocationStat[];
    totalActiveUsers: number;
    dailyStats: {
        _count: {
            id: number;
        };
        created_at: string;
    }[];
}

interface LocationStat {
    id: string;
    name: string;
    activeUsers: {
        id: string;
        name: string;
    }[];
}

interface DailyLog {
    date: string;
    actionType: string;
    count: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<StatsData | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/dashboard/stats');

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard statistics');
                }

                const data = await response.json();

                setStats(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large">
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                        Loading dashboard statistics...
                    </div>
                </Spin>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
            />
        );
    }

    if (!stats) {
        return (
            <Alert
                message="No Data"
                description="No statistics available at the moment."
                type="info"
                showIcon
            />
        );
    }

    // Lokasyon pie chart verileri yerine progress bar kullanacağız
    // Toplam aktif kullanıcı sayısını hesapla
    const totalActiveUsers = stats.locationStats.reduce((sum, location) =>
        sum + (location.activeUsers.length || 0), 0);

    return (
        <div className="dashboard-stats">
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card>
                    <Statistic
                        title="Total Users"
                        value={stats.totalUsers}
                        prefix={<TeamOutlined />}
                    />
                </Card>

                <Card>
                    <Statistic
                        title="Active Users"
                        value={stats.activeUsers}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>

                <Card>
                    <Statistic
                        title="Total Locations"
                        value={stats.totalLocations}
                        prefix={<EnvironmentOutlined />}
                    />
                </Card>

                <Card>
                    <Statistic
                        title="Today's Check-ins"
                        value={stats.todayCheckIns}
                        prefix={<LoginOutlined />}
                        valueStyle={{ color: '#1677ff' }}
                    />
                </Card>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2' style={{ marginTop: 16 }}>
                <Card title="Users by Location" size='small'>
                    {stats.locationStats.length > 0 ? (
                        <div>
                            {stats.locationStats.map((location) => {
                                const percentage = totalActiveUsers > 0
                                    ? Math.round((location.activeUsers.length / totalActiveUsers) * 100)
                                    : 0;

                                return (
                                    <div key={location.id} style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{location.name}</span>
                                            <span>{location.activeUsers.length} users ({percentage}%)</span>
                                        </div>
                                        <Progress
                                            percent={percentage}
                                            showInfo={false}
                                            strokeColor={percentage > 50 ? '#3f8600' : '#1677ff'}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <Alert message="No location data available" type="info" showIcon />
                    )}
                </Card>
                <Card title="Active Locations" size='small'>
                    {stats.locationStats.map((location) => (
                        <div key={location.id} style={{ marginBottom: 8 }}>
                            <Statistic
                                title={location.name}
                                value={location.activeUsers.length}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{
                                    color: (location.activeUsers.length > 0) ? '#3f8600' : '#999',
                                    fontSize: '18px'
                                }}
                                suffix="users"
                            />
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
};

export default DashboardStats; 