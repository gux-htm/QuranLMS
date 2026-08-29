import { useState } from 'react'
import { Bell, UserPlus, AlertTriangle, TrendingDown, BookOpen, Award } from 'lucide-react'

type Role = 'teacher' | 'student'
type Notice = { id: string; title: string; description: string; time: string; read: boolean; icon: typeof Bell; tone: string }

const teacherItems: Notice[] = [
  { id: 'enroll', title: 'New enrollment request', description: 'Bilal Ahmed wants to join Beginner Juz Reading', time: '2h ago', read: false, icon: UserPlus, tone: 'text-green-700' },
  { id: 'attendance', title: 'Low attendance', description: 'Hassan Ali missed 3 sessions this week', time: '1d ago', read: false, icon: AlertTriangle, tone: 'text-gold-800' },
  { id: 'score', title: 'Score drop', description: "Mariam Khan's average dropped below 70%", time: '2d ago', read: true, icon: TrendingDown, tone: 'text-clay-700' },
]

const studentItems: Notice[] = [
  { id: 'lesson', title: 'New lesson assigned', description: 'Juz 1, Pages 7–9 assigned by your teacher', time: '1h ago', read: false, icon: BookOpen, tone: 'text-green-700' },
  { id: 'badge', title: 'Badge unlocked', description: 'You earned “Bronze Streak”', time: '3d ago', read: true, icon: Award, tone: 'text-gold-800' },
]

export function NotificationBell({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notice[]>(role === 'teacher' ? teacherItems : studentItems)
  const unread = items.some((item) => !item.read)
  const markAllRead = () => setItems((current) => current.map((item) => ({ ...item, read: true })))
  const markRead = (id: string) => setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item))

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="relative rounded-xl p-2 text-ink/60 transition hover:bg-paper-dim hover:text-ink" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unread && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-clay-600 ring-2 ring-paper" />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-paper shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-display font-semibold text-ink">Notifications</span>
            <button onClick={markAllRead} className="text-xs font-medium text-green-700 hover:text-green-900">Mark all read</button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {items.map((item) => {
              const Icon = item.icon
              return <button key={item.id} onClick={() => markRead(item.id)} className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-paper-dim ${item.read ? 'bg-paper' : 'bg-green-50/60'}`}>
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.tone}`} />
                <span className="min-w-0"><span className="block text-sm font-semibold text-ink">{item.title}</span><span className="mt-0.5 block text-xs text-ink/55">{item.description}</span><span className="mt-1 block text-xs text-ink/35">{item.time}</span></span>
              </button>
            })}
          </div>
        </div>
      )}
    </div>
  )
}
