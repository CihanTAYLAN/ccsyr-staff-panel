'use client';

import { useEffect, useRef, useState } from 'react';
import { Input, Button, message, Spin } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DynamicMapProps } from '@/types/map';

export default function DynamicMap({ center, zoom = 13, markers = [], height = '400px', onMapClick, enableSearch = false }: DynamicMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [searchAddress, setSearchAddress] = useState('');
    const [searching, setSearching] = useState(false);
    const searchInputRef = useRef<InputRef>(null);

    // Adres aramak için Nominatim API kullanımı
    const searchAddressHandler = async (e: React.KeyboardEvent<HTMLInputElement> | null) => {
        if (e) {
            e.preventDefault();
        }
        if (!searchAddress.trim()) return;

        setSearching(true);

        try {
            const encodedAddress = encodeURIComponent(searchAddress);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
                {
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'CCSYR Staff Panel'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Address search failed');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                // Bulunan koordinatlara göre haritayı merkeze al
                if (mapRef.current) {
                    mapRef.current.setView([lat, lon], 15);
                }

                // Bulunan koordinatlara marker yerleştir ve click event'i tetikle
                if (onMapClick) {
                    onMapClick(lat, lon);
                }

                // Adres alanını tam adres ile güncelle
                if (data[0].display_name) {
                    setSearchAddress(data[0].display_name);
                }
            } else {
                message.warning('Address not found. Try a different search term.');
            }
        } catch (error) {
            console.error('Error searching address:', error);
            message.error('Error searching address. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize map
        const map = L.map(mapContainerRef.current).setView(center, zoom);
        mapRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom marker icon
        const icon = L.icon({
            iconUrl: '/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: '/images/marker-shadow.png',
            shadowSize: [41, 41]
        });

        // Add markers
        markers.forEach(marker => {
            L.marker([marker.lat, marker.lng], { icon })
                .bindPopup(marker.html || marker.title || '')
                .addTo(map);
        });

        // Add click event if onMapClick is provided
        if (onMapClick) {
            map.on('click', (e) => {
                onMapClick(e.latlng.lat, e.latlng.lng);
            });
        }

        // Cleanup
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [center, zoom, markers, onMapClick]);

    return (
        <div style={{ position: 'relative', height, width: '100%' }}>
            {enableSearch && (
                <>
                    {/* Arama Kutusu */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            right: '10px',
                            zIndex: 1000,
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px'
                        }}
                    >
                        <Input
                            ref={searchInputRef}
                            placeholder="Search for an address..."
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            onPressEnter={searchAddressHandler}
                            style={{ flex: 1 }}
                            readOnly={searching}
                        />
                        <Button
                            type="default"
                            loading={searching}
                            className='bg-[var(--theme-bg-elevated)]'
                            icon={searching ? <LoadingOutlined /> : <SearchOutlined />}
                            onClick={() => searchAddressHandler(null)}
                            disabled={searching || !searchAddress.trim()}
                        >
                        </Button>
                    </div>

                    {searching && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                zIndex: 999,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '8px'
                            }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <Spin size="large" />
                                <div style={{ marginTop: 12, color: '#1890ff' }}>Searching address...</div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
        </div>
    );
} 