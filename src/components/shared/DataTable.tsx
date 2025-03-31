import { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Select, Tag } from 'antd';
import { ClearOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

export type PaginationData = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

export type FilterOption = {
    value: string;
    label: string;
};

export type FilterConfig = {
    type: 'text' | 'select';
    placeholder?: string;
    options?: FilterOption[];
    filterKey: string;
};

export type SortingState = {
    sortField: string;
    sortOrder: string;
};

export type FilterState = {
    [key: string]: string;
};

type DataTableProps<T> = {
    dataSource: T[];
    columns: any[];
    loading: boolean;
    pagination: PaginationData;
    filters?: Record<string, FilterConfig>;
    filterValues?: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onTableChange: (pagination: any, filters: any, sorter: any) => void;
    onRefresh?: () => void;
    onResetFilters?: () => void;
    rowKey?: string;
};

export function DataTable<T>({
    dataSource,
    columns,
    loading,
    pagination,
    filters = {},
    filterValues: externalFilterValues = {},
    onFiltersChange,
    onTableChange,
    onRefresh,
    onResetFilters,
    rowKey = 'id',
}: DataTableProps<T>) {
    const [internalFilterValues, setInternalFilterValues] = useState<FilterState>(externalFilterValues);

    // Dışarıdan gelen filterValues değiştiğinde iç state'i güncelle
    useEffect(() => {
        setInternalFilterValues(externalFilterValues);
    }, [externalFilterValues]);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...internalFilterValues, [key]: value };
        setInternalFilterValues(newFilters);
        onFiltersChange(newFilters);
    };

    const handleResetFilters = () => {
        const resetValues: FilterState = {};
        Object.keys(filters).forEach(key => {
            resetValues[key] = '';
        });
        setInternalFilterValues(resetValues);
        if (onResetFilters) {
            onResetFilters();
        }
    };

    return (
        <div className="data-table-container">
            {Object.keys(filters).length > 0 && (
                <div className="bg-theme-background p-4 rounded-md shadow-theme">
                    <Space wrap className="filters-container">
                        {Object.entries(filters).map(([key, config]) => (
                            <div key={key} className="filter-item">
                                {config.type === 'text' && (
                                    <Input
                                        placeholder={config.placeholder || `Search by ${key}`}
                                        value={internalFilterValues[key] || ''}
                                        onChange={e => handleFilterChange(key, e.target.value)}
                                        prefix={<SearchOutlined />}
                                        allowClear
                                    />
                                )}
                                {config.type === 'select' && config.options && (
                                    <Select
                                        placeholder={config.placeholder || `Filter by ${key}`}
                                        value={internalFilterValues[key] || undefined}
                                        onChange={value => handleFilterChange(key, value)}
                                        allowClear
                                        style={{ minWidth: '180px' }}
                                        options={config.options}
                                    />
                                )}
                            </div>
                        ))}
                        <Button onClick={handleResetFilters} icon={<ClearOutlined />}>Clear Filters</Button >
                        {onRefresh && <Button onClick={onRefresh} icon={<ReloadOutlined />}>Refresh</Button>}
                    </Space>
                </div>
            )}

            <Table
                className="custom-table"
                dataSource={dataSource}
                columns={columns}
                rowKey={rowKey}
                loading={loading}
                onChange={onTableChange}
                scroll={{ x: 1000 }}
                size='small'
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
            />
        </div>
    );
}

// Yardımcı fonksiyonlar
export const generateTagByColor = (text: string, color: string) => {
    return <Tag color={color}>{text}</Tag>;
};

export const generateTagByStatus = (status: string, onlineValue: string, colorMap: Record<string, string>) => {
    const color = colorMap[status] || 'default';
    return <Tag color={color}>{status}</Tag>;
}; 