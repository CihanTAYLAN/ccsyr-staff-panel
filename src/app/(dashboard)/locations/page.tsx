'use client';

import { useState } from 'react';
import { Button, Card, Table, Input, Space } from 'antd';
import { SearchOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';

type LocationData = {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
};

// Demo data - gerçek uygulamada API'den gelecek
const mockLocations: LocationData[] = [
    {
        id: '1',
        name: 'Main Office',
        description: 'Headquarter building',
        address: '123 Business Ave, City',
        latitude: 41.0082,
        longitude: 28.9784,
    },
    {
        id: '2',
        name: 'Warehouse',
        description: 'Storage facility',
        address: '456 Industry St, City',
        latitude: 41.0122,
        longitude: 28.9760,
    },
    {
        id: '3',
        name: 'Branch Office',
        description: 'Regional branch',
        address: '789 Commercial Rd, City',
        latitude: 41.0230,
        longitude: 28.9745,
    },
];

export default function LocationsPage() {
    const [locations, setLocations] = useState<LocationData[]>(mockLocations);
    const [searchText, setSearchText] = useState('');

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <EnvironmentOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text: string | null) => text || 'N/A',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: (text: string | null) => text || 'N/A',
        },
        {
            title: 'Coordinates',
            key: 'coordinates',
            render: (_: any, record: LocationData) => (
                record.latitude && record.longitude ?
                    `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}` :
                    'N/A'
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: LocationData) => (
                <Space size="small">
                    <Button type="link" size="small">
                        Edit
                    </Button>
                    <Button type="link" size="small">
                        View Map
                    </Button>
                    <Button type="link" size="small" danger>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (location.description?.toLowerCase().includes(searchText.toLowerCase()) || false) ||
        (location.address?.toLowerCase().includes(searchText.toLowerCase()) || false)
    );

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Locations</h1>
                <Button type="primary" icon={<PlusOutlined />}>
                    Add Location
                </Button>
            </div>

            <Card>
                <div className="mb-4">
                    <Input
                        placeholder="Search locations"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredLocations}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </>
    );
} 