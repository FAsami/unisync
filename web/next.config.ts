import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@ant-design',
    'antd',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-input',
  ],
}

export default nextConfig
