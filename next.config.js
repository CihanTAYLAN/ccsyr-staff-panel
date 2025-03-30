/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
        styledComponents: true,
        removeConsole: process.env.NODE_ENV === "production",
    },
    transpilePackages: ['antd', '@ant-design/icons'],
    images: {
        domains: ['localhost', '127.0.0.1'],
    },
}

module.exports = nextConfig