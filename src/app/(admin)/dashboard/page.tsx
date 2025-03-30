'use client';

import { Card, Col, Row, Statistic } from 'antd';
import {
    UserOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

export default function Dashboard() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6 text-theme-text">Dashboard</h1>
            <Row gutter={16}>
                <Col xs={24} sm={8} className="mb-4">
                    <Card hoverable className="shadow-theme h-full">
                        <Statistic
                            title="Total Users"
                            value={42}
                            prefix={<UserOutlined className="text-primary mr-1" />}
                            className="text-theme-text"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} className="mb-4">
                    <Card hoverable className="shadow-theme h-full">
                        <Statistic
                            title="Total Locations"
                            value={12}
                            prefix={<EnvironmentOutlined className="text-primary mr-1" />}
                            className="text-theme-text"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} className="mb-4">
                    <Card hoverable className="shadow-theme h-full">
                        <Statistic
                            title="Today's Logs"
                            value={156}
                            prefix={<ClockCircleOutlined className="text-primary mr-1" />}
                            className="text-theme-text"
                        />
                    </Card>
                </Col>
            </Row>
            <div className="mt-8">
                <Card title="Recent Activity" className="shadow-theme border-theme">
                    <p className="text-theme-secondary">No recent activity to display</p>
                </Card>
            </div>
        </>
    );
} 