"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { useSession, signOut } from "next-auth/react"
import { Menu, X } from "lucide-react"

export function Nav() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    // Close menu when pressing escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    // Prevent scrolling when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <nav className="border-b relative z-50">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        {/* Logo - always visible */}
        <div className="flex items-center flex-1">
          <Link href="/" className="font-semibold text-xl truncate">
            <span className="md:inline">WorkSpace Share</span>
            <span className="md:hidden">WS Share</span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4 ml-6">
            <Link href="/spaces" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Browse
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              About Us
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/test/list" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              List Space
            </Link>
          </div>
        </div>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {session?.user ? (
            <>
              <span className="text-sm text-gray-500">
                {session.user.name || session.user.email}
              </span>
              <Button variant="ghost" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu - Conditional Rendering with Backdrop */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-40" aria-hidden="true" />
          
          {/* Mobile Menu */}
          <div 
            id="mobile-menu"
            ref={menuRef}
            className="absolute top-16 inset-x-0 md:hidden bg-white shadow-lg z-50"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link 
                href="/spaces" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Browse
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <Link 
                href="/test/list" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                List Space
              </Link>
            </div>
            
            {/* Mobile Auth Section */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {session?.user ? (
                <div className="px-4 space-y-3">
                  <div className="text-base font-medium text-gray-800">
                    {session.user.name || session.user.email}
                  </div>
                  <button 
                    onClick={() => {
                      signOut()
                      toggleMenu()
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-4 space-y-3 pb-4">
                  <Link 
                    href="/signin" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={toggleMenu}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block rounded-md text-base font-medium bg-primary text-white hover:bg-primary/90 py-3 px-4 text-center"
                    onClick={toggleMenu}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
