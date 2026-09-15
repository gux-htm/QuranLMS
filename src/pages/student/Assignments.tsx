import { useMemo, useState } from 'react'
import { BookOpen, ClipboardList, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'

type AssignmentStatus = 'pending' | 'in_progress' | 'completed'
type Assignment = {
  id: string
  title: string
  assigned: string
  deadline: string
  status: AssignmentStatus
  score?: number
}

const assignments: Assignment[] = [
  { id: '1', title: 'Juz 1 · Pages 7–9', assigned: 'Today', deadline: 'Tomorrow', status: 'pending' },
  { id: '2', title: 'Juz 1 · Pages 4–6', assigned: 'Aug 20', deadline: 'Aug 27', status: 'completed', score: 92 },
  { id: '3', title: 'Noorani Qaida · Lesson 12', assigned: 'Aug 12', deadline: 'Aug 19', status: 'in_progress' },
]

const STATUS_CONFIG: Record<AssignmentStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-gold-100 text-gold-800' },
  in_progress: { label: 'In progress', classes: 'bg-sky-100 text-sky-700' },
  completed: { label: 'Completed', classes: 'bg-green-50 text-green-700' },
}

const tabs = ['Pending', 'Completed', 'All'] as const
type Tab = (typeof tabs)[number]

export function StudentAssignments() {
  const [tab, setTab] = useState<Tab>('Pending')
  const navigate = useNavigate()

  const list = useMemo(() => {
    if (tab === 'All') return assignments
    if (tab === 'Pending') return assignments.filter((a) => a.status !== 'completed')
    return assignments.filter((a) => a.status === 'completed')
  }, [tab])

  const actionLabel = (status: AssignmentStatus) =>
    status === 'pending' ? 'Start lesson' : status === 'in_progress' ? 'Continue' : 'Review'

  const counts = {
    Pending: assignments.filter((a) => a.status !== 'completed').length,
    Completed: assignments.filter((a) => a.status === 'completed').length,
    All: assignments.length,
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Assignments</h1>
        <p className="mt-1 text-sm text-ink/55">Keep track of lessons your teacher has assigned.</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending', value: counts.Pending, tone: 'bg-gold-100 text-gold-700', detail: 'Awaiting your completion' },
          { label: 'In progress', value: assignments.filter((a) => a.status === 'in_progress').length, tone: 'bg-sky-100 text-sky-600', detail: 'Started but not finished' },
          { label: 'Completed', value: counts.Completed, tone: 'bg-green-50 text-green-700', detail: 'Finished assignments' },
        ].map((stat) => (
          <Card key={stat.label} className="group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="space-y-0">
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.tone}`}>
                  <ClipboardList className="h-5 w-5" />
                </span>
                <TrendingUp className="h-4 w-4 text-ink/15 transition-colors group-hover:text-green-500" />
              </div>
              <div className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">{stat.value}</div>
              <div className="mt-1 text-sm font-semibold text-ink">{stat.label}</div>
              <div className="mt-1 text-xs text-ink/45">{stat.detail}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignment list */}
      <Card className="p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Assignment list</CardTitle>
            <p className="mt-1 text-sm text-ink/50">Your teacher-assigned lessons.</p>
          </div>
          {/* Tab selector */}
          <div className="inline-flex rounded-xl border border-line bg-paper-dim p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  tab === t ? 'bg-white text-green-700 shadow-sm' : 'text-ink/55 hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="space-y-3">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-7 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-ink/25" />
              <p className="mt-2 font-medium text-ink">Nothing here yet.</p>
              <p className="mt-1 text-sm text-ink/50">
                {tab === 'Completed'
                  ? "You haven't completed any assignments yet."
                  : "Your teacher hasn't assigned any lessons yet."}
              </p>
            </div>
          ) : (
            list.map((a) => {
              const status = STATUS_CONFIG[a.status]
              return (
                <div
                  key={a.id}
                  className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-green-200 hover:bg-green-50/20 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${status.classes}`}>
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-ink">{a.title}</div>
                      <div className="mt-0.5 text-xs text-ink/50">
                        Assigned {a.assigned} · Due {a.deadline}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}>
                      {status.label}
                      {a.score ? ` · ${a.score}/100` : ''}
                    </span>
                    <Button
                      size="sm"
                      variant={a.status === 'completed' ? 'outline' : 'default'}
                      onClick={() => navigate(`/student/lesson/${a.id}`)}
                    >
                      {actionLabel(a.status)}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
