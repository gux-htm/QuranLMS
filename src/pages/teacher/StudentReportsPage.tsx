import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Eye, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ReportPreviewModal } from '@/components/teacher/ReportPreviewModal'
import { useStudentReports } from '@/hooks/useStudentReports'
import { useToast } from '@/components/ui/Toaster'
import { useAppStore } from '@/lib/store'
import type { DailyReport } from '@/types'

const STATUS_STYLES = {
  sent: 'bg-green-50 text-green-700',
  failed: 'bg-clay-100 text-clay-700',
  pending: 'bg-gold-100 text-gold-800',
} as const

export function TeacherStudentReports() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const { getStudent } = useAppStore()
  const { reports, loading, resend } = useStudentReports(studentId)

  const [preview, setPreview] = useState<DailyReport | null>(null)
  const [resendTarget, setResendTarget] = useState<DailyReport | null>(null)
  const [resending, setResending] = useState(false)

  const student = studentId ? getStudent(studentId) : undefined

  if (!student) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Student not found</h1>
        <Button variant="outline" onClick={() => navigate('/teacher/students')}>
          Back to students
        </Button>
      </div>
    )
  }

  const confirmResend = async () => {
    if (!resendTarget) return
    setResending(true)
    try {
      await resend(resendTarget.id)
      push(`Report resent to ${student.name.split(' ')[0]}'s email`)
      setResendTarget(null)
    } catch {
      push('Failed to resend. Try again.', 'error')
    } finally {
      setResending(false)
    }
  }

  const downloadPdf = (report: DailyReport) => {
    // Prints the preview — the browser print dialog offers "Save as PDF"
    setPreview(report)
    window.setTimeout(() => window.print(), 400)
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(`/teacher/students/${student.id}`)}
        className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {student.name}
      </button>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Daily Reports for {student.name}</h1>
        <p className="mt-1 text-sm text-ink/55">
          Reports are emailed automatically at the end of each class day — preview, resend or download them here.
        </p>
      </div>

      <Card>
        {loading ? (
          <p className="p-6 text-center text-sm text-ink/55">Loading reports…</p>
        ) : reports.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink/55">No daily reports have been generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper-dim text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Score</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Sent at</th>
                  <th className="px-4 py-2.5 font-medium">Recipient</th>
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
                        {format(new Date(report.dateFor + 'T00:00:00'), 'MMM d, yyyy')}
                      </button>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink">
                      {report.score !== null ? `${report.score}/100 (${report.grade})` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[report.status]}`}>
                        {report.status === 'sent' ? 'Sent' : report.status === 'failed' ? 'Failed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/55">
                      {report.sentAt ? format(new Date(report.sentAt), 'h:mm a') : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink/55">{report.recipient}</td>
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
                          onClick={() => setResendTarget(report)}
                          className="rounded-md p-1.5 text-ink/50 hover:bg-paper-dim hover:text-ink"
                          title="Resend report"
                          aria-label="Resend report"
                        >
                          <RefreshCw className="h-4 w-4" />
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

      {/* Preview */}
      <ReportPreviewModal report={preview} studentName={student.name} onClose={() => setPreview(null)} />

      {/* Resend confirmation */}
      <Modal
        open={!!resendTarget}
        onClose={() => setResendTarget(null)}
        title="Resend report"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResendTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmResend} disabled={resending}>
              {resending ? 'Sending…' : 'Resend'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/70">
          Resend the report from{' '}
          <span className="font-medium text-ink">
            {resendTarget ? format(new Date(resendTarget.dateFor + 'T00:00:00'), 'MMMM d, yyyy') : ''}
          </span>{' '}
          to <span className="font-medium text-ink">{student.email}</span>?
        </p>
      </Modal>
    </div>
  )
}
