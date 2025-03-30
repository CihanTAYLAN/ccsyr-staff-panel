'use client';

import { ConfigProvider, theme } from 'antd';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Varsayılan değerler ekleyerek context'in hiçbir zaman undefined olmamasını sağlıyoruz
const defaultThemeContext: ThemeContextType = {
    theme: 'light',
    toggleTheme: () => { },
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [themeMode, setThemeMode] = useState<Theme>('light');

    // Tarayıcıda kullanıcının tercihine göre ilk tema ayarı
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('theme') as Theme;
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme) {
                setThemeMode(savedTheme);
            } else if (prefersDark) {
                setThemeMode('dark');
            }
        } catch (error) {
            console.error('Theme initialization error:', error);
        } finally {
            setMounted(true);
        }
    }, []);

    // Temayı değiştir ve localStorage'a kaydet
    const toggleTheme = () => {
        try {
            const newTheme = themeMode === 'light' ? 'dark' : 'light';
            setThemeMode(newTheme);
            localStorage.setItem('theme', newTheme);

            // HTML sınıflarını ve veri özelliklerini güncelle
            if (newTheme === 'dark') {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            }
            document.documentElement.setAttribute('data-theme', newTheme);
        } catch (error) {
            console.error('Theme toggle error:', error);
        }
    };

    // Tema değiştiğinde HTML sınıflarını güncelle
    useEffect(() => {
        if (!mounted) return;

        try {
            if (themeMode === 'dark') {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            }
            document.documentElement.setAttribute('data-theme', themeMode);
        } catch (error) {
            console.error('Theme update error:', error);
        }
    }, [themeMode, mounted]);

    // SSR durumunda, içeriği gizle
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#1677ff',
                    },
                }}
            >
                <div data-theme={themeMode} className={themeMode}>
                    {children}
                </div>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    return context;
}; 