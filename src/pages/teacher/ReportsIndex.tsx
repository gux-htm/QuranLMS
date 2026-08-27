import { BarChart3, FileText, Users } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { useNavigate } from 'react-router-dom'

export function TeacherReportsIndex() {
  const navigate = useNavigate()
  const { students, classes } = useAppStore()
  const avgScore = students.length
    ? Math.round(students.reduce((sum, student) => sum + student.avgScore, 0) / students.length)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Reports & insights</h1>
        <p className="mt-1 text-sm text-ink/55">
          Review class performance and open detailed student reports.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent><Users className="mb-2 h-7 w-7 text-green-700" /><div className="font-display text-2xl font-semibold text-ink">{students.length}</div><div className="text-sm text-ink/55">Students tracked</div></CardContent></Card>
        <Card><CardContent><BarChart3 className="mb-2 h-7 w-7 text-sky-600" /><div className="font-display text-2xl font-semibold text-ink">{avgScore}%</div><div className="text-sm text-ink/55">Average score</div></CardContent></Card>
        <Card><CardContent><FileText className="mb-2 h-7 w-7 text-gold-700" /><div className="font-display text-2xl font-semibold text-ink">{classes.length}</div><div className="text-sm text-ink/55">Classes with analytics</div></CardContent></Card>
      </div>

      <Card>
        <CardTitle className="mb-4">Class analytics</CardTitle>
        <CardContent className="space-y-3">
          {classes.map((classItem) => (
            <div key={classItem.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line p-4">
              <div>
                <div className="font-medium text-ink">{classItem.name}</div>
                <div className="text-sm text-ink/55">Open performance trends, top performers, and common learning issues.</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/classes/${classItem.id}/analytics`)}>
                View analytics
              </Button>
            </div>
          ))}
          {classes.length === 0 && <p className="text-sm text-ink/55">No classes available yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardTitle className="mb-4">Student reports</CardTitle>
        <CardContent className="space-y-3">
          {students.map((student) => (
            <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line p-4">
              <div>
                <div className="font-medium text-ink">{student.name}</div>
                <div className="text-sm text-ink/55">{student.avgScore}% average • {student.streak}-day streak</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/students/${student.id}/reports`)}>
                Open report
              </Button>
            </div>
          ))}
          {students.length === 0 && <p className="text-sm text-ink/55">No students available yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
