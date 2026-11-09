'use client'

import '@ant-design/v5-patch-for-react-19'
import { App, ConfigProvider, theme as antdTheme } from 'antd'
import { AntdRegistry } from '@ant-design/nextjs-registry'

interface AntdProviderProps {
  children: React.ReactNode
}

// Tokens mirror the UniSync design system (tokens.json, light theme — the
// dashboard has no theme toggle, and light is this system's one shipped web
// theme; see the artifact's patterns.md). Near-grayscale, one indigo accent,
// dense sizing, Inter.
const FONT_FAMILY =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"

export const AntdProvider = ({ children }: AntdProviderProps) => {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#4850b8',
            colorPrimaryHover: '#383f94',
            colorPrimaryActive: '#383f94',
            colorLink: '#4850b8',
            colorLinkHover: '#383f94',
            colorSuccess: '#15803d',
            colorWarning: '#b45309',
            colorError: '#b91c1c',
            colorTextBase: '#18181b',
            colorText: '#18181b',
            colorTextSecondary: '#71717a',
            colorTextTertiary: '#a1a1aa',
            colorTextDisabled: '#a1a1aa',
            colorBgBase: '#fafafa',
            colorBgContainer: '#ffffff',
            colorBgLayout: '#fafafa',
            colorBgElevated: '#ffffff',
            colorBorder: '#e4e4e7',
            colorBorderSecondary: '#e4e4e7',
            colorFillAlter: '#f2f2f3',
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            borderRadius: 6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,
            boxShadow: '0 1px 2px rgba(24, 24, 27, 0.04)',
            boxShadowSecondary: '0 4px 12px rgba(24, 24, 27, 0.06)',
          },
          components: {
            Button: { borderRadius: 6, fontWeight: 600, controlHeight: 32 },
            Input: { borderRadius: 6, controlHeight: 32 },
            InputNumber: { borderRadius: 6, controlHeight: 32 },
            Select: { borderRadius: 6, controlHeight: 32 },
            DatePicker: { borderRadius: 6, controlHeight: 32 },
            Card: { borderRadiusLG: 8 },
            Table: { borderRadiusLG: 8, headerBg: '#f2f2f3' },
            Modal: { borderRadiusLG: 12 },
            Tag: { borderRadiusSM: 4 },
            Layout: {
              headerHeight: 48,
              headerBg: '#ffffff',
              bodyBg: '#fafafa',
              siderBg: '#f2f2f3',
            },
            Menu: {
              itemBg: 'transparent',
              itemColor: '#71717a',
              itemHoverBg: '#eef0fc',
              itemHoverColor: '#4850b8',
              itemSelectedBg: '#eef0fc',
              itemSelectedColor: '#4850b8',
              itemBorderRadius: 6,
              itemMarginInline: 8,
              itemHeight: 32,
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  )
}
