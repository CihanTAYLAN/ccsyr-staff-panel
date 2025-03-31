'use client';;
import React, { useEffect, useState } from 'react';
import { Spin, Alert, Card } from 'antd';


const DashboardMap: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        setLoading(false);
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

    return (
        <Card title="Locations Map View" size='small'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Error hic, ad dignissimos odio voluptatem autem impedit laborum eius ratione obcaecati aliquid sunt maxime fugit labore nulla, corporis id quia rerum?
        </Card>
    );
};

export default DashboardMap;