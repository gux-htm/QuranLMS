import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { addDays, differenceInCalendarDays, format } from 'date-fns'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { CURRENT_STUDENT, UNIT_TOTALS } from '@/lib/mockData'
export function LookAhead() {
  const [juz, setJuz] = useState('5')
  const [futureDate, setFutureDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
  const pagesPerJuz = UNIT_TOTALS.pages / 30
  const targetUnits = Number(juz) * pagesPerJuz
  const daysToMilestone = Math.max(0, (targetUnits - CURRENT_STUDENT.unitsCompleted) / Math.max(CURRENT_STUDENT.pace.quantity, 0.1))
  const projectedDate = addDays(new Date(), Math.ceil(daysToMilestone))
  const daysFromNow = differenceInCalendarDays(new Date(`${futureDate}T12:00:00`), new Date())
  const unitsAtDate = Math.max(0, CURRENT_STUDENT.unitsCompleted + daysFromNow * CURRENT_STUDENT.pace.quantity)
  const projectedJuz = Math.min(30, Math.max(1, Math.floor(unitsAtDate / pagesPerJuz) + 1))
  const projectedPage = Math.max(1, Math.floor(unitsAtDate % pagesPerJuz) + 1)
  return <Card><CardTitle className="mb-1">Look ahead</CardTitle><CardContent className="space-y-4"><label className="block text-sm font-medium text-ink">When will I reach<select value={juz} onChange={(e) => setJuz(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink">{Array.from({ length: 30 }, (_, i) => i + 1).map((value) => <option key={value} value={value}>Juz {value}</option>)}<option value="31">Quran complete (100%)</option></select></label><div className="rounded-md border border-green-200 bg-green-50/50 p-3"><div className="text-sm font-medium text-green-900">Estimated: {format(projectedDate, 'MMM d, yyyy')}</div><p className="mt-1 text-xs text-ink/50">At your current pace of {CURRENT_STUDENT.pace.quantity} {CURRENT_STUDENT.pace.unit}/day · about {Math.max(0, Math.ceil(daysToMilestone))} days away</p></div><div><label className="flex items-center gap-2 text-sm font-medium text-ink"><CalendarDays className="h-4 w-4 text-green-700" />When will I be on this date?</label><input aria-label="Future date" type="date" value={futureDate} onChange={(e) => setFutureDate(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"/><p className="mt-2 text-sm text-ink/70">Projected: <span className="font-semibold text-ink">Juz {projectedJuz}, Page {projectedPage}</span></p></div></CardContent></Card>
}
