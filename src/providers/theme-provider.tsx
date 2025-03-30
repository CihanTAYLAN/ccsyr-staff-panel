'use client';

import { ConfigProvider, theme } from 'antd';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeMode] = useState<Theme>('light');

    // Tarayıcıda kullanıcının tercihine göre ilk tema ayarı
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            setThemeMode(savedTheme);
        } else if (prefersDark) {
            setThemeMode('dark');
        }
    }, []);

    // Temayı değiştir ve localStorage'a kaydet
    const toggleTheme = () => {
        const newTheme = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#1980a8',
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
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 