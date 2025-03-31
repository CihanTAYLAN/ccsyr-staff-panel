import { Metadata } from 'next';
import DashboardTimeline from '@/components/dashboard/DashboardTimeline';
import { Breadcrumb, Space } from 'antd';
import DashboardStats from '../../../components/dashboard/DashboardStats';
import DashboardMap from '../../../components/dashboard/DashboardMap';
export const metadata: Metadata = {
    title: 'Dashboard | CCSYR Staff Panel',
    description: 'Dashboard and analytics for CCSYR Staff Panel',
};

export default function DashboardPage() {
    return (
        <>
            <div className="flex justify-between items-center mb-6 h-6">
                <Breadcrumb items={[
                    { title: 'Dashboard' },
                ]} />
            </div>
            <Space direction='vertical' size={16} className='w-full'>
                <DashboardStats />
                <DashboardMap />
                <DashboardTimeline />
            </Space>
        </>
    );
}