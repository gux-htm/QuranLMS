import { useMemo, useState } from 'react'
import { BookOpen, ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { StatCards } from '@/components/ui/StatCards'
import { useAppStore } from '@/lib/store'
import { CURRENT_STUDENT as STUDENT } from '@/lib/mockData'

type AssignmentStatus = 'pending' | 'in_progress' | 'completed'

type Assignment = {
  id: string
  name: string // Custom assignment name from teacher
  curriculumTitle: string // Original curriculum title
  assignedDate: string
  deadline: string | null
  status: AssignmentStatus
  score?: number
  notes: string
}

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
  const { lessonAssignments, lessonProgress } = useAppStore()

  // Get assignments for current student
  const studentId = STUDENT.id
  const myAssignments = useMemo<Assignment[]>(() => {
    return lessonAssignments
      .filter((a) => a.studentIds.includes(studentId))
      .map((a) => {
        const progress = lessonProgress[a.id]
        const isCompleted = progress === 100
        const isPending = !progress || progress === 0
        return {
          id: a.id,
          name: a.assignmentName,
          curriculumTitle: a.curriculumTitle,
          assignedDate: format(new Date(a.assignedAt), 'MMM d'),
          deadline: a.deadline ? format(new Date(a.deadline), 'MMM d') : null,
          status: (isCompleted ? 'completed' : isPending ? 'pending' : 'in_progress') as AssignmentStatus,
          notes: a.notes,
          score: undefined, // TODO: link to session scores when available
        }
      })
  }, [lessonAssignments, lessonProgress, studentId])

  const list = useMemo(() => {
    if (tab === 'All') return myAssignments
    if (tab === 'Pending') return myAssignments.filter((a) => a.status !== 'completed')
    return myAssignments.filter((a) => a.status === 'completed')
  }, [tab, myAssignments])

  const actionLabel = (status: AssignmentStatus) =>
    status === 'pending' ? 'Start lesson' : status === 'in_progress' ? 'Continue' : 'Review'

  const counts = {
    Pending: myAssignments.filter((a) => a.status !== 'completed').length,
    Completed: myAssignments.filter((a) => a.status === 'completed').length,
    All: myAssignments.length,
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Assignments</h1>
        <p className="mt-1 text-sm text-ink/55">Keep track of lessons your teacher has assigned.</p>
      </div>

      {/* Summary stat cards */}
      <StatCards stats={[
        { icon: ClipboardList, label: 'Pending', value: counts.Pending, tone: 'bg-gold-100 text-gold-700', detail: 'Awaiting your completion' },
        { icon: ClipboardList, label: 'In progress', value: myAssignments.filter((a) => a.status === 'in_progress').length, tone: 'bg-sky-100 text-sky-600', detail: 'Started but not finished' },
        { icon: ClipboardList, label: 'Completed', value: counts.Completed, tone: 'bg-green-50 text-green-700', detail: 'Finished assignments' },
      ]} cols={3} />

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
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-ink">{a.name}</div>
                      <div className="mt-0.5 text-xs text-ink/40">{a.curriculumTitle}</div>
                      <div className="mt-1 text-xs text-ink/50">
                        Assigned {a.assignedDate}
                        {a.deadline && ` · Due ${a.deadline}`}
                      </div>
                      {a.notes && (
                        <div className="mt-1.5 text-xs italic text-ink/60">
                          "{a.notes}"
                        </div>
                      )}
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
