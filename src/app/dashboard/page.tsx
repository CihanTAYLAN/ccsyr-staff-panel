'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { Card, Col, Row, Statistic } from 'antd';
import {
    UserOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

export default function Dashboard() {
    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <Row gutter={16}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={42}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Locations"
                            value={12}
                            prefix={<EnvironmentOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Today's Logs"
                            value={156}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
            <div className="mt-8">
                <Card title="Recent Activity">
                    <p>No recent activity to display</p>
                </Card>
            </div>
        </AdminLayout>
    );
} 