"use client";

import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";

interface AntdProviderProps {
  children: React.ReactNode;
}

export const AntdProvider = ({ children }: AntdProviderProps) => {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          components: {
            Button: {
              borderRadius: 0,
            },
            Input: {
              borderRadius: 0,
            },
            InputNumber: {
              borderRadius: 0,
            },
            Select: {
              borderRadius: 0,
            },
            DatePicker: {
              borderRadius: 0,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
};
