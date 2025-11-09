import { Raleway, Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} ${inter.variable} font-sans`}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}

