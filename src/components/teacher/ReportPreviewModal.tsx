import { format } from 'date-fns'
import { Download, Printer } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { DailyReport } from '@/types'

interface ReportPreviewModalProps {
  report: DailyReport | null
  studentName: string
  onClose: () => void
}

// Email-style preview of one daily report (4b)
export function ReportPreviewModal({ report, studentName, onClose }: ReportPreviewModalProps) {
  if (!report) return null

  const dateLabel = format(new Date(report.dateFor + 'T00:00:00'), 'EEEE, MMMM d, yyyy')
  const handlePrint = () => window.print()

  return (
    <Modal
      open={!!report}
      onClose={onClose}
      title="Report preview"
      wide
      footer={
        <>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download as PDF
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      {/* Email-styled body */}
      <div className="rounded-lg border border-line bg-paper-dim/40 p-2">
        <div className="space-y-4 rounded-md bg-white p-5 text-sm sm:p-6">
          <div className="border-b border-line pb-3">
            <div className="font-display text-lg font-semibold text-green-800">
              Your Tajweed Report — {dateLabel}
            </div>
            <div className="mt-0.5 text-xs text-ink/50">
              To: {report.recipient} • TILP Daily Report
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
              Today's performance
            </h4>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-line p-3 text-center">
                <div className="font-display text-xl font-semibold text-ink">
                  {report.score !== null ? `${report.score}/100` : 'Pending'}
                </div>
                <div className="text-xs text-ink/50">Score</div>
              </div>
              <div className="rounded-md border border-line p-3 text-center">
                <div className="font-display text-xl font-semibold text-green-700">{report.grade ?? '—'}</div>
                <div className="text-xs text-ink/50">Grade</div>
              </div>
              <div className="rounded-md border border-line p-3 text-center">
                <div className="font-display text-xl font-semibold text-clay-600">{report.mistakesCount}</div>
                <div className="text-xs text-ink/50">Mistakes marked</div>
              </div>
            </div>
          </div>

          {report.mistakesCount > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
                Mistakes to review
              </h4>
              <p className="rounded-md border border-line bg-paper p-3 text-ink/70">
                {report.mistakesCount} mistake{report.mistakesCount === 1 ? '' : 's'} were marked during today's
                recitation. Your teacher has noted the correction points in the lesson record.
              </p>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Tomorrow's lesson</h4>
            <p className="rounded-md border border-line bg-paper p-3 font-medium text-ink">{report.nextLesson}</p>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Teacher's message</h4>
            <p className="rounded-md border border-line bg-paper p-3 italic text-ink/70">
              “{report.teacherMessage}”
            </p>
          </div>

          <div className="border-t border-line pt-3 text-xs text-ink/45">
            Salam, {studentName.split(' ')[0]} — keep going!
            <br />
            TILP Team — Tajweed Interactive Learning Platform
          </div>
        </div>
      </div>
    </Modal>
  )
}
