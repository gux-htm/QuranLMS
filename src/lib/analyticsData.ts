import { format, subWeeks } from 'date-fns'
import { gradeFor, today } from '@/lib/mockData'
import type { ClassRoom, Student } from '@/lib/mockData'
import type { AnalyticsWeekPoint, ClassAnalyticsData, CommonError, PerformerRow } from '@/types'

// Deterministic pseudo-random so charts don't jump between renders
function seeded(seed: number) {
  let t = seed % 233280
  return () => {
    t = (t * 9301 + 49297) % 233280
    return t / 233280
  }
}

function hashOf(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000
  return h
}

const BASE_ERRORS: { type: string; trend: 'up' | 'down' | 'stable' }[] = [
  { type: 'Makhraj: Ghar clarity', trend: 'up' },
  { type: 'Ghunnah: Noon', trend: 'down' },
  { type: 'Tafkheem / Tarqeeq', trend: 'stable' },
  { type: 'Madd length', trend: 'down' },
  { type: 'Qalqala weakness', trend: 'up' },
]

// Aggregates analytics for one class over the requested number of weeks (mirrors
// GET /api/teachers/me/classes/:classId/analytics)
export function generateClassAnalytics(klass: ClassRoom, students: Student[], weeksCount: number): ClassAnalyticsData {
  const rand = seeded(hashOf(klass.id))
  const n = Math.max(students.length, 1)
  const avgBase = students.length
    ? Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length)
    : 0

  // --- Weekly series ---
  const weeks: AnalyticsWeekPoint[] = []
  let prevScore = Math.max(60, avgBase - 6)
  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekStart = subWeeks(today, i)
    const drift = (weeksCount - i) * 0.9 // gentle upward trend
    const score = Math.min(99, Math.max(55, Math.round(avgBase - 4 + drift + (rand() - 0.5) * 8)))
    const completion = Math.min(99, Math.max(60, Math.round(84 + drift * 1.4 + (rand() - 0.5) * 10)))
    const attendance = Math.min(100, Math.max(70, Math.round(88 + drift + (rand() - 0.5) * 8)))
    weeks.push({
      week: format(weekStart, 'MMM d'),
      score,
      completion,
      attendance,
      prevScore: Math.max(55, score - Math.round(2 + rand() * 5)),
    })
    prevScore = score
  }

  const last = weeks[weeks.length - 1]
  const prev = weeks[weeks.length - 2] ?? last
  const avgScore = last?.score ?? avgBase
  const avgScoreChange = avgScore - (prev?.score ?? avgScore)
  const completionRate = last?.completion ?? 0
  const completionChange = completionRate - (prev?.completion ?? completionRate)
  const attendanceRate = Math.round(weeks.reduce((s, w) => s + w.attendance, 0) / Math.max(weeks.length, 1))
  const attendanceChange = attendanceRate - (prev?.attendance ?? attendanceRate)
  const activeStudents = Math.max(0, students.filter((s) => s.status === 'active').length)

  // --- Grade distribution (bucketed by each student's average) ---
  const distribution = ['A', 'B', 'C', 'D', 'F'].map((grade) => ({
    grade,
    students: students.filter((s) => gradeFor(s.avgScore) === grade).length,
  }))

  // --- Common errors scaled by class size ---
  const errors: CommonError[] = BASE_ERRORS.map((e, i) => {
    const frequency = Math.max(2, Math.round((23 - i * 5) * (n / 3) * (0.8 + rand() * 0.4)))
    return {
      rank: 0,
      type: e.type,
      frequency,
      affectedStudents: Math.min(n, Math.max(1, Math.round(frequency / 2))),
      trend: e.trend,
    }
  }).sort((a, b) => b.frequency - a.frequency)
  errors.forEach((e, i) => (e.rank = i + 1))

  // --- Performers ---
  const toRow = (s: Student): PerformerRow => ({
    studentId: s.id,
    name: s.name,
    avgScore: s.avgScore,
    completion: s.totalUnits > 0 ? Math.round((s.unitsCompleted / s.totalUnits) * 100) : 0,
    streak: s.streak,
    lastActive: s.streak > 0 ? 'Today' : `${Math.max(1, 3 - s.streak)} days ago`,
  })
  const sorted = [...students].sort((a, b) => b.avgScore - a.avgScore)
  const topPerformers = sorted.slice(0, 3).map(toRow)
  const needsSupport = sorted
    .slice(-3)
    .reverse()
    .filter((s) => !topPerformers.find((t) => t.studentId === s.id))
    .map(toRow)

  return {
    metrics: {
      avgScore,
      avgScoreChange,
      completionRate,
      completionChange,
      attendanceRate,
      attendanceChange,
      activeStudents,
      totalStudents: students.length,
    },
    weeks,
    distribution,
    errors,
    topPerformers,
    needsSupport,
  }
}
