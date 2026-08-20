import { BookOpenText, Users, Calendar, ClipboardCheck } from 'lucide-react'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TEACHER, CLASSES } from '@/lib/mockData'
import { useNavigate } from 'react-router-dom'

export function TeacherDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Assalamu alaikum, {TEACHER.name}</h1>
        <p className="mt-1 text-sm text-ink/55">{TEACHER.institution}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-2">
            <Users className="h-8 w-8 text-green-700" />
            <div className="font-display text-2xl font-semibold text-ink">23</div>
            <div className="text-sm text-ink/50">Total students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <Calendar className="h-8 w-8 text-sky-600" />
            <div className="font-display text-2xl font-semibold text-ink">3</div>
            <div className="text-sm text-ink/50">Active classes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <ClipboardCheck className="h-8 w-8 text-gold-700" />
            <div className="font-display text-2xl font-semibold text-ink">87%</div>
            <div className="text-sm text-ink/50">Avg. class score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <BookOpenText className="h-8 w-8 text-clay-700" />
            <div className="font-display text-2xl font-semibold text-ink">12</div>
            <div className="text-sm text-ink/50">Lessons assigned</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-4">Your classes</CardTitle>
        <CardContent className="space-y-3">
          {CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => navigate(`/teacher/classes/${cls.id}`)}
              className="block w-full rounded-md border border-line p-4 text-left hover:bg-paper-dim"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-ink">{cls.name}</h3>
                  <p className="text-sm text-ink/55">{cls.studentCount} students • {cls.avgScore}% avg score</p>
                </div>
                <span className="text-sm font-semibold text-green-700">{cls.status}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardTitle className="mb-4">Quick actions</CardTitle>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/teacher/classes')}>Manage classes</Button>
          <Button variant="secondary" onClick={() => navigate('/teacher/attendance')}>Mark attendance</Button>
          <Button variant="secondary" onClick={() => navigate('/teacher/lessons')}>Create lesson</Button>
        </div>
      </Card>
    </div>
  )
}
