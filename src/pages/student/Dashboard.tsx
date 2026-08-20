import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CURRENT_STUDENT, generateCalendarData, WEEK_SCORES } from '@/lib/mockData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'

export function StudentDashboard() {
  const navigate = useNavigate()
  const calendarData = generateCalendarData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Assalamu alaikum, {CURRENT_STUDENT.name}</h1>
        <p className="mt-0.5 text-sm text-ink/55">{CURRENT_STUDENT.className}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-2">
            <div className="font-display text-3xl font-semibold text-ink">{CURRENT_STUDENT.avgScore}%</div>
            <div className="text-sm text-ink/50">Your average</div>
            <div className="text-xs text-ink/40">Class average: 87%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <div className="font-display text-3xl font-semibold text-green-700">{CURRENT_STUDENT.streak}</div>
            <div className="text-sm text-ink/50">Day streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <div className="font-display text-3xl font-semibold text-ink">
              {Math.round((CURRENT_STUDENT.unitsCompleted / CURRENT_STUDENT.totalUnits) * 100)}%
            </div>
            <div className="text-sm text-ink/50">Quran complete</div>
            <div className="text-xs text-ink/40">Est. {CURRENT_STUDENT.estimatedCompletion}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-4">This week's scores</CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={WEEK_SCORES}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D3" />
            <XAxis dataKey="day" stroke="#1C2620" />
            <YAxis stroke="#1C2620" />
            <Tooltip contentStyle={{ backgroundColor: '#FBFAF6', border: '1px solid #E4E0D3' }} />
            <Bar dataKey="score" fill="#2F6B4F" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Today's target</CardTitle>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-line p-4">
              <div className="font-arabic text-xl leading-relaxed text-ink">
                بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
              </div>
              <p className="mt-3 text-sm text-ink/60">Juz 1, Pages 16–17</p>
            </div>
            <Button className="w-full">Record session</Button>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="mb-3">Progress milestones</CardTitle>
          <CardContent className="space-y-2">
            {[
              { name: 'Juz 5', progress: 16.7 },
              { name: 'Juz 10', progress: 33.3 },
              { name: 'Juz 15 (50%)', progress: 50 },
            ].map((m) => (
              <div key={m.name}>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-sm font-medium text-ink">{m.name}</span>
                  <span className="text-xs text-ink/50">{Math.round(m.progress)}%</span>
                </div>
                <div className="mt-1 h-1.5 flex-1 rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-green-600"
                    style={{ width: `${Math.min(m.progress, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Button variant="secondary" onClick={() => navigate('/student/calendar')}>View calendar</Button>
        <Button variant="secondary" onClick={() => navigate('/student/reports')}>My reports</Button>
        <Button variant="secondary" onClick={() => navigate('/student/achievements')}>Achievements</Button>
      </div>
    </div>
  )
}
