'use client';

import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import AccessLogTimeline, { TimelineItem, TimelineFilter } from '@/components/shared/AccessLogTimeline';

const DashboardTimeline: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState<TimelineFilter>({
        limit: 5,
        page: 1
    });

    useEffect(() => {
        const fetchTimelineData = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    page: filter.page.toString(),
                    limit: filter.limit.toString(),
                    ...(filter.dateRange ? {
                        startDate: filter.dateRange[0],
                        endDate: filter.dateRange[1]
                    } : {}),
                    ...(filter.locationId ? { locationId: filter.locationId } : {}),
                    ...(filter.userId ? { userId: filter.userId } : {})
                });

                const response = await fetch(`/api/dashboard/timeline?${params}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch timeline data');
                }

                const data = await response.json();
                setTimeline(data.items);
                setTotal(data.total);
            } catch (error) {
                console.error('Error fetching timeline data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTimelineData();
    }, [filter]);

    const handleFilterChange = (newFilter: TimelineFilter) => {
        setFilter(newFilter);
    };

    return (
        <Card title="Recent Activity" size="small">
            <AccessLogTimeline
                items={timeline}
                loading={loading}
                total={total}
                filter={filter}
                onFilterChange={handleFilterChange}
            />
        </Card>
    );
};

export default DashboardTimeline; 