'use client';

import DashboardTimeline from '@/components/dashboard/DashboardTimeline';
import { Breadcrumb, Space } from 'antd';
import DashboardStats from '../../../components/dashboard/DashboardStats';
import DashboardMap from '../../../components/dashboard/DashboardMap';
import { useEffect } from 'react';
import { useState } from 'react';

export interface StatsData {
    totalUsers: number;
    onlineUsers: number;
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

export interface LocationStat {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    activeUsers: {
        id: string;
        name: string;
    }[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Dashboard | CCSYR Staff Panel';
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/dashboard/stats');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch dashboard statistics');
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

    return (
        <>
            <div className="flex justify-between items-center mb-6 h-6">
                <Breadcrumb items={[
                    { title: 'Dashboard' },
                ]} />
            </div>
            <Space direction='vertical' size={16} className='w-full'>
                <DashboardStats stats={stats} loading={loading} error={error} />
                <DashboardMap stats={stats} loading={loading} error={error} />
                <DashboardTimeline />
            </Space>
        </>
    );
}