import { useMemo, useState } from 'react'
import { CheckCircle2, CircleDot, Clock, Plus, CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TEACHER_SCHEDULE, today } from '@/lib/mockData'
import type { ScheduledSession } from '@/lib/store'
import { addDays, format, startOfWeek } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { ScheduleSessionModal } from '@/components/teacher/ScheduleSessionModal'

type SessionStatus = 'completed' | 'in-progress' | 'upcoming'
type ScheduleEntry = (typeof TEACHER_SCHEDULE)[number] | ScheduledSession
const statusStyles: Record<SessionStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-paper-dim text-ink/50' },
  'in-progress': { label: 'In progress', className: 'bg-green-50 text-green-700' },
  upcoming: { label: 'Upcoming', className: 'bg-sky-100 text-sky-700' },
}

export function TeacherSchedule() {
  const navigate = useNavigate()
  const { scheduledSessions } = useAppStore()
  const [view, setView] = useState<'today' | 'week'>('today')
  const [modalOpen, setModalOpen] = useState(false)
  const now = new Date()
  const allSessions = useMemo<ScheduleEntry[]>(() => [...TEACHER_SCHEDULE, ...scheduledSessions], [scheduledSessions])
  const withStatus = (session: ScheduleEntry) => {
    const start = new Date(`${session.date}T${session.time}`)
    const end = new Date(start.getTime() + session.duration * 60000)
    const status: SessionStatus = now >= end ? 'completed' : now >= start ? 'in-progress' : 'upcoming'
    return { ...session, start, status }
  }
  const todaysSchedule = allSessions.filter((s) => s.date === format(today, 'yyyy-MM-dd')).sort((a, b) => a.time.localeCompare(b.time)).map(withStatus)
  const nextSessionId = todaysSchedule.find((s) => s.status === 'upcoming')?.id
  const joinSession = (session: ScheduleEntry) => {
    if (session.meetUrl) window.open(session.meetUrl, '_blank')
    navigate(`/teacher/schedule/${session.id}`)
  }
  const SessionCard = ({ session }: { session: ReturnType<typeof withStatus> }) => {
    const status = statusStyles[session.status]
    const isNext = session.id === nextSessionId
    const isTeacherSession = TEACHER_SCHEDULE.some((item) => item.id === session.id)
    return <Card className={isNext ? 'border-green-300' : undefined}><div className="flex flex-wrap items-center gap-4"><div className="w-20 shrink-0"><div className="font-display text-lg font-semibold text-ink">{format(session.start, 'h:mm a')}</div><div className="text-xs text-ink/50">{session.duration} min</div></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-medium text-ink">{session.studentName ?? session.className}</span>{isNext && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">Next up</span>}</div><div className="text-sm text-ink/55">{session.className} • {session.lessonTitle}</div></div><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{session.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : session.status === 'in-progress' ? <CircleDot className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}{status.label}</span>{session.status !== 'completed' && <Button size="sm" onClick={() => joinSession(session)}>Join</Button>} {isTeacherSession && <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/schedule/${session.id}`)}>Mark attendance</Button>}{isTeacherSession && <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/sessions/${session.id}/lesson`)}>Lesson view</Button>}</div></Card>
  }
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  return <div className="space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-2xl font-semibold text-ink">{view === 'today' ? "Today's schedule" : 'This week'}</h1><p className="mt-1 text-sm text-ink/55">{view === 'today' ? `${format(today, 'EEEE, MMMM d, yyyy')} • ${todaysSchedule.length} sessions` : 'Sessions for the current week'}</p></div><Button onClick={() => setModalOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Schedule session</Button></div><div className="inline-flex rounded-lg border border-line bg-paper-dim/50 p-1"><button onClick={() => setView('today')} className={`rounded-md px-3 py-1.5 text-sm ${view === 'today' ? 'bg-white font-medium text-ink shadow-sm' : 'text-ink/55'}`}>Today</button><button onClick={() => setView('week')} className={`rounded-md px-3 py-1.5 text-sm ${view === 'week' ? 'bg-white font-medium text-ink shadow-sm' : 'text-ink/55'}`}>This week</button></div>{view === 'today' ? (todaysSchedule.length === 0 ? <Card><div className="py-6 text-center"><CalendarDays className="mx-auto mb-2 h-7 w-7 text-ink/35" /><p className="text-sm text-ink/55">No sessions scheduled</p><p className="mt-1 text-xs text-ink/45">Schedule a live class to track attendance and score students.</p><Button className="mt-3" size="sm" onClick={() => setModalOpen(true)}>Schedule session</Button></div></Card> : <div className="space-y-3">{todaysSchedule.map((session) => <SessionCard key={session.id} session={session} />)}</div>) : <div className="space-y-5">{weekDays.map((day) => { const key = format(day, 'yyyy-MM-dd'); const sessions = allSessions.filter((s) => s.date === key).sort((a, b) => a.time.localeCompare(b.time)).map(withStatus); return <section key={key} className="space-y-2"><h2 className="font-display text-lg font-semibold text-ink">{format(day, 'EEEE, MMM d')}</h2>{sessions.length ? sessions.map((session) => <SessionCard key={session.id} session={session} />) : <div className="rounded-lg border border-dashed border-line px-4 py-3 text-sm text-ink/45">No sessions</div>}</section> })}</div>}<ScheduleSessionModal open={modalOpen} onClose={() => setModalOpen(false)} /></div>
}
