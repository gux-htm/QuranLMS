import { useState } from 'react'
import { AlertTriangle, Award, Bell, BookOpen, TrendingDown, UserPlus } from 'lucide-react'

type Role = 'teacher' | 'student'
const teacherItems = [
  { icon: UserPlus, title: 'New enrollment request', description: 'Bilal Ahmed wants to join Beginner Juz Reading', time: '2h ago', unread: true, color: 'text-green-700' },
  { icon: AlertTriangle, title: 'Low attendance', description: 'Hassan Ali missed 3 sessions this week', time: '1d ago', unread: true, color: 'text-gold-700' },
  { icon: TrendingDown, title: 'Score drop', description: "Mariam Khan's avg dropped below 70%", time: '2d ago', unread: false, color: 'text-clay-700' },
]
const studentItems = [
  { icon: BookOpen, title: 'New lesson assigned', description: 'Juz 1, Pages 7–9 assigned by your teacher', time: '1h ago', unread: true, color: 'text-green-700' },
  { icon: Award, title: 'Badge unlocked', description: 'You earned “Bronze Streak”', time: '3d ago', unread: false, color: 'text-gold-700' },
]
export function NotificationsPanel({ role }: { role: Role }) {
  const [open, setOpen] = useState(false); const [items, setItems] = useState(role === 'teacher' ? teacherItems : studentItems); const unread = items.some((item) => item.unread)
  return <div className="relative"><button onClick={() => setOpen((v) => !v)} className="relative rounded-xl p-2 text-ink/55 hover:bg-paper-dim" aria-label="Notifications"><Bell className="h-5 w-5" />{unread && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-clay-500 ring-2 ring-paper" />}</button>{open && <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-line bg-paper shadow-lg"><div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="font-display text-base font-semibold text-ink">Notifications</span><button onClick={() => setItems((prev) => prev.map((item) => ({ ...item, unread: false })))} className="text-xs font-medium text-green-700 hover:text-green-800">Mark all read</button></div><div className="max-h-[70vh] overflow-y-auto p-2">{items.map((item, index) => { const Icon = item.icon; return <button key={item.title} onClick={() => setItems((prev) => prev.map((entry, i) => i === index ? { ...entry, unread: false } : entry))} className={`flex w-full gap-3 rounded-xl p-3 text-left transition-colors ${item.unread ? 'bg-green-50/60' : 'bg-paper hover:bg-paper-dim/60'}`}><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.color}`} /><span className="min-w-0"><span className="block text-sm font-semibold text-ink">{item.title}</span><span className="mt-0.5 block text-xs leading-5 text-ink/55">{item.description}</span><span className="mt-1 block text-xs text-ink/35">{item.time}</span></span></button> })}</div></div>}</div>
}
