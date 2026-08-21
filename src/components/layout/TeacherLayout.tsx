import { ReactNode, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { BookOpenText, LayoutGrid, Users, CalendarClock, GraduationCap, UserPlus, LogOut, ChevronDown, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TEACHER } from '@/lib/mockData'

interface TeacherLayoutProps {
  children?: ReactNode
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/teacher', icon: LayoutGrid, label: 'Dashboard' },
    { path: '/teacher/schedule', icon: CalendarClock, label: 'Schedule' },
    { path: '/teacher/students', icon: GraduationCap, label: 'Students' },
    { path: '/teacher/classes', icon: Users, label: 'Classes' },
    { path: '/teacher/enrollments', icon: UserPlus, label: 'Enroll Requests' },
  ]

  const isActive = (path: string) =>
    location.pathname === path || (path.includes('/', 1) && location.pathname.startsWith(path + '/'))

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className={`fixed inset-y-14 left-0 z-20 w-56 border-r border-line bg-white transition-transform md:sticky md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(item.path)
                    ? 'bg-green-50 text-green-700'
                    : 'text-ink/60 hover:bg-paper-dim'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-line bg-white">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center gap-2 font-display text-lg font-semibold text-green-900">
                <BookOpenText className="h-6 w-6 text-green-700" />
                TILP
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-ink">{TEACHER.name}</div>
                <div className="text-xs text-ink/50">{TEACHER.institution}</div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="rounded-full bg-paper-dim p-2 hover:bg-line"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}
