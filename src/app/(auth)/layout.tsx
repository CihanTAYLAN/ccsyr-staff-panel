'use client';

import AuthLayout from "../../components/layout/AuthLayout";


export default function Auth({ children }: { children: React.ReactNode }) {
    return (
        <AuthLayout>
            {children}
        </AuthLayout>
    );
} 