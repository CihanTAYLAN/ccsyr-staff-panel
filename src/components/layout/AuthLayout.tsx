
import { Layout } from 'antd';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout>
            <div className="min-h-screen flex flex-col items-center justify-center bg-theme-bg-secondary p-4">
                <div className="w-full max-w-md mx-auto">
                    {children}
                </div>
                <footer className="mt-8 text-center text-theme-text-secondary text-sm">
                    &copy; {new Date().getFullYear()} CCSYR Staff Panel. All rights reserved.
                </footer>
            </div>
        </Layout>
    );
}