import { ReactNode, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { BookOpenText, BookMarked, LayoutGrid, Users, CalendarClock, GraduationCap, UserPlus, FileBarChart2, LogOut, Menu, Settings, X } from 'lucide-react'
import { TEACHER } from '@/lib/mockData'

interface TeacherLayoutProps { children?: ReactNode }

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
    { path: '/teacher/curriculum', icon: BookMarked, label: 'Curriculum' },
    { path: '/teacher/reports', icon: FileBarChart2, label: 'Reports & Insights' },
  ]
  const isActive = (path: string) => location.pathname === path || (path !== '/teacher' && location.pathname.startsWith(path + '/'))

  return (
    <div className="min-h-screen bg-paper text-ink">
      {sidebarOpen && <button className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-[1px] md:hidden" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-line bg-white px-3 py-4 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2 pb-6 pt-1">
          <button onClick={() => navigate('/teacher')} className="flex items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-800 text-paper"><BookOpenText className="h-5 w-5" /></span><span><span className="block font-display text-xl font-semibold text-green-900">TILP</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">Teacher workspace</span></span></button>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-ink/40 hover:bg-paper md:hidden" aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1" aria-label="Teacher navigation">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">Workspace</p>
          {navItems.map((item) => { const Icon = item.icon; const active = isActive(item.path); return <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false) }} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-green-800 text-paper shadow-sm' : 'text-ink/60 hover:bg-paper hover:text-ink'}`}><Icon className={`h-[18px] w-[18px] ${active ? 'text-paper' : 'text-ink/45 group-hover:text-green-700'}`} />{item.label}</button> })}
        </nav>
        <div className="mt-auto space-y-1 border-t border-line pt-4"><button onClick={() => navigate('/teacher/settings')} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive('/teacher/settings') ? 'bg-green-50 text-green-800' : 'text-ink/60 hover:bg-paper hover:text-ink'}`}><Settings className="h-[18px] w-[18px]" /> Settings</button><button onClick={() => navigate('/')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/55 transition-colors hover:bg-clay-100 hover:text-clay-800"><LogOut className="h-[18px] w-[18px]" /> Sign out</button></div>
      </aside>

      <div className="min-h-screen md:pl-[272px]">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-xl"><div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-7"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-ink/60 hover:bg-white md:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button><div className="hidden sm:block"><p className="text-xs text-ink/40">{TEACHER.institution}</p><p className="font-display text-lg font-semibold">Teaching dashboard</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-line bg-white py-1.5 pl-1.5 pr-3 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 font-display text-sm font-semibold text-green-800">{TEACHER.avatarInitials}</span><div className="hidden sm:block"><div className="text-sm font-semibold text-ink">{TEACHER.name}</div><div className="text-[11px] text-ink/45">{TEACHER.specialization}</div></div></div></div></header>
        <main className="min-h-[calc(100vh-72px)]"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-7 sm:py-8">{children || <Outlet />}</div></main>
      </div>
    </div>
  )
}
