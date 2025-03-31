export type MapMarker = {
	lat: number;
	lng: number;
	title?: string;
};

export type DynamicMapProps = {
	center: [number, number];
	zoom?: number;
	markers?: MapMarker[];
	height?: string;
	onMapClick?: (lat: number, lng: number) => void;
	enableSearch?: boolean;
};
