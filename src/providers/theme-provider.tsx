'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Varsayılan tema değerleri
const defaultThemeContext: ThemeContextType = {
    theme: 'light',
    toggleTheme: () => { },
};

// Tema Context
const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

// AntD tema token'ları için yardımcı fonksiyon
const getAntThemeTokens = (mode: Theme) => {
    return {
        token: {
            colorPrimary: '#1980a8', // Ana tema rengi
            colorSuccess: mode === 'light' ? '#52c41a' : '#52c41a',
            colorWarning: mode === 'light' ? '#faad14' : '#faad14',
            colorError: mode === 'light' ? '#f5222d' : '#f5222d',
            colorInfo: mode === 'light' ? '#1890ff' : '#1890ff',
            borderRadius: 4,
            wireframe: false,
            colorBgBase: mode === 'light' ? '#ffffff' : '#121212',
            colorTextBase: mode === 'light' ? '#262626' : '#e5e5e5',
        },
        components: {
            Card: {
                colorBgContainer: mode === 'light' ? 'var(--theme-bg-elevated)' : 'var(--theme-bg-elevated)',
                colorBorderSecondary: mode === 'light' ? 'var(--theme-border)' : 'var(--theme-border)',
            },
            Menu: {
                colorItemBg: mode === 'light' ? 'var(--theme-bg-secondary)' : 'var(--theme-bg-secondary)',
                colorItemText: mode === 'light' ? 'var(--theme-text)' : 'var(--theme-text)',
                colorItemTextSelected: mode === 'light' ? 'var(--primary)' : 'var(--primary)',
                colorActiveBarWidth: 3,
                colorActiveBarHeight: 0,
                colorActiveBarBorderSize: 0,
            },
            Table: {
                colorBgContainer: mode === 'light' ? 'var(--theme-bg-elevated)' : 'var(--theme-bg-elevated)',
                headerBg: mode === 'light' ? 'var(--theme-bg-secondary)' : 'var(--theme-bg-secondary)',
            },
            Layout: {
                colorBgHeader: mode === 'light' ? 'var(--theme-bg-elevated)' : 'var(--theme-bg-elevated)',
                colorBgBody: mode === 'light' ? 'var(--theme-bg-primary)' : 'var(--theme-bg-primary)',
                colorBgTrigger: mode === 'light' ? 'var(--theme-bg-secondary)' : 'var(--theme-bg-secondary)',
            },
            Input: {
                colorBgContainer: mode === 'light' ? 'var(--theme-bg-input)' : 'var(--theme-bg-input)',
                colorBorder: mode === 'light' ? 'var(--theme-border)' : 'var(--theme-border)',
            },
            Button: {
                colorBgContainer: mode === 'light' ? 'var(--theme-bg-elevated)' : 'var(--theme-bg-elevated)',
                colorBorder: mode === 'light' ? 'var(--theme-border)' : 'var(--theme-border)',
            },
        },
        algorithm: mode === 'dark' ? [antTheme.darkAlgorithm] : [antTheme.defaultAlgorithm],
    };
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    // Tarayıcıdaki tema tercihini kontrol et
    useEffect(() => {
        try {
            // Local Storage'dan tema ayarını al veya tarayıcı tercihini kontrol et
            const savedTheme = localStorage.getItem('theme') as Theme | null;
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

            setTheme(savedTheme || systemTheme);

            // HTML element'e tema class'ını ekle
            document.documentElement.classList.toggle('dark', (savedTheme || systemTheme) === 'dark');
            document.documentElement.setAttribute('data-theme', savedTheme || systemTheme);

            setMounted(true);
        } catch (error) {
            console.warn('Tema başlatılırken bir hata oluştu:', error);
            setMounted(true);
        }
    }, []);

    // Tema değiştirme fonksiyonu
    const toggleTheme = () => {
        try {
            const newTheme = theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);

            // HTML element'e tema class'ını ekle/çıkar
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            document.documentElement.setAttribute('data-theme', newTheme);
        } catch (error) {
            console.warn('Tema değiştirilirken bir hata oluştu:', error);
        }
    };

    // SSR sırasında içeriği sakla (flickering önleme)
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <ConfigProvider theme={getAntThemeTokens(theme)}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    return context;
}; 