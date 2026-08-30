import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Flame } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { generateStudentCalendar } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { TeacherStudentReports } from '@/pages/teacher/StudentReportsPage'

const MISTAKE_TYPES = ['Makhraj', 'Ghunnah', 'Tajweed', 'Fluency', 'Makhraj', 'Ghunnah'] as const

export function TeacherStudentReportOverview() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { getStudent, getClass } = useAppStore()
  const student = studentId ? getStudent(studentId) : undefined

  if (!student) {
    return <div className="space-y-4"><h1 className="font-display text-2xl font-semibold text-ink">Student not found</h1><Button variant="outline" onClick={() => navigate('/teacher/students')}>Back to students</Button></div>
  }

  const studentClass = student.classId ? getClass(student.classId) : undefined
  const calendar = useMemo(() => generateStudentCalendar(student), [student])
  const timeline = useMemo(() => Object.values(calendar).filter((entry) => entry.status !== 'pending').sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 30), [calendar])
  const weakAreas = useMemo(() => {
    const counts: Record<string, number> = { Makhraj: 0, Ghunnah: 0, Tajweed: 0 }
    timeline.forEach((entry, index) => {
      const type = MISTAKE_TYPES[index % MISTAKE_TYPES.length]
      if (type in counts) counts[type] += entry.mistakes
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
  }, [timeline])

  const scoreClass = (score: number | null) => {
    if (score === null) return 'text-ink/40'
    return score >= 90 ? 'text-green-700' : score >= 70 ? 'text-gold-800' : 'text-clay-700'
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(`/teacher/students/${student.id}`)} className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"><ArrowLeft className="h-4 w-4" />Back to {student.name}</button>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-2xl font-semibold text-ink">Student report — {student.name}</h1><p className="mt-1 text-sm text-ink/55">Historical performance, weak areas, and daily report previews.</p></div>
        <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-800"><Flame className="h-4 w-4 text-clay-600" />{student.streak}-day streak</div>
      </div>

      <Card><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><div><div className="text-xs text-ink/45">Student</div><div className="mt-1 font-semibold text-ink">{student.name}</div></div><div><div className="text-xs text-ink/45">Class</div><div className="mt-1 font-semibold text-ink">{studentClass?.name ?? 'Not enrolled'}</div></div><div><div className="text-xs text-ink/45">Enrolled</div><div className="mt-1 font-semibold text-ink">{format(new Date(student.startDate + 'T00:00:00'), 'MMM d, yyyy')}</div></div><div><div className="text-xs text-ink/45">Avg score</div><div className="mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700">{student.avgScore}%</div></div><div><div className="text-xs text-ink/45">Total points</div><div className="mt-1 font-semibold text-ink">{student.points}</div></div></CardContent></Card>

      <Card><CardTitle className="mb-3">Performance timeline — last 30 days</CardTitle><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-line bg-paper-dim text-xs uppercase tracking-wide text-ink/50"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Target</th><th className="px-3 py-2">Actual</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Attendance</th><th className="px-3 py-2">Mistakes</th></tr></thead><tbody>{timeline.map((entry) => <tr key={entry.date.toISOString()} className="border-b border-line last:border-0"><td className="px-3 py-2.5 text-ink/70">{format(entry.date, 'MMM d')}</td><td className="px-3 py-2.5 text-ink">{entry.target}</td><td className="px-3 py-2.5 text-ink/70">{entry.actual || '—'}</td><td className={`px-3 py-2.5 font-semibold tabular-nums ${scoreClass(entry.score)}`}>{entry.score === null ? '—' : `${entry.score}/100`}</td><td className="px-3 py-2.5 capitalize text-ink/70">{entry.attendance ?? '—'}</td><td className="px-3 py-2.5 tabular-nums text-ink/70">{entry.mistakes}</td></tr>)}</tbody></table></div></CardContent></Card>

      <Card><CardTitle className="mb-3">Weak areas</CardTitle><CardContent><div className="flex flex-wrap gap-2">{weakAreas.map(([name, count]) => <span key={name} className="rounded-full bg-clay-100 px-3 py-1.5 text-sm font-semibold text-clay-800">{name} × {count}</span>)}</div></CardContent></Card>

      <TeacherStudentReports />
    </div>
  )
}
