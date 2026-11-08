import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // `transpilePackages` needs exact package names, not scopes: '@ant-design'
  // matched nothing and transpiled none of the icons package.
  transpilePackages: [
    '@ant-design/icons',
    'antd',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-input',
  ],
}

export default nextConfig
