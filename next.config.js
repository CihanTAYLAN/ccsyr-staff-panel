/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
        styledComponents: true,
        removeConsole: process.env.NODE_ENV === "production",
    },
    transpilePackages: ['@ant-design/icons', '@ant-design/icons-svg'],
    images: {
        domains: ['localhost', '127.0.0.1', 'ccsyr-staff-panel.vercel.app'],
    },
    experimental: {
        // Vercel deployment için ek stabilite
        instrumentationHook: true,
        serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    },
}

module.exports = nextConfig