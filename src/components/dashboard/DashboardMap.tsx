'use client';
import React, { useEffect, useState } from 'react';
import { Spin, Alert, Card } from 'antd';
import DynamicMap from '../shared/DynamicMap';
import { StatsData } from '../../app/(dashboard)/dashboard/page';

interface DashboardMapProps { stats: StatsData | null, loading: boolean, error: string | null }

// Calculate center point from multiple coordinates
const calculateCenter = (coordinates: Array<{ lat: number, lng: number }>): [number, number] => {
    if (coordinates.length === 0) return [37.7749, -122.4194];

    const total = coordinates.reduce((acc, coord) => ({
        lat: acc.lat + coord.lat,
        lng: acc.lng + coord.lng
    }), { lat: 0, lng: 0 });

    return [
        total.lat / coordinates.length,
        total.lng / coordinates.length
    ] as [number, number];
};

// Calculate appropriate zoom level
const calculateZoom = (coordinates: Array<{ lat: number, lng: number }>) => {
    if (coordinates.length <= 1) return 11;

    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);

    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const maxDiff = Math.max(latDiff, lngDiff);
    console.log(maxDiff);

    // Adjust these values based on your needs
    if (maxDiff > 10) return 4;
    if (maxDiff > 5) return 6;
    if (maxDiff > 2) return 8;
    if (maxDiff > 1) return 10;
    return 11;
};

const DashboardMap: React.FC<DashboardMapProps> = ({ stats, loading, error }) => {
    const [center, setCenter] = useState<[number, number]>([37.7749, -122.4194]);
    const [markers, setMarkers] = useState<any[]>([]);
    const [zoom, setZoom] = useState(11);

    useEffect(() => {
        // Convert location stats to map markers
        const mrks = stats?.locationStats.map((location) => ({
            lat: location.latitude,
            lng: location.longitude,
            title: location.name,
            html: `<div class='flex flex-col gap-1'>
            <a href="/locations/${location.id}" target="_blank"><strong>${location.name} 🔗</strong></a>
            <div>${location.address}</div>
            <strong style="color: #6abe39">Active users: ${location.activeUsers.length}</strong>
            <a href="https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}" target="_blank"><strong>View on google maps 🔗</strong></a>
            </div>`
        })) || [];

        // Calculate map center and zoom from markers
        const mapCenter = calculateCenter(mrks);
        const mapZoom = calculateZoom(mrks);

        setCenter(mapCenter);
        setZoom(mapZoom);
        setMarkers(mrks);
    }, [stats]);

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
            <DynamicMap center={center} zoom={zoom} markers={markers} />
        </Card>
    );
};

export default DashboardMap;