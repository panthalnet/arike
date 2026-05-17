import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/theme/modern.css'
import '@/styles/theme/glassmorphism.css'
import '@/styles/layout/bento_grid.css'
import { ThemeProvider } from '@/components/theme-provider'
import { getThemeSettings } from '@/services/theme_service'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  title: 'Arike - Your Personal Dashboard',
  description: 'Self-hosted browser startup page and personal dashboard',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Arike',
    description: 'Self-hosted browser startup page and personal dashboard',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Arike — Your Personal Dashboard' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Arike',
    statusBarStyle: 'black-translucent',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch theme settings for server-side rendering
  const settings = await getThemeSettings()

  return (
    <html lang="en" data-theme={settings.selectedTheme} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
