/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    images: {
        unoptimized: true,
        domains: ['supabase.co'],
    },
}

module.exports = nextConfig
