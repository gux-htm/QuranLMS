import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Award, BarChart3, Download, FileText, Mail, Minus, Printer, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TrendChart } from '@/components/charts/TrendChart'
import { useToast } from '@/components/ui/Toaster'
import { useClassAnalytics } from '@/hooks/useClassAnalytics'
import type { AnalyticsRange } from '@/hooks/useClassAnalytics'
import { useAppStore } from '@/lib/store'
import { ERROR_DRILLDOWN } from '@/types'
import type { CommonError, PerformerRow } from '@/types'

const RANGES: { id: AnalyticsRange; label: string }[] = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'all', label: 'All Time' },
]

function ChangeBadge({ value, unit = '%' }: { value: number; unit?: string }) {
  if (value === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-ink/45">
        <Minus className="h-3.5 w-3.5" /> No change
      </span>
    )
  const up = value > 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-700' : 'text-clay-600'}`}>
      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {up ? '+' : ''}
      {value}
      {unit} vs previous
    </span>
  )
}

function TrendPill({ trend }: { trend: CommonError['trend'] }) {
  if (trend === 'up') return <span className="rounded-full bg-clay-100 px-2 py-0.5 text-xs font-medium text-clay-700">Rising</span>
  if (trend === 'down') return <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Falling</span>
  return <span className="rounded-full bg-paper-dim px-2 py-0.5 text-xs font-medium text-ink/55">Stable</span>
}

function PerformerList({ title, rows, accent }: { title: string; rows: PerformerRow[]; accent: 'green' | 'clay' }) {
  const navigate = useNavigate()
  return (
    <Card>
      <CardTitle className="mb-3 flex items-center gap-2">
        <Award className={`h-5 w-5 ${accent === 'green' ? 'text-green-700' : 'text-clay-600'}`} />
        {title}
      </CardTitle>
      {rows.length === 0 ? (
        <p className="text-sm text-ink/50">No students yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <button
              key={row.studentId}
              onClick={() => navigate(`/teacher/students/${row.studentId}`)}
              className="flex w-full items-center gap-3 rounded-md border border-line px-3 py-2 text-left transition hover:bg-paper-dim/60"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  accent === 'green' ? 'bg-green-100 text-green-800' : 'bg-clay-100 text-clay-700'
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{row.name}</span>
                <span className="block text-xs text-ink/50">
                  {row.completion}% complete • streak {row.streak}d • active {row.lastActive}
                </span>
              </span>
              <span className="font-display text-lg font-semibold tabular-nums text-ink">{row.avgScore}%</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}

export function TeacherClassAnalytics() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const { getEnrolledStudents } = useAppStore()

  const [range, setRange] = useState<AnalyticsRange>('30d')
  const [compare, setCompare] = useState(false)
  const [drilldown, setDrilldown] = useState<CommonError | null>(null)

  const { data, loading, klass } = useClassAnalytics(classId, range)
  const enrolled = classId ? getEnrolledStudents(classId) : []

  if (!klass) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Class not found</h1>
        <Button variant="outline" onClick={() => navigate('/teacher/classes')}>
          Back to classes
        </Button>
      </div>
    )
  }

  const rangeLabel = RANGES.find((r) => r.id === range)?.label ?? ''

  // ---------- Exports ----------
  const exportCsv = () => {
    if (!data) return
    const lines: string[] = []
    lines.push(`Class Analytics — ${klass.name} (${rangeLabel})`)
    lines.push('')
    lines.push('Weekly trend')
    lines.push('Week,Average score,Completion %,Attendance %,Previous score')
    data.weeks.forEach((w) => lines.push(`${w.week},${w.score},${w.completion},${w.attendance},${w.prevScore}`))
    lines.push('')
    lines.push('Grade distribution')
    lines.push('Grade,Students')
    data.distribution.forEach((d) => lines.push(`${d.grade},${d.students}`))
    lines.push('')
    lines.push('Common errors')
    lines.push('Rank,Error,Frequency,Affected students,Trend')
    data.errors.forEach((e) => lines.push(`${e.rank},"${e.type}",${e.frequency},${e.affectedStudents},${e.trend}`))
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${klass.name.replace(/\s+/g, '-').toLowerCase()}-analytics.csv`
    a.click()
    URL.revokeObjectURL(url)
    push('CSV exported')
  }

  const exportPdf = () => {
    // Browser print dialog offers "Save as PDF"
    window.print()
  }

  const emailAdmin = () => {
    push(`Analytics summary emailed to admin@tilp.org`)
  }

  const affectedStudents = drilldown ? enrolled.slice(0, Math.min(drilldown.affectedStudents, enrolled.length)) : []

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(`/teacher/classes/${klass.id}`)}
        className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {klass.name}
      </button>

      {/* ---------- Header + filters ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Analytics — {klass.name}</h1>
          <p className="mt-1 text-sm text-ink/55">
            Performance, completion and attendance insights across {enrolled.length} enrolled students.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                aria-pressed={range === r.id}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  range === r.id ? 'bg-green-600 text-paper' : 'bg-white text-ink/60 hover:bg-paper-dim'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-green-600"
            />
            Compare with previous period
          </label>
        </div>
      </div>

      {loading || !data ? (
        <div className="rounded-lg border border-line bg-white p-12 text-center text-sm text-ink/55">
          Crunching the numbers…
        </div>
      ) : (
        <>
          {/* ---------- Metric cards ---------- */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="text-sm text-ink/55">Average score</div>
              <div className="mt-1 font-display text-3xl font-semibold text-ink">{data.metrics.avgScore}%</div>
              <div className="mt-1.5">
                <ChangeBadge value={data.metrics.avgScoreChange} />
              </div>
            </Card>
            <Card>
              <div className="text-sm text-ink/55">Completion rate</div>
              <div className="mt-1 font-display text-3xl font-semibold text-ink">{data.metrics.completionRate}%</div>
              <div className="mt-1.5">
                <ChangeBadge value={data.metrics.completionChange} />
              </div>
            </Card>
            <Card>
              <div className="text-sm text-ink/55">Attendance rate</div>
              <div className="mt-1 font-display text-3xl font-semibold text-ink">{data.metrics.attendanceRate}%</div>
              <div className="mt-1.5">
                <ChangeBadge value={data.metrics.attendanceChange} />
              </div>
            </Card>
            <Card>
              <div className="text-sm text-ink/55">Active students</div>
              <div className="mt-1 font-display text-3xl font-semibold text-ink">
                {data.metrics.activeStudents}
                <span className="text-lg text-ink/40"> / {data.metrics.totalStudents}</span>
              </div>
              <div className="mt-1.5 text-xs text-ink/45">Active in the last 7 days</div>
            </Card>
          </div>

          {/* ---------- Charts ---------- */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardTitle className="mb-2">Average score trend</CardTitle>
              <TrendChart
                type="line"
                data={data.weeks}
                xKey="week"
                yKey="score"
                domain={[0, 100]}
                unit="%"
                compareKey={compare ? 'prevScore' : undefined}
              />
            </Card>
            <Card>
              <CardTitle className="mb-2">Lesson completion</CardTitle>
              <TrendChart type="area" data={data.weeks} xKey="week" yKey="completion" domain={[0, 100]} unit="%" />
            </Card>
            <Card>
              <CardTitle className="mb-2">Grade distribution</CardTitle>
              <TrendChart type="bar" data={data.distribution} xKey="grade" yKey="students" color="#BC8E55" />
            </Card>
            <Card>
              <CardTitle className="mb-2">Attendance by week</CardTitle>
              <TrendChart type="bar" data={data.weeks} xKey="week" yKey="attendance" color="#5A7D9A" domain={[0, 100]} unit="%" />
            </Card>
          </div>

          {/* ---------- Common errors ---------- */}
          <Card>
            <CardTitle className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-700" />
              Most common recitation errors
            </CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-paper-dim text-xs uppercase tracking-wide text-ink/50">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">#</th>
                    <th className="px-4 py-2.5 font-medium">Error type</th>
                    <th className="px-4 py-2.5 font-medium">Frequency</th>
                    <th className="px-4 py-2.5 font-medium">Affected students</th>
                    <th className="px-4 py-2.5 font-medium">Trend</th>
                    <th className="px-4 py-2.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.errors.map((error) => (
                    <tr key={error.type} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="px-4 py-3 tabular-nums text-ink/50">{error.rank}</td>
                      <td className="px-4 py-3 font-medium text-ink">{error.type}</td>
                      <td className="px-4 py-3 tabular-nums text-ink/70">{error.frequency}×</td>
                      <td className="px-4 py-3 tabular-nums text-ink/70">
                        {error.affectedStudents} of {enrolled.length}
                      </td>
                      <td className="px-4 py-3">
                        <TrendPill trend={error.trend} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => setDrilldown(error)}>
                          Drill down
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ---------- Performers ---------- */}
          <div className="grid gap-5 lg:grid-cols-2">
            <PerformerList title="Top performers" rows={data.topPerformers} accent="green" />
            <PerformerList title="Needs support" rows={data.needsSupport} accent="clay" />
          </div>

          {/* ---------- Export footer ---------- */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Share this report</h3>
                <p className="mt-0.5 text-sm text-ink/55">Export the {rangeLabel.toLowerCase()} analytics for {klass.name}.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportCsv}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={exportPdf}>
                  <FileText className="mr-1.5 h-4 w-4" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={emailAdmin}>
                  <Mail className="mr-1.5 h-4 w-4" />
                  Email to Admin
                </Button>
                <Button variant="ghost" onClick={() => window.print()}>
                  <Printer className="mr-1.5 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ---------- Drill-down modal ---------- */}
      <Modal
        open={!!drilldown}
        onClose={() => setDrilldown(null)}
        title={drilldown ? `${drilldown.type}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrilldown(null)}>
              Close
            </Button>
            <Button onClick={() => navigate('/teacher/curriculum')}>Assign targeted practice</Button>
          </>
        }
      >
        {drilldown && (
          <div className="space-y-4">
            <p className="text-sm text-ink/70">
              {ERROR_DRILLDOWN[drilldown.type] ??
                'This error pattern is recurring across recent sessions. Targeted practice is recommended.'}
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-line bg-paper p-3">
                <div className="font-display text-xl font-semibold text-ink">{drilldown.frequency}×</div>
                <div className="text-xs text-ink/50">Occurrences</div>
              </div>
              <div className="rounded-md border border-line bg-paper p-3">
                <div className="font-display text-xl font-semibold text-ink">{drilldown.affectedStudents}</div>
                <div className="text-xs text-ink/50">Students affected</div>
              </div>
              <div className="rounded-md border border-line bg-paper p-3">
                <div className="font-display text-xl font-semibold capitalize text-ink">{drilldown.trend}</div>
                <div className="text-xs text-ink/50">Trend</div>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Affected students</h4>
              <div className="max-h-44 space-y-1 overflow-y-auto">
                {affectedStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/teacher/students/${s.id}`)}
                    className="flex w-full items-center justify-between rounded-md border border-line px-3 py-2 text-sm hover:bg-paper-dim/60"
                  >
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="tabular-nums text-ink/50">Avg {s.avgScore}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
