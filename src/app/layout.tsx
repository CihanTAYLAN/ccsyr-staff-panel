import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "CCSYR Staff Panel",
  description: "Admin panel for staff management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

                  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  // Tarayıcı desteği veya localStorage erişimi yoksa sessizce devam et
                  console.warn('Theme initialization script error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AntdRegistry>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
