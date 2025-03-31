'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Progress } from 'antd';
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
    locationStats: LocationStat[];
    dailyLogs: DailyLog[];
}

interface LocationStat {
    id: string;
    name: string;
    _count: {
        activeUsers: number;
    };
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
                setStats(data.stats);
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
                <Spin size="large" tip="Loading dashboard statistics..." />
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
    const totalActiveUsers = stats.locationStats.reduce((sum, location) =>
        sum + location._count.activeUsers, 0);

    return (
        <div className="dashboard-stats">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={stats.totalUsers}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Users"
                            value={stats.activeUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Locations"
                            value={stats.totalLocations}
                            prefix={<EnvironmentOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Today's Check-ins"
                            value={stats.todayCheckIns}
                            prefix={<LoginOutlined />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Users by Location">
                        {stats.locationStats.length > 0 ? (
                            <div>
                                {stats.locationStats.map((location) => {
                                    const percentage = totalActiveUsers > 0
                                        ? Math.round((location._count.activeUsers / totalActiveUsers) * 100)
                                        : 0;

                                    return (
                                        <div key={location.id} style={{ marginBottom: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{location.name}</span>
                                                <span>{location._count.activeUsers} users ({percentage}%)</span>
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
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Active Locations">
                        {stats.locationStats.map((location) => (
                            <div key={location.id} style={{ marginBottom: 8 }}>
                                <Statistic
                                    title={location.name}
                                    value={location._count.activeUsers}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{
                                        color: location._count.activeUsers > 0 ? '#3f8600' : '#999',
                                        fontSize: '18px'
                                    }}
                                    suffix="users"
                                />
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardStats; 