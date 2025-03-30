'use client';

import React, { createContext, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// dayjs eklentilerini yükle
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Context oluştur
const LocaleContext = createContext<string>('en');

export const useLocale = () => useContext(LocaleContext);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        try {
            // Tarayıcı dilini al
            const browserLang = navigator.language.split('-')[0] || 'en';

            // dayjs için dil ayarını yap
            dayjs.locale(browserLang);

            console.log(`Locale set to: ${browserLang}`);
        } catch (e) {
            console.warn('Error setting dayjs locale:', e);
            // Hata durumunda varsayılan dil olarak İngilizce kullan
            dayjs.locale('en');
        }
    }, []);

    return (
        <LocaleContext.Provider value={'en'}>
            {children}
        </LocaleContext.Provider>
    );
}

export default LocaleProvider; 