import { Metadata } from 'next';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardTimeline from '@/components/dashboard/DashboardTimeline';

export const metadata: Metadata = {
    title: 'Dashboard | CCSYR Staff Panel',
    description: 'Dashboard and analytics for CCSYR Staff Panel',
};

export default function DashboardPage() {
    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>

            <DashboardStats />

            <div className="dashboard-timeline-section" style={{ marginTop: 24 }}>
                <h2>Recent Activity Timeline</h2>
                <DashboardTimeline />
            </div>
        </div>
    );
} 