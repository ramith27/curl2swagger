'use client'

import { useAuth } from '../lib/auth'
import { Button } from './ui/button'
import { useRouter, usePathname } from 'next/navigation'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Don't show navbar on auth pages
  if (pathname.startsWith('/login')) {
    return null
  }

  return (
    <nav className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">curl2swagger</h1>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user?.name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
