import { Raleway, Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import SearchFab from '@/components/SearchFab'

const raleway = Raleway({ 
  subsets: ['latin'],
  variable: '--font-raleway',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Portfolio',
  description: 'Photography, Video, and Design Portfolio',
  other: {
    'cache-control': 'no-store, no-cache, must-revalidate',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // For iPhone safe areas
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} ${inter.variable} font-sans`}>
        <Navigation />
        {children}
        <SearchFab />
      </body>
    </html>
  )
}

