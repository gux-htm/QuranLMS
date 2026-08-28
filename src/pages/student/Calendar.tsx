import { useMemo, useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfDay, startOfMonth } from 'date-fns'
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Flame, XCircle } from 'lucide-react'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { CURRENT_STUDENT, generateCalendarData, today } from '@/lib/mockData'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalendarEntry = ReturnType<typeof generateCalendarData>[string]

export function StudentCalendar() {
  const calendar = useMemo(() => generateCalendarData(), [])
  const todayKey = format(today, 'yyyy-MM-dd')

  const [monthDate, setMonthDate] = useState(() => startOfMonth(today))
  const [selectedKey, setSelectedKey] = useState(todayKey)

  // ---------- Summary stats over the past 30 days ----------
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
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, e) => sum + (e.score ?? 0), 0) / scored.length)
    : 0

  // ---------- Month grid ----------
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Calendar</h1>
        <p className="mt-1 text-sm text-ink/55">
          Your daily targets, what you actually completed, and your session scores — day by day.
        </p>
      </div>

      {/* ---------- Summary stats ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-1 font-display text-2xl font-semibold text-green-700">
              <Flame className="h-5 w-5 text-clay-600" />
              {CURRENT_STUDENT.streak}
            </div>
            <div className="text-sm text-ink/50">Day streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="font-display text-2xl font-semibold text-ink">{completedDays.length}</div>
            <div className="text-sm text-ink/50">Days completed (30d)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="font-display text-2xl font-semibold text-ink">{attendanceRate}%</div>
            <div className="text-sm text-ink/50">Attendance (30d)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="font-display text-2xl font-semibold text-ink">{avgScore}%</div>
            <div className="text-sm text-ink/50">Average score (30d)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---------- Month grid ---------- */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-green-700" />
              {format(monthDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMonthDate((m) => addMonths(m, -1))}
                className="rounded-md p-2 hover:bg-paper-dim"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setMonthDate((m) => addMonths(m, 1))}
                className="rounded-md p-2 hover:bg-paper-dim"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <div key={day} className="pb-1 text-xs font-medium text-ink/40">
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
                  className={`flex aspect-square flex-col items-center justify-center rounded-md text-sm transition-colors ${cellClass(key, entry)} ${
                    isSelected ? 'ring-2 ring-inset ring-gold-500' : ''
                  }`}
                >
                  {format(date, 'd')}
                  {entry?.status === 'completed' && <CheckCircle2 className="mt-0.5 h-3 w-3" />}
                  {entry?.status === 'absent' && <XCircle className="mt-0.5 h-3 w-3" />}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink/60">
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

        {/* ---------- Day details ---------- */}
        <Card>
          <CardTitle className="mb-3">Day details</CardTitle>
          <CardContent className="space-y-2">
            {selectedEntry ? (
              <>
                <div className="text-sm font-medium text-ink">
                  {format(selectedEntry.date, 'EEEE, MMMM d, yyyy')}
                  {selectedKey === todayKey && <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">Today</span>}
                </div>

                <div className="rounded-md border border-line p-3">
                  <div className="text-xs text-ink/50">
                    {selectedEntry.status === 'pending' ? 'Estimated target' : 'Assigned target'}
                  </div>
                  <div className="text-sm font-medium text-ink">{selectedEntry.target}</div>
                </div>

                {selectedEntry.actual && (
                  <div className="rounded-md border border-green-200 bg-green-50 p-3">
                    <div className="text-xs text-green-700">What you completed</div>
                    <div className="text-sm font-medium text-green-800">{selectedEntry.actual}</div>
                  </div>
                )}

                {selectedEntry.status === 'completed' && (
                  <>
                    <div className="rounded-md border border-line p-3">
                      <div className="text-xs text-ink/50">Session score</div>
                      <div className="text-sm font-medium text-green-700">
                        {selectedEntry.score}% • {selectedEntry.mistakes}{' '}
                        {selectedEntry.mistakes === 1 ? 'mistake' : 'mistakes'} •{' '}
                        {selectedEntry.durationMinutes} min
                      </div>
                    </div>
                    <div className="rounded-md border border-line p-3">
                      <div className="text-xs text-ink/50">Attendance</div>
                      <div className="text-sm font-medium text-ink">
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
                  <div className="rounded-md border border-clay-300 bg-clay-100/40 p-3 text-sm text-clay-700">
                    You were absent on this day. Your streak reset — build it back up!
                  </div>
                )}

                {selectedKey === todayKey && selectedEntry.status === 'pending' && (
                  <div className="rounded-md border border-gold-300 bg-gold-100/50 p-3 text-sm text-gold-800">
                    Today's session hasn't happened yet — your teacher will score this target in class.
                  </div>
                )}

                {selectedEntry.status === 'pending' && selectedKey !== todayKey && (
                  <p className="text-xs text-ink/50">
                    Projected from your current pace of {CURRENT_STUDENT.pace.quantity}{' '}
                    {CURRENT_STUDENT.pace.unit}/day.
                  </p>
                )}

                <div className="border-t border-line pt-2 text-xs text-ink/50">
                  Streak at this point: {selectedEntry.streak} day{selectedEntry.streak === 1 ? '' : 's'}
                </div>
              </>
            ) : (
              <p className="text-sm text-ink/55">Select a day to view its record.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="rounded-md bg-paper-dim px-3 py-2 text-xs text-ink/55">
        At your current pace, you are estimated to complete the Quran by{' '}
        <span className="font-semibold text-ink">{format(new Date(CURRENT_STUDENT.estimatedCompletion), 'MMMM d, yyyy')}</span>.
        Keeping your daily target updates this automatically.
      </p>
    </div>
  )
}
