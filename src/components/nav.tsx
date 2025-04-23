"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { StaplerIcon } from "./ui/stapler-icon"

export function Nav() {
  const { user, signOut } = useAuth()
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
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Logo - always visible */}
          <div className="flex items-center flex-1">
            <Link href="/" className="font-semibold text-xl truncate flex items-center">
              <StaplerIcon className="text-rose-600 mr-2" size={28} />
              <span className="hidden lg:inline text-[#ee5d5d]">The Red Stapler</span>
              <span className="lg:hidden text-[#ee5d5d]">Red Stapler</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-4 ml-6">
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
              {user && (
                <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-500">
                  {user.name || user.email}
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
          <div className="lg:hidden">
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="lg:hidden absolute top-16 inset-x-0 z-50 bg-white shadow-lg rounded-b-lg overflow-hidden"
        >
          <div className="px-4 pt-4 pb-6 space-y-6">
            <div className="space-y-2">
              <Link 
                href="/spaces" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/test/list" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                List Space
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-2">
                  <p className="px-3 py-2 text-sm text-gray-500">
                    Signed in as {user.name || user.email}
                  </p>
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary-dark"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
