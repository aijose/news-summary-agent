import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Settings, List, Bookmark } from 'lucide-react'
import { DistillIcon } from '@/components/icons/DistillIcon'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/browse', label: 'Browse', icon: List },
    { path: '/reading-list', label: 'Reading List', icon: Bookmark },
    { path: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <DistillIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-neutral-900 block leading-tight">
                    Distill
                  </span>
                  <span className="text-xs text-neutral-500">Pure news, refined by AI</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold min-h-[44px] relative ${
                      isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-neutral-600">
            <p className="text-sm">&copy; 2025 Distill. Pure news, refined by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}