/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
        styledComponents: true,
        removeConsole: process.env.NODE_ENV === "production",
    },
    transpilePackages: ['antd', '@ant-design/icons'],
}

module.exports = nextConfig 