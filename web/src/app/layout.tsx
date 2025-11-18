import type { Metadata } from 'next'
import { ApolloProvider } from '@/providers/Apollo'
import { AntdProvider } from '@/providers/Antd'
import './globals.css'

export const metadata: Metadata = {
  title: 'Unisync',
  description: 'unisync',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any' },
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/favicon/site.webmanifest',
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang='en'>
      <body>
        <AntdProvider>
          <ApolloProvider>{children}</ApolloProvider>
        </AntdProvider>
      </body>
    </html>
  )
}
export default RootLayout
