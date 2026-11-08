'use client'

import '@ant-design/v5-patch-for-react-19'
import { App, ConfigProvider } from 'antd'
import { AntdRegistry } from '@ant-design/nextjs-registry'

interface AntdProviderProps {
  children: React.ReactNode
}

// Tokens mirror the UniSync design system (tokens.json, light theme only —
// the dashboard has no dark-mode toggle today, so antd stays on one theme
// rather than half-following prefers-color-scheme while admin chrome does not).
const FONT_FAMILY =
  "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"

export const AntdProvider = ({ children }: AntdProviderProps) => {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2563eb',
            colorPrimaryHover: '#1d4ed8',
            colorPrimaryActive: '#1d4ed8',
            colorLink: '#2563eb',
            colorLinkHover: '#1d4ed8',
            colorSuccess: '#15803d',
            colorWarning: '#b45309',
            colorError: '#b91c1c',
            colorTextBase: '#0f172a',
            colorText: '#0f172a',
            colorTextSecondary: '#64748b',
            colorTextTertiary: '#94a3b8',
            colorTextDisabled: '#94a3b8',
            colorBgBase: '#ffffff',
            colorBgContainer: '#ffffff',
            colorBgLayout: '#f8fafc',
            colorBgElevated: '#ffffff',
            colorBorder: '#e2e8f0',
            colorBorderSecondary: '#e2e8f0',
            colorFillAlter: '#f1f5f9',
            fontFamily: FONT_FAMILY,
            fontSize: 15,
            borderRadius: 12,
            borderRadiusLG: 16,
            borderRadiusSM: 8,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
            boxShadowSecondary: '0 6px 16px rgba(15, 23, 42, 0.08)',
          },
          components: {
            Button: { borderRadius: 12, fontWeight: 600 },
            Input: { borderRadius: 12 },
            InputNumber: { borderRadius: 12 },
            Select: { borderRadius: 12 },
            DatePicker: { borderRadius: 12 },
            Card: { borderRadiusLG: 16 },
            Table: { borderRadiusLG: 16, headerBg: '#f1f5f9' },
            Modal: { borderRadiusLG: 24 },
            Tag: { borderRadiusSM: 8 },
            Menu: {
              itemBg: 'transparent',
              itemColor: '#0f172a',
              itemHoverBg: '#eff6ff',
              itemHoverColor: '#2563eb',
              itemSelectedBg: '#eff6ff',
              itemSelectedColor: '#2563eb',
              itemBorderRadius: 12,
              itemMarginInline: 8,
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  )
}
