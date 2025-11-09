'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'HOME' },
    { href: '/photography', label: 'PHOTOGRAPHY' },
    { href: '/video', label: 'VIDEO' },
    { href: '/design', label: 'GRAPIC DESIGN' },
    { href: '/about', label: 'ABOUT' },
    { href: '/contact', label: 'CONTACT'}
  ]

  const isAdminPage = pathname?.startsWith('/admin')
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="text-sm md:text-base font-light tracking-wider transition-colors text-white/90 hover:text-white"
          >
            HEET THAKKAR
          </Link>
          {!isAdminPage && (
            <div className="flex gap-6 md:gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs md:text-sm tracking-wider transition-all font-light ${
                    pathname === link.href
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

