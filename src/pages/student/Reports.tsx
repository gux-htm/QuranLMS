import { useEffect, useState } from 'react'
import { Download, Eye, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { ReportPreviewModal } from '@/components/teacher/ReportPreviewModal'
import { generateDailyReports } from '@/lib/reportsData'
import { CURRENT_STUDENT } from '@/lib/mockData'
import type { Student } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import type { DailyReport } from '@/types'

const STATUS_STYLES = {
  sent: 'bg-green-50 text-green-700',
  failed: 'bg-clay-100 text-clay-700',
  pending: 'bg-gold-100 text-gold-800',
} as const

// The signed-in learner — CURRENT_STUDENT mirrors student-1 in the store
const FALLBACK_STUDENT: Student = {
  id: CURRENT_STUDENT.id,
  name: CURRENT_STUDENT.name,
  email: CURRENT_STUDENT.email,
  classId: CURRENT_STUDENT.classId,
  pace: CURRENT_STUDENT.pace,
  unitsCompleted: CURRENT_STUDENT.unitsCompleted,
  totalUnits: CURRENT_STUDENT.totalUnits,
  startDate: CURRENT_STUDENT.startDate,
  estimatedCompletion: CURRENT_STUDENT.estimatedCompletion,
  status: CURRENT_STUDENT.status,
  streak: CURRENT_STUDENT.streak,
  points: CURRENT_STUDENT.points,
  avgScore: CURRENT_STUDENT.avgScore,
  rank: CURRENT_STUDENT.rank,
}

export function StudentReports() {
  const { getStudent } = useAppStore()
  const student = getStudent(CURRENT_STUDENT.id) ?? FALLBACK_STUDENT

  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<DailyReport[]>([])
  const [preview, setPreview] = useState<DailyReport | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReports(generateDailyReports(student))
      setLoading(false)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [student])

  const sentReports = reports.filter((r) => r.status === 'sent')
  const scored = sentReports.filter((r) => r.score !== null)
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, r) => sum + (r.score ?? 0), 0) / scored.length)
    : 0
  const totalMistakes = reports.reduce((sum, r) => sum + r.mistakesCount, 0)
  const nextLesson = reports[0]?.nextLesson

  const downloadPdf = (report: DailyReport) => {
    // Opens the preview, then the browser print dialog offers "Save as PDF"
    setPreview(report)
    window.setTimeout(() => window.print(), 400)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Reports</h1>
        <p className="mt-1 text-sm text-ink/55">
          Your daily Tajweed reports, emailed to you and your parent at the end of each class day.
        </p>
      </div>

      {/* ---------- Summary ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="space-y-1">
            <div className="font-display text-2xl font-semibold text-ink">{sentReports.length}</div>
            <div className="text-sm text-ink/50">Reports received</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="font-display text-2xl font-semibold text-green-700">{avgScore}%</div>
            <div className="text-sm text-ink/50">Average score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="font-display text-2xl font-semibold text-clay-600">{totalMistakes}</div>
            <div className="text-sm text-ink/50">Mistakes to review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="truncate text-base font-semibold text-ink">{nextLesson ?? '—'}</div>
            <div className="text-sm text-ink/50">Next lesson</div>
          </CardContent>
        </Card>
      </div>

      {/* ---------- Report list ---------- */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-700" />
          Daily report history
        </CardTitle>
        {loading ? (
          <p className="p-6 text-center text-sm text-ink/55">Loading your reports…</p>
        ) : reports.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink/55">No reports yet — your first one arrives after today's class.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper-dim text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Score</th>
                  <th className="px-4 py-2.5 font-medium">Mistakes</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setPreview(report)}
                        className="font-medium text-green-700 hover:text-green-800 hover:underline"
                      >
                        {format(new Date(report.dateFor + 'T00:00:00'), 'EEE, MMM d, yyyy')}
                      </button>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink">
                      {report.score !== null ? `${report.score}/100 (${report.grade})` : 'Pending'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink/70">{report.mistakesCount}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[report.status]}`}>
                        {report.status === 'sent' ? 'Sent' : report.status === 'failed' ? 'Not delivered' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setPreview(report)}
                          className="rounded-md p-1.5 text-ink/50 hover:bg-paper-dim hover:text-ink"
                          title="Preview report"
                          aria-label="Preview report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadPdf(report)}
                          className="rounded-md p-1.5 text-ink/50 hover:bg-paper-dim hover:text-ink"
                          title="Download PDF"
                          aria-label="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="rounded-md bg-paper-dim px-3 py-2 text-xs text-ink/55">
        Reports are generated automatically by TILP after each class. If one shows "Not delivered", your teacher can
        resend it from their portal.
      </p>

      <ReportPreviewModal report={preview} studentName={CURRENT_STUDENT.name} onClose={() => setPreview(null)} />
    </div>
  )
}
