import { CheckCircle2, CircleDot, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TEACHER_SCHEDULE, today } from '@/lib/mockData'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

type SessionStatus = 'completed' | 'in-progress' | 'upcoming'

const statusStyles: Record<SessionStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-paper-dim text-ink/50' },
  'in-progress': { label: 'In progress', className: 'bg-green-50 text-green-700' },
  upcoming: { label: 'Upcoming', className: 'bg-sky-100 text-sky-700' },
}

export function TeacherSchedule() {
  const navigate = useNavigate()
  const now = new Date()

  const joinSession = (session: { id: string; meetUrl: string }) => {
    // Open Google Meet in a new tab, and today's lesson (resume point) in this tab
    window.open(session.meetUrl, '_blank')
    navigate(`/teacher/schedule/${session.id}`)
  }

  const todaysSchedule = TEACHER_SCHEDULE
    .filter((s) => s.date === format(today, 'yyyy-MM-dd'))
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((session) => {
      const start = new Date(`${session.date}T${session.time}`)
      const end = new Date(start.getTime() + session.duration * 60000)
      const status: SessionStatus = now >= end ? 'completed' : now >= start ? 'in-progress' : 'upcoming'
      return { ...session, start, status }
    })

  const nextSessionId = todaysSchedule.find((s) => s.status === 'upcoming')?.id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Today's schedule</h1>
        <p className="mt-1 text-sm text-ink/55">
          {format(today, 'EEEE, MMMM d, yyyy')} • {todaysSchedule.length} sessions
        </p>
      </div>

      {todaysSchedule.length === 0 ? (
        <Card>
          <p className="text-sm text-ink/55">No classes scheduled today.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {todaysSchedule.map((session) => {
            const status = statusStyles[session.status]
            const isNext = session.id === nextSessionId
            return (
              <Card key={session.id} className={isNext ? 'border-green-300' : undefined}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-20 shrink-0">
                    <div className="font-display text-lg font-semibold text-ink">
                      {format(session.start, 'h:mm a')}
                    </div>
                    <div className="text-xs text-ink/50">{session.duration} min</div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{session.studentName}</span>
                      {isNext && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Next up
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-ink/55">
                      {session.className} • {session.lessonTitle}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                  >
                    {session.status === 'completed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : session.status === 'in-progress' ? (
                      <CircleDot className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {status.label}
                  </span>

                  {session.status !== 'completed' && (
                    <Button size="sm" onClick={() => joinSession(session)}>
                      Join
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/sessions/${session.id}/lesson`)}>
                    Lesson view
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
