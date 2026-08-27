import { Users, Calendar, ClipboardCheck, AlertTriangle, ArrowRight, UserPlus, FileBarChart2 } from 'lucide-react'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TEACHER, TEACHER_SCHEDULE, today } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export function TeacherDashboard() {
  const navigate = useNavigate()
  const { students, classes, enrollRequests } = useAppStore()

  const totalStudents = students.length
  const avgClassScore = totalStudents
    ? Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / totalStudents)
    : 0
  const needsAttention = [...students].filter((s) => s.avgScore > 0).sort((a, b) => a.avgScore - b.avgScore).slice(0, 3)
  const pendingRequests = enrollRequests.filter((r) => r.status === 'pending').length
  const now = new Date()
  const upcomingSessions = TEACHER_SCHEDULE
    .filter((s) => s.date === format(today, 'yyyy-MM-dd') && new Date(`${s.date}T${s.time}`) > now)
    .sort((a, b) => a.time.localeCompare(b.time))

  const stats = [
    { icon: Users, iconClass: 'text-green-700', value: totalStudents, label: 'Total students' },
    { icon: Calendar, iconClass: 'text-sky-600', value: classes.length, label: 'Active classes' },
    { icon: ClipboardCheck, iconClass: 'text-gold-700', value: `${avgClassScore}%`, label: 'Avg. class score' },
    { icon: UserPlus, iconClass: 'text-clay-700', value: pendingRequests, label: 'Pending enroll requests' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Assalamu alaikum, {TEACHER.name}</h1>
        <p className="mt-1 text-sm text-ink/55">{TEACHER.institution}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="space-y-2">
                <Icon className={`h-8 w-8 ${stat.iconClass}`} />
                <div className="font-display text-2xl font-semibold text-ink">{stat.value}</div>
                <div className="text-sm text-ink/50">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">Today's schedule</CardTitle>
          <CardContent className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <p className="rounded-md border border-line p-4 text-sm text-ink/55">No more classes today. Well done!</p>
            ) : (
              upcomingSessions.slice(0, 4).map((session, index) => (
                <div key={session.id} className="flex items-center gap-3 rounded-md border border-line p-4">
                  <div className="w-16 shrink-0 text-center">
                    <div className="font-display text-sm font-semibold text-ink">{format(new Date(`${session.date}T${session.time}`), 'h:mm a')}</div>
                    <div className="text-xs text-ink/50">{session.duration} min</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{session.studentName}</span>
                      {index === 0 && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">Next up</span>}
                    </div>
                    <div className="truncate text-xs text-ink/55">{session.className} • {session.lessonTitle}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { window.open(session.meetUrl, '_blank'); navigate(`/teacher/schedule/${session.id}`) }}>Join</Button>
                </div>
              ))
            )}
            <button onClick={() => navigate('/teacher/schedule')} className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800">
              View full schedule
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="mb-4">Students needing attention</CardTitle>
          <CardContent className="space-y-3">
            {needsAttention.length === 0 ? (
              <p className="rounded-md border border-line p-4 text-sm text-ink/55">No students currently flagged.</p>
            ) : needsAttention.map((student) => (
              <div key={student.id} className="flex items-center gap-3 rounded-md border border-line p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-clay-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink">{student.name}</div>
                  <div className="text-xs text-ink/55">{student.avgScore}% avg score • {student.streak}-day streak</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/teacher/students/' + student.id)}>Review</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-4">Quick actions</CardTitle>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/teacher/classes')}>Manage classes</Button>
          <Button variant="secondary" onClick={() => navigate('/teacher/students')}>View students</Button>
          <Button variant="secondary" onClick={() => navigate('/teacher/enrollments')}>Review enroll requests</Button>
          <Button variant="outline" onClick={() => navigate('/teacher/reports')}>
            <FileBarChart2 className="mr-1.5 h-4 w-4" />
            Reports & insights
          </Button>
        </div>
      </Card>
    </div>
  )
}
