'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const links = [
    { href: '/', label: 'HOME' },
    { href: '/photography', label: 'PHOTOGRAPHY' },
    { href: '/video', label: 'VIDEO' },
    { href: '/design', label: 'GRAPIC DESIGN' },
    { href: '/about', label: 'ABOUT' },
    { href: '/contact', label: 'CONTACT'}
  ]

  const isAdminPage = pathname?.startsWith('/admin')

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])
  
  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm transition-all duration-300"
        style={{
          paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-xs sm:text-sm md:text-base font-light tracking-wider transition-colors text-white/90 hover:text-white min-h-[44px] flex items-center"
            >
              HEET THAKKAR
            </Link>
            {!isAdminPage && (
              <>
                {/* Desktop Navigation - Hidden on mobile */}
                <div className="hidden md:flex gap-6 lg:gap-8">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm tracking-wider transition-all font-light min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        pathname === link.href
                          ? 'text-white'
                          : 'text-white/60 hover:text-white/90'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Hamburger Button - Visible on mobile only */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden flex flex-col justify-center items-center w-10 h-10 min-h-[44px] min-w-[44px] space-y-1.5 focus:outline-none"
                  aria-label="Toggle menu"
                >
                  <motion.span
                    animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="block w-6 h-0.5 bg-white"
                  />
                  <motion.span
                    animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="block w-6 h-0.5 bg-white"
                  />
                  <motion.span
                    animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="block w-6 h-0.5 bg-white"
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsMenuOpen(false)}
              style={{
                paddingTop: 'max(4rem, calc(4rem + env(safe-area-inset-top)))',
              }}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-black z-50 md:hidden shadow-2xl"
              style={{
                paddingTop: 'max(4rem, calc(4rem + env(safe-area-inset-top)))',
                paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom)))',
                paddingLeft: 'max(2rem, calc(2rem + env(safe-area-inset-left)))',
                paddingRight: 'max(2rem, calc(2rem + env(safe-area-inset-right)))',
              }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <h2 className="text-xl font-light tracking-wider text-white/90 mb-1">Menu</h2>
                  <div className="w-12 h-px bg-white/30" />
                </div>
                
                <nav className="flex flex-col space-y-2 flex-1">
                  {links.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block py-4 px-4 text-base tracking-wider font-light transition-all min-h-[48px] flex items-center ${
                          pathname === link.href
                            ? 'text-white border-l-2 border-white'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

