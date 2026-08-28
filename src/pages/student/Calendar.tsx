import { useMemo, useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfDay, startOfMonth } from 'date-fns'
import { CalendarCheck, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Flame } from 'lucide-react'
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
    return Object.values(calendar).filter((e) => e.date < dayStart)
  }, [calendar])

  const completedDays = pastEntries.filter((e) => e.status === 'completed')
  const absentDays = pastEntries.filter((e) => e.status === 'absent')
  const attendanceRate = pastEntries.length
    ? Math.round(((pastEntries.length - absentDays.length) / pastEntries.length) * 100)
    : 0
  const scored = completedDays.filter((e) => e.score !== null)
  const avgScore = scored.length ? Math.round(scored.reduce((sum, e) => sum + (e.score ?? 0), 0) / scored.length) : 0

  const monthStart = startOfMonth(monthDate)
  const cells: (Date | null)[] = [
    ...Array.from({ length: getDay(monthStart) }, () => null),
    ...eachDayOfInterval({ start: monthStart, end: endOfMonth(monthDate) }),
  ]
  const selectedEntry: CalendarEntry | undefined = calendar[selectedKey]

  const cellClass = (key: string, entry: CalendarEntry | undefined) => {
    if (!entry) return 'text-ink/40 bg-transparent'
    if (entry.status === 'completed') return 'bg-green-600 text-white hover:bg-green-700'
    if (entry.status === 'absent') return 'bg-clay-200 text-clay-800 hover:bg-clay-300'
    if (key === todayKey) return 'bg-green-50 text-green-800 ring-2 ring-inset ring-green-600'
    return 'bg-paper-dim text-ink/70 hover:bg-line'
  }

  const stats = [
    { icon: Flame, iconWrap: 'bg-clay-100', iconColor: 'text-clay-600', bubble: 'bg-clay-100/70', value: String(CURRENT_STUDENT.streak), label: 'Day streak' },
    { icon: CalendarCheck, iconWrap: 'bg-green-100', iconColor: 'text-green-700', bubble: 'bg-green-100/70', value: String(completedDays.length), label: 'Days completed (30d)' },
    { icon: ClipboardCheck, iconWrap: 'bg-sky-100', iconColor: 'text-sky-600', bubble: 'bg-sky-100/70', value: `${attendanceRate}%`, label: 'Attendance (30d)' },
    { icon: CalendarDays, iconWrap: 'bg-gold-100', iconColor: 'text-gold-700', bubble: 'bg-gold-100/70', value: `${avgScore}%`, label: 'Average score (30d)' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Calendar</h1>
        <p className="mt-1 text-sm text-ink/55">
          Your daily targets, what you completed, and your session scores, day by day.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${stat.bubble}`} />
              <CardContent className="relative space-y-2">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconWrap}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </span>
                <div className="font-display text-2xl font-semibold tabular-nums text-ink">{stat.value}</div>
                <div className="text-xs font-medium text-ink/50">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Month grid */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-green-700" />
              {format(monthDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMonthDate((m) => addMonths(m, -1))}
                className="rounded-md p-2 text-ink/60 transition-colors hover:bg-paper-dim hover:text-ink"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setMonthDate((m) => addMonths(m, 1))}
                className="rounded-md p-2 text-ink/60 transition-colors hover:bg-paper-dim hover:text-ink"
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
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-md text-sm transition-all duration-150 ${cellClass(key, entry)} ${
                    isSelected ? 'ring-2 ring-inset ring-gold-500' : ''
                  }`}
                >
                  {format(date, 'd')}
                  {entry?.status === 'completed' && <CheckCircle2 className="mt-0.5 h-3 w-3" />}
                  {entry?.status === 'absent' && <span className="mt-0.5 h-1 w-1 rounded-full bg-clay-600" />}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3 text-xs text-ink/60">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-green-600" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-clay-200" /> Absent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-paper-dim ring-1 ring-inset ring-line" /> Upcoming
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-green-50 ring-2 ring-inset ring-green-600" /> Today
            </span>
          </div>
        </Card>

        {/* Day details */}
        <Card>
          <CardTitle className="mb-3">Day details</CardTitle>
          <CardContent className="space-y-2.5">
            {selectedEntry ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{format(selectedEntry.date, 'EEEE, MMMM d, yyyy')}</span>
                  {selectedKey === todayKey && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">Today</span>
                  )}
                </div>

                <div className="rounded-lg border border-line bg-paper/50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                    {selectedEntry.status === 'pending' ? 'Estimated target' : 'Assigned target'}
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink">{selectedEntry.target}</div>
                </div>

                {selectedEntry.actual && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </div>
                    <div className="mt-1 text-sm font-medium text-green-800">{selectedEntry.actual}</div>
                  </div>
                )}

                {selectedEntry.status === 'completed' && (
                  <>
                    <div className="rounded-lg border border-line p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Session score</div>
                      <div className="mt-1 text-sm font-medium text-green-700">
                        {selectedEntry.score}% · {selectedEntry.mistakes}{' '}
                        {selectedEntry.mistakes === 1 ? 'mistake' : 'mistakes'} in {selectedEntry.durationMinutes} min
                      </div>
                    </div>
                    <div className="rounded-lg border border-line p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Attendance</div>
                      <div className="mt-1 text-sm font-medium text-ink">
                        {selectedEntry.attendance === 'present'
                          ? 'Present'
                          : selectedEntry.attendance === 'late'
                            ? 'Late'
                            : selectedEntry.attendance === 'excused'
                              ? 'Excused'
                              : 'Absent'}
                      </div>
                    </div>
                  </>
                )}

                {selectedEntry.status === 'absent' && (
                  <div className="rounded-lg border border-clay-300 bg-clay-100/40 p-3 text-sm text-clay-700">
                    You were absent on this day. Your streak reset. Build it back up!
                  </div>
                )}

                {selectedKey === todayKey && selectedEntry.status === 'pending' && (
                  <div className="rounded-lg border border-gold-300 bg-gold-100/50 p-3 text-sm text-gold-800">
                    Today's session hasn't happened yet. Your teacher will score this target in class.
                  </div>
                )}

                {selectedEntry.status === 'pending' && selectedKey !== todayKey && (
                  <p className="text-xs text-ink/50">
                    Projected from your pace of {CURRENT_STUDENT.pace.quantity} {CURRENT_STUDENT.pace.unit}/day.
                  </p>
                )}

                <div className="border-t border-line pt-2.5 text-xs text-ink/50">
                  Streak at this point: <span className="font-semibold text-ink">{selectedEntry.streak}</span> day
                  {selectedEntry.streak === 1 ? '' : 's'}
                </div>
              </>
            ) : (
              <p className="text-sm text-ink/55">Select a day to view its record.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="rounded-lg bg-paper-dim px-4 py-3 text-xs text-ink/55">
        At your current pace, you are estimated to complete the Quran by{' '}
        <span className="font-semibold text-ink">{format(new Date(CURRENT_STUDENT.estimatedCompletion), 'MMMM d, yyyy')}</span>.
        Keeping your daily target updates this automatically.
      </p>
    </div>
  )
}
