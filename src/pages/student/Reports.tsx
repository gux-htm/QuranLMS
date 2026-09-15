import { useEffect, useState } from 'react'
import { AlertCircle, ClipboardList, Download, Eye, FileText, Sparkles, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { ReportPreviewModal } from '@/components/teacher/ReportPreviewModal'
import { generateDailyReports } from '@/lib/reportsData'
import { CURRENT_STUDENT } from '@/lib/mockData'
import type { Student } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import type { DailyReport } from '@/types'

const STATUS_STYLES = {
  sent: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  failed: 'bg-clay-100 text-clay-700 ring-1 ring-clay-200',
  pending: 'bg-gold-100 text-gold-800 ring-1 ring-gold-200',
} as const

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

function SkeletonRows() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-28 animate-pulse rounded bg-paper-dim" />
          <div className="h-4 flex-1 animate-pulse rounded bg-paper-dim" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-paper-dim" />
        </div>
      ))}
    </div>
  )
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
    setPreview(report)
    window.setTimeout(() => window.print(), 400)
  }

  const stats = [
    { icon: FileText, tone: 'bg-green-50 text-green-700', value: String(sentReports.length), label: 'Reports received', detail: 'Sent by your teacher' },
    { icon: ClipboardList, tone: 'bg-gold-100 text-gold-700', value: `${avgScore}%`, label: 'Average score', detail: 'Across all sessions' },
    { icon: AlertCircle, tone: 'bg-clay-100 text-clay-600', value: String(totalMistakes), label: 'Mistakes to review', detail: 'Total recorded mistakes' },
    { icon: Sparkles, tone: 'bg-sky-100 text-sky-600', value: nextLesson ?? 'Soon', label: 'Next lesson', detail: 'Upcoming assignment' },
  ]

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Reports</h1>
        <p className="mt-1 text-sm text-ink/55">
          Your daily Tajweed reports, emailed to you and your parent at the end of each class day.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-0">
                <div className="flex items-start justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <TrendingUp className="h-4 w-4 text-ink/15 transition-colors group-hover:text-green-500" />
                </div>
                <div className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">{stat.value}</div>
                <div className="mt-1 text-sm font-semibold text-ink">{stat.label}</div>
                <div className="mt-1 text-xs text-ink/45">{stat.detail}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report history table */}
      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-700" />
              Daily report history
            </CardTitle>
            <p className="mt-1 text-sm text-ink/50">All session reports from your teacher.</p>
          </div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-7 text-center">
            <FileText className="mx-auto h-6 w-6 text-ink/25" />
            <p className="mt-2 font-medium text-ink">No reports yet.</p>
            <p className="mt-1 text-sm text-ink/50">Reports appear after your first session is marked.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper-dim/60 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Mistakes</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-line/60 last:border-0 hover:bg-paper/70">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setPreview(report)}
                        className="font-medium text-green-700 hover:underline"
                      >
                        {format(new Date(report.dateFor + 'T00:00:00'), 'EEE, MMM d, yyyy')}
                      </button>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink">
                      {report.score !== null ? (
                        <span className="font-medium">{report.score}/100</span>
                      ) : (
                        <span className="text-ink/40">Pending</span>
                      )}
                      {report.grade && <span className="ml-1.5 text-xs text-ink/50">({report.grade})</span>}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink/70">{report.mistakesCount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[report.status]}`}>
                        {report.status === 'sent' ? 'Sent' : report.status === 'failed' ? 'Not delivered' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setPreview(report)}
                          className="rounded-xl p-1.5 text-ink/45 hover:bg-paper-dim hover:text-ink"
                          title="Preview report"
                          aria-label="Preview report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadPdf(report)}
                          className="rounded-xl p-1.5 text-ink/45 hover:bg-paper-dim hover:text-ink"
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

      <p className="rounded-2xl bg-paper-dim px-4 py-3 text-xs text-ink/55">
        Reports are generated automatically after each class. If one shows "Not delivered", your teacher can resend it from their portal.
      </p>

      <ReportPreviewModal report={preview} studentName={CURRENT_STUDENT.name} onClose={() => setPreview(null)} />
    </div>
  )
}
