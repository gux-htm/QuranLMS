import { format } from 'date-fns'
import { CheckCircle2, Clock3, Target, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { generateCalendarData } from '@/lib/mockData'

type CalendarEntry = ReturnType<typeof generateCalendarData>[string]

interface CalendarDetailPopoverProps { entry: CalendarEntry }

function getStatus(entry: CalendarEntry) {
  if (entry.status === 'completed') return 'Completed'
  if (entry.status === 'absent') return 'Absent'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return entry.date.getTime() === today.getTime() ? 'Today' : 'Upcoming'
}

export function CalendarDetailPopover({ entry }: CalendarDetailPopoverProps) {
  const status = getStatus(entry)
  const scoreLabel = entry.score === null ? 'Not scored' : `${entry.score}/100`
  const attendanceLabel = entry.attendance === 'present'
    ? `Present${entry.durationMinutes ? ` (${entry.durationMinutes} min)` : ''}`
    : entry.attendance === 'absent'
      ? 'Absent'
      : entry.attendance ?? '—'

  return (
    <Card className="absolute left-1/2 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 p-4 text-left shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink">{format(entry.date, 'EEE, MMM d, yyyy')}</div>
          <div className="mt-1 text-xs text-ink/45">Lesson record</div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${entry.status === 'completed' ? 'bg-green-50 text-green-700' : entry.status === 'absent' ? 'bg-clay-100 text-clay-700' : 'bg-paper-dim text-ink/55'}`}>{status}</span>
      </div>
      <div className="mt-4 space-y-2.5 text-xs text-ink/60">
        <div className="flex gap-2"><Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-700" /><span><b className="font-semibold text-ink">Target:</b> {entry.target}</span></div>
        <div className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-700" /><span><b className="font-semibold text-ink">Actual:</b> {entry.actual || '—'}</span></div>
        <div><b className="font-semibold text-ink">Score:</b> {scoreLabel}</div>
        <div className="flex gap-2"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" /><span><b className="font-semibold text-ink">Attendance:</b> {attendanceLabel}</span></div>
        <div className="flex gap-2"><XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/30" /><span><b className="font-semibold text-ink">Mistakes:</b> {entry.mistakes}</span></div>
      </div>
    </Card>
  )
}
