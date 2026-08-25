import { useEffect, useState } from 'react'
import { generateDailyReports } from '@/lib/reportsData'
import { useAppStore } from '@/lib/store'
import type { DailyReport } from '@/types'

// GET /api/teachers/me/students/:studentId/reports
export function useStudentReports(studentId: string | undefined) {
  const { getStudent, reportResends, markReportResent } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<DailyReport[]>([])

  useEffect(() => {
    if (!studentId) {
      setReports([])
      setLoading(false)
      return
    }
    setLoading(true)
    const timer = window.setTimeout(() => {
      const student = getStudent(studentId)
      setReports(student ? generateDailyReports(student) : [])
      setLoading(false)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [studentId, getStudent])

  // POST /api/teachers/me/students/:studentId/reports/:reportId/resend
  const resend = async (reportId: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 500))
    markReportResent(reportId)
  }

  // Reports that were resent switch to "sent" with the new timestamp
  const effectiveReports = reports.map((r) => {
    const resentAt = reportResends[r.id]
    if (!resentAt) return r
    return { ...r, status: 'sent' as const, sentAt: new Date(resentAt).toISOString() }
  })

  return { reports: effectiveReports, loading, resend }
}
