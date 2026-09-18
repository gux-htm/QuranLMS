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
  console.log('[TeacherSchedule] Component rendering...')
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
    // Navigate FIRST to the lesson page, THEN user can click "Join Meet" from there
    // This prevents React state corruption from window.open breaking navigation
    const isTeacher = TEACHER_SCHEDULE.some((item) => item.id === session.id)
    navigate(isTeacher ? `/teacher/sessions/${session.id}/lesson` : `/teacher/schedule/${session.id}`)
  }
  const SessionCard = ({ session }: { session: ReturnType<typeof withStatus> }) => {
    const status = statusStyles[session.status]
    const isNext = session.id === nextSessionId
    const isTeacherSession = TEACHER_SCHEDULE.some((item) => item.id === session.id)
    return (
      <Card className={`p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${isNext ? 'border-green-200 bg-green-50/30' : ''}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-paper py-2.5">
            <div className="font-display text-base font-semibold text-ink">{format(session.start, 'h:mm a')}</div>
            <div className="text-[11px] text-ink/45">{session.duration} min</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">{session.studentName ?? session.className}</span>
              {isNext && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-800">Next up</span>}
            </div>
            <div className="mt-0.5 text-xs text-ink/50">{session.className} · {session.lessonTitle}</div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
            {session.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : session.status === 'in-progress' ? <CircleDot className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {status.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {session.status !== 'completed' && <Button size="sm" onClick={() => joinSession(session)}>Join class</Button>}
            {session.status === 'completed' && isTeacherSession && <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/sessions/${session.id}/lesson`)}>Lesson view</Button>}
          </div>
        </div>
      </Card>
    )
  }
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  return <div className="space-y-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{view === 'today' ? "Today's schedule" : 'This week'}</h1>
        <p className="mt-1 text-sm text-ink/55">{view === 'today' ? `${format(today, 'EEEE, MMMM d, yyyy')} · ${todaysSchedule.length} sessions` : 'Sessions for the current week'}</p>
      </div>
      <Button onClick={() => setModalOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Schedule session</Button>
    </div>
    <div className="inline-flex rounded-xl border border-line bg-paper-dim/50 p-1">
      <button onClick={() => setView('today')} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150 ${view === 'today' ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'}`}>Today</button>
      <button onClick={() => setView('week')} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150 ${view === 'week' ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'}`}>This week</button>
    </div>
    {view === 'today' ? (todaysSchedule.length === 0
      ? <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-12 text-center"><CalendarDays className="mx-auto h-7 w-7 text-ink/25" /><p className="mt-3 font-medium text-ink">Your day is clear</p><p className="mt-1 text-sm text-ink/50">No sessions scheduled for today.</p><Button className="mt-5" size="sm" onClick={() => setModalOpen(true)}>Schedule session</Button></div>
      : <div className="space-y-3">{todaysSchedule.map((session) => <SessionCard key={session.id} session={session} />)}</div>)
    : <div className="space-y-6">{weekDays.map((day) => { const key = format(day, 'yyyy-MM-dd'); const sessions = allSessions.filter((s) => s.date === key).sort((a, b) => a.time.localeCompare(b.time)).map(withStatus); return <section key={key} className="space-y-3"><h2 className="font-display text-base font-semibold text-ink">{format(day, 'EEEE, MMM d')}</h2>{sessions.length ? sessions.map((session) => <SessionCard key={session.id} session={session} />) : <div className="rounded-2xl border border-dashed border-line px-5 py-4 text-sm text-ink/40">No sessions</div>}</section> })}</div>}
    <ScheduleSessionModal open={modalOpen} onClose={() => setModalOpen(false)} />
  </div>
}
