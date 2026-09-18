import { BarChart3, FileText, Users } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatCards } from '@/components/ui/StatCards'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { today } from '@/lib/mockData'
import { ShareReportButton } from '@/components/teacher/ShareReportButton'
export function TeacherReportsIndex() {
  const navigate = useNavigate()
  const { students, classes } = useAppStore()
  const avgScore = students.length ? Math.round(students.reduce((sum, student) => sum + student.avgScore, 0) / students.length) : 0
  const date = format(today, 'yyyy-MM-dd')

  const stats = [
    { icon: Users, tone: 'bg-green-50 text-green-700', value: students.length, label: 'Students tracked', detail: 'Across all active classes' },
    { icon: BarChart3, tone: 'bg-sky-100 text-sky-600', value: `${avgScore}%`, label: 'Average score', detail: 'Based on recorded sessions' },
    { icon: FileText, tone: 'bg-gold-100 text-gold-700', value: classes.length, label: 'Classes with analytics', detail: 'Groups with recorded data' },
  ]

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Reports & insights</h1>
        <p className="mt-1 text-sm text-ink/55">Review class performance and open detailed student reports.</p>
      </div>

      <StatCards stats={stats} cols={3} />

      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><CardTitle>Class analytics</CardTitle><p className="mt-1 text-sm text-ink/50">Performance trends and learner insights per class.</p></div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600"><BarChart3 className="h-4 w-4" /></span>
        </div>
        <div className="space-y-2">
          {classes.length === 0
            ? <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink/50">No classes available yet.</div>
            : classes.map((classItem) => (
              <div key={classItem.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4 transition-colors hover:border-green-200 hover:bg-green-50/20">
                <div>
                  <div className="text-sm font-semibold text-ink">{classItem.name}</div>
                  <div className="mt-0.5 text-xs text-ink/50">Performance trends, top performers, and common learning issues.</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/classes/${classItem.id}/analytics`)}>View analytics</Button>
              </div>
            ))
          }
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><CardTitle>Student reports</CardTitle><p className="mt-1 text-sm text-ink/50">Individual session history and performance summaries.</p></div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-700"><FileText className="h-4 w-4" /></span>
        </div>
        <div className="space-y-2">
          {students.length === 0
            ? <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink/50">No students available yet.</div>
            : students.map((student) => (
              <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4 transition-colors hover:border-green-200 hover:bg-green-50/20">
                <div>
                  <div className="text-sm font-semibold text-ink">{student.name}</div>
                  <div className="mt-0.5 text-xs text-ink/50">{student.avgScore}% average · {student.streak}-day streak</div>
                </div>
                <div className="flex gap-2">
                  <ShareReportButton studentId={student.id} studentName={student.name} date={date} />
                  <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/students/${student.id}/reports`)}>Open report</Button>
                </div>
              </div>
            ))
          }
        </div>
      </Card>
    </div>
  )
}
