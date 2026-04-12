import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { getThemeSettings } from '@/services/theme_service'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arike - Your Personal Dashboard',
  description: 'Self-hosted browser startup page and personal dashboard',
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
