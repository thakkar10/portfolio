'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/photography', label: 'Photography' },
    { href: '/video', label: 'Video' },
    { href: '/design', label: 'Graphic Design' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact'}
  ]

  const isAdminPage = pathname?.startsWith('/admin')
  
  return (
    <nav
      className="fixed left-0 right-0 top-0 z-40"
      style={{
        paddingTop: 'max(0.85rem, env(safe-area-inset-top))',
        paddingLeft: 'max(0.85rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.85rem, env(safe-area-inset-right))',
      }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="relative overflow-hidden border border-white/12 bg-black/55 px-3 py-2 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:px-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          <div className="flex items-center justify-between gap-3">
          <Link 
            href="/" 
            className="group flex min-h-[38px] items-center whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.22em] text-white/90 transition-colors hover:text-white sm:text-xs"
          >
            HEET THAKKAR
            <span className="ml-3 hidden h-px w-8 bg-white/25 transition-colors group-hover:bg-white/60 sm:block" />
          </Link>
          {!isAdminPage && (
            <div className="hidden items-center gap-1 lg:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex min-h-[38px] items-center px-4 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                    pathname === link.href
                      ? 'text-white'
                      : 'text-white/52 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-1.5 left-4 right-4 h-px origin-left bg-white transition-transform duration-300 ${
                      pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              ))}
            </div>
          )}

          {!isAdminPage && (
            <div className="hidden min-h-[38px] items-center text-[10px] uppercase tracking-[0.2em] text-white/42 md:flex lg:hidden">
              Portfolio Index
            </div>
          )}
          </div>

          {!isAdminPage && (
            <div className="mt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
              <div className="flex min-w-max items-center gap-1">
                {links.filter((link) => link.href !== '/').map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex min-h-[36px] items-center border px-2 text-[9px] font-medium uppercase tracking-[0.14em] transition-all ${
                      pathname === link.href
                        ? 'border-white/55 bg-white text-black'
                        : 'border-white/10 text-white/62 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {link.href === '/photography' ? 'Photo' : link.href === '/design' ? 'Design' : link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
