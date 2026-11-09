'use client'

import '@ant-design/v5-patch-for-react-19'
import { App, ConfigProvider, theme as antdTheme } from 'antd'
import { AntdRegistry } from '@ant-design/nextjs-registry'

interface AntdProviderProps {
  children: React.ReactNode
}

// Tokens mirror the UniSync design system (tokens.json, dark theme — the
// dashboard has no theme toggle, and dark is this system's one shipped web
// theme; see the artifact's patterns.md). Near-grayscale, one indigo accent,
// dense sizing, Inter.
const FONT_FAMILY =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"

export const AntdProvider = ({ children }: AntdProviderProps) => {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: antdTheme.darkAlgorithm,
          token: {
            colorPrimary: '#7b88e8',
            colorPrimaryHover: '#6672d6',
            colorPrimaryActive: '#6672d6',
            colorLink: '#7b88e8',
            colorLinkHover: '#6672d6',
            colorSuccess: '#4ade80',
            colorWarning: '#fbbf24',
            colorError: '#f87171',
            colorTextBase: '#ededef',
            colorText: '#ededef',
            colorTextSecondary: '#9a9aa2',
            colorTextTertiary: '#68686f',
            colorTextDisabled: '#68686f',
            colorBgBase: '#0a0a0b',
            colorBgContainer: '#161618',
            colorBgLayout: '#0a0a0b',
            colorBgElevated: '#161618',
            colorBorder: '#1f1f22',
            colorBorderSecondary: '#1f1f22',
            colorFillAlter: '#0d0d0f',
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            borderRadius: 6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
            boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.5)',
          },
          components: {
            Button: { borderRadius: 6, fontWeight: 600, controlHeight: 32 },
            Input: { borderRadius: 6, controlHeight: 32 },
            InputNumber: { borderRadius: 6, controlHeight: 32 },
            Select: { borderRadius: 6, controlHeight: 32 },
            DatePicker: { borderRadius: 6, controlHeight: 32 },
            Card: { borderRadiusLG: 8 },
            Table: { borderRadiusLG: 8, headerBg: '#0d0d0f' },
            Modal: { borderRadiusLG: 12 },
            Tag: { borderRadiusSM: 4 },
            Layout: {
              headerHeight: 48,
              headerBg: '#161618',
              bodyBg: '#0a0a0b',
              siderBg: '#0d0d0f',
            },
            Menu: {
              itemBg: 'transparent',
              itemColor: '#9a9aa2',
              itemHoverBg: '#181b2e',
              itemHoverColor: '#7b88e8',
              itemSelectedBg: '#181b2e',
              itemSelectedColor: '#7b88e8',
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
