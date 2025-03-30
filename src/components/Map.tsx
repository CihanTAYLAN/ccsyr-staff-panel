'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Input, Button, message, Spin } from 'antd';
import type { InputRef } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MapProps = {
    centerPosition: [number, number];
    markerPosition: [number, number] | null;
    onMapClick: (lat: number, lng: number) => void;
};

// Harita olaylarını işleme komponenti
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

// Harita merkezini ayarlayan bileşen
const SetViewOnChange = ({ coords, markerPosition }: { coords: [number, number] | null, markerPosition: [number, number] | null }) => {
    const map = useMap();

    useEffect(() => {
        if (coords) {
            map.setView(coords, 15);
        }
    }, [coords, map]);

    return null;
};

const Map = ({ centerPosition, markerPosition, onMapClick }: MapProps) => {
    // Server-side rendering'de hata almamak için durum kontrolü
    const [isMounted, setIsMounted] = useState(false);
    const [searchAddress, setSearchAddress] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundCoords, setFoundCoords] = useState<[number, number] | null>(null);
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
                setFoundCoords([lat, lon]);

                // Bulunan koordinatlara marker yerleştir ve click event'i tetikle
                onMapClick(lat, lon);

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

    // Client-side'da çalıştığında bileşeni mount et
    useEffect(() => {
        // Leaflet için ikon düzeltmesi
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
        });

        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                Map is loading...
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {/* Arama Kutusu */}
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    zIndex: 1000,
                    borderRadius: '4px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
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

            {/* Leaflet Haritası */}
            <MapContainer
                center={centerPosition}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markerPosition && (
                    <Marker position={markerPosition} />
                )}
                <MapClickHandler onMapClick={onMapClick} />
                {foundCoords && <SetViewOnChange coords={foundCoords} markerPosition={markerPosition} />}
            </MapContainer>
        </div>
    );
};

export default Map;