import { useMemo, useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfDay, startOfMonth } from 'date-fns'
import { CalendarCheck, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Flame, TrendingUp } from 'lucide-react'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { CURRENT_STUDENT, generateCalendarData, today } from '@/lib/mockData'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
type CalendarEntry = ReturnType<typeof generateCalendarData>[string]

export function StudentCalendar() {
  const calendar = useMemo(() => generateCalendarData(), [])
  const todayKey = format(today, 'yyyy-MM-dd')
  const [monthDate, setMonthDate] = useState(() => startOfMonth(today))
  const [selectedKey, setSelectedKey] = useState(todayKey)

  const pastEntries = useMemo(() => {
    const dayStart = startOfDay(today)
    return Object.values(calendar).filter((entry) => entry.date < dayStart)
  }, [calendar])

  const completedDays = pastEntries.filter((entry) => entry.status === 'completed')
  const absentDays = pastEntries.filter((entry) => entry.status === 'absent')
  const attendanceRate = pastEntries.length
    ? Math.round(((pastEntries.length - absentDays.length) / pastEntries.length) * 100)
    : 0
  const scored = completedDays.filter((entry) => entry.score !== null)
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, entry) => sum + (entry.score ?? 0), 0) / scored.length)
    : 0

  const monthStart = startOfMonth(monthDate)
  const cells: (Date | null)[] = [
    ...Array.from({ length: getDay(monthStart) }, () => null),
    ...eachDayOfInterval({ start: monthStart, end: endOfMonth(monthDate) }),
  ]
  const selectedEntry: CalendarEntry | undefined = calendar[selectedKey]

  const cellClass = (key: string, entry: CalendarEntry | undefined) => {
    if (!entry) return 'bg-transparent text-ink/40'
    if (entry.status === 'completed') return 'bg-green-600 text-white hover:bg-green-700'
    if (entry.status === 'absent') return 'bg-clay-200 text-clay-800 hover:bg-clay-300'
    if (key === todayKey) return 'bg-green-50 text-green-800 ring-2 ring-inset ring-green-600'
    return 'bg-paper-dim text-ink/70 hover:bg-line'
  }

  const stats = [
    { icon: Flame, tone: 'bg-clay-100 text-clay-600', value: String(CURRENT_STUDENT.streak), label: 'Day streak', detail: 'Current consecutive days' },
    { icon: CalendarCheck, tone: 'bg-green-50 text-green-700', value: String(completedDays.length), label: 'Days completed', detail: 'In the last 30 days' },
    { icon: ClipboardCheck, tone: 'bg-sky-100 text-sky-600', value: `${attendanceRate}%`, label: 'Attendance rate', detail: 'In the last 30 days' },
    { icon: CalendarDays, tone: 'bg-gold-100 text-gold-700', value: `${avgScore}%`, label: 'Average score', detail: 'Based on recorded sessions' },
  ]

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Calendar</h1>
        <p className="mt-1 text-sm text-ink/55">
          Your daily targets, what you completed, and your session scores, day by day.
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

      {/* Calendar + day details */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Calendar grid */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-green-700" />
              {format(monthDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMonthDate((m) => addMonths(m, -1))}
                className="rounded-xl p-2 text-ink/60 hover:bg-paper-dim hover:text-ink"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setMonthDate((m) => addMonths(m, 1))}
                className="rounded-xl p-2 text-ink/60 hover:bg-paper-dim hover:text-ink"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <div key={day} className="pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/35">
                {day}
              </div>
            ))}
            {cells.map((date, index) => {
              if (!date) return <div key={`blank-${index}`} />
              const key = format(date, 'yyyy-MM-dd')
              const entry = calendar[key]
              const isSelected = selectedKey === key
              return (
                <div key={key} className="relative min-w-0">
                  <button
                    onClick={() => setSelectedKey(key)}
                    className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl text-sm transition-all ${cellClass(key, entry)} ${isSelected ? 'ring-2 ring-inset ring-gold-500' : ''}`}
                    aria-label={`View details for ${format(date, 'MMMM d, yyyy')}`}
                  >
                    {format(date, 'd')}
                    {entry?.status === 'completed' && <CheckCircle2 className="mt-0.5 h-3 w-3" />}
                    {entry?.status === 'absent' && <span className="mt-0.5 h-1 w-1 rounded-full bg-clay-600" />}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-ink/55">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-green-600" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-clay-200" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-paper-dim ring-1 ring-inset ring-line" /> Upcoming</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-green-50 ring-2 ring-inset ring-green-600" /> Today</span>
          </div>
        </Card>

        {/* Day details panel */}
        <Card className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <CardTitle>Day details</CardTitle>
              <p className="mt-1 text-sm text-ink/50">Select a day to view its record.</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <CalendarDays className="h-4 w-4" />
            </span>
          </div>
          <CardContent className="space-y-3">
            {selectedEntry ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {format(selectedEntry.date, 'EEEE, MMMM d, yyyy')}
                  </span>
                  {selectedKey === todayKey && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-green-800">
                      Today
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-line bg-paper/60 p-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                    {selectedEntry.status === 'pending' ? 'Estimated target' : 'Assigned target'}
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink">{selectedEntry.target}</div>
                </div>

                {selectedEntry.actual && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-3.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-green-700">Completed</div>
                    <div className="mt-1 text-sm font-medium text-green-800">{selectedEntry.actual}</div>
                  </div>
                )}

                {selectedEntry.status === 'completed' && (
                  <>
                    <div className="rounded-2xl border border-line p-3.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Session score</div>
                      <div className="mt-1 text-sm font-semibold text-green-700">
                        {selectedEntry.score}% · {selectedEntry.mistakes}{' '}
                        {selectedEntry.mistakes === 1 ? 'mistake' : 'mistakes'} in {selectedEntry.durationMinutes} min
                      </div>
                    </div>
                    <div className="rounded-2xl border border-line p-3.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Attendance</div>
                      <div className="mt-1 text-sm font-medium text-ink capitalize">
                        {selectedEntry.attendance ?? '—'}
                      </div>
                    </div>
                  </>
                )}

                {selectedEntry.status === 'absent' && (
                  <div className="rounded-2xl border border-clay-300 bg-clay-100/40 p-3.5 text-sm text-clay-700">
                    You were absent on this day. Your streak reset.
                  </div>
                )}

                {selectedKey === todayKey && selectedEntry.status === 'pending' && (
                  <div className="rounded-2xl border border-gold-300 bg-gold-100/50 p-3.5 text-sm text-gold-800">
                    Today's session hasn't happened yet.
                  </div>
                )}

                <div className="border-t border-line pt-3 text-xs text-ink/50">
                  Streak at this point:{' '}
                  <span className="font-semibold text-ink">{selectedEntry.streak}</span>{' '}
                  day{selectedEntry.streak === 1 ? '' : 's'}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-7 text-center">
                <p className="font-medium text-ink">No day selected.</p>
                <p className="mt-1 text-sm text-ink/50">Click a date on the calendar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="rounded-2xl bg-paper-dim px-4 py-3 text-xs text-ink/55">
        At your current pace, you are estimated to complete the Quran by{' '}
        <span className="font-semibold text-ink">
          {format(new Date(CURRENT_STUDENT.estimatedCompletion), 'MMMM d, yyyy')}
        </span>
        . Keeping your daily target updates this automatically.
      </p>
    </div>
  )
}
