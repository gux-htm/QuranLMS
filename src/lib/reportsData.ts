import { format, subDays } from 'date-fns'
import { gradeFor, today, UNIT_LABELS } from '@/lib/mockData'
import type { Student } from '@/lib/mockData'
import type { DailyReport } from '@/types'

// Deterministic pseudo-random helper so report history stays stable across renders
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

// Builds the last 14 days of daily reports for a student (same shape as the daily_reports table)
export function generateDailyReports(student: Student): DailyReport[] {
  const rand = seeded(hashOf(student.id))
  const reports: DailyReport[] = []
  const { quantity, unit } = student.pace
  const step = Math.max(quantity, 0.5)

  for (let i = 13; i >= 0; i--) {
    const date = subDays(today, i)
    const dateFor = format(date, 'yyyy-MM-dd')

    // Absent days (every 7th) never generated a report
    if (i % 7 === 0 && i !== 0) continue

    const score = i === 0 ? null : 76 + Math.floor(rand() * 22)
    const grade = score !== null ? gradeFor(score) : null
    const mistakes = score === null ? 0 : score < 85 ? 3 : score < 92 ? 2 : 1
    const pageFrom = Math.max(1, Math.round(student.unitsCompleted - step * i + 1))

    const isToday = i === 0
    const isFailed = i === 4 // one delivery failure in the history

    reports.push({
      id: `report-${student.id}-${dateFor}`,
      studentId: student.id,
      dateFor,
      score,
      grade,
      status: isToday ? 'pending' : isFailed ? 'failed' : 'sent',
      sentAt: isToday ? null : isFailed ? null : format(date, 'yyyy-MM-dd') + 'T18:32',
      recipient: student.email,
      mistakesCount: mistakes,
      teacherMessage:
        score !== null && score >= 92
          ? 'Excellent recitation today — keep this focus on clarity.'
          : score !== null && score >= 85
            ? 'Good session. Review the marked mistakes before tomorrow.'
            : 'We slowed down today to fix pronunciation — please repeat the audio twice.',
      nextLesson: `${UNIT_LABELS[unit]} ${pageFrom}\u2013${Math.round(pageFrom + step)}`,
    })
  }

  // Newest first
  return reports.reverse()
}
