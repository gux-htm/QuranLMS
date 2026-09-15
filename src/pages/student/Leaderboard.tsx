import { Flame, Medal, TrendingUp, Trophy } from 'lucide-react'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { CURRENT_STUDENT } from '@/lib/mockData'

const rows: { name: string; points: number; streak: number; progress: number; status: string }[] = [
  { name: 'Amina Yusuf', points: 1280, streak: 18, progress: 72, status: 'Ahead' },
  { name: 'You', points: 1160, streak: 12, progress: 58, status: 'On track' },
  { name: 'Bilal Ahmed', points: 1080, streak: 9, progress: 51, status: 'On track' },
  { name: 'Mariam Khan', points: 970, streak: 7, progress: 46, status: 'On track' },
  { name: 'Hassan Ali', points: 830, streak: 4, progress: 39, status: 'Needs attention' },
  { name: 'Sara Noor', points: 780, streak: 6, progress: 35, status: 'On track' },
  { name: 'Omar Khan', points: 690, streak: 3, progress: 30, status: 'Needs attention' },
  { name: 'Zainab Ali', points: 620, streak: 2, progress: 26, status: 'On track' },
]

const rankStyles = [
  'bg-gold-200 text-gold-900 ring-1 ring-gold-400',
  'bg-paper-dim text-ink/70 ring-1 ring-line',
  'bg-clay-100 text-clay-800 ring-1 ring-clay-200',
]

const statusConfig: Record<string, string> = {
  Ahead: 'bg-green-50 text-green-700',
  'On track': 'bg-sky-100 text-sky-700',
  'Needs attention': 'bg-clay-100 text-clay-700',
}

export function StudentLeaderboard() {
  const myRank = rows.findIndex((r) => r.name === 'You') + 1
  const top3 = rows.slice(0, 3)

  const stats = [
    { icon: Medal, tone: 'bg-gold-100 text-gold-700', value: `#${myRank}`, label: 'Your rank', detail: `Of ${rows.length} students` },
    { icon: Trophy, tone: 'bg-green-50 text-green-700', value: rows.find((r) => r.name === 'You')?.points ?? 0, label: 'Your points', detail: 'Earned this term' },
    { icon: Flame, tone: 'bg-clay-100 text-clay-600', value: CURRENT_STUDENT.streak, label: 'Day streak', detail: 'Current consecutive days' },
    { icon: TrendingUp, tone: 'bg-sky-100 text-sky-600', value: `${rows.find((r) => r.name === 'You')?.progress ?? 0}%`, label: 'Progress', detail: 'Quran completion' },
  ]

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Leaderboard</h1>
        <p className="mt-1 text-sm text-ink/55">
          See how you rank among your classmates. Keep your streak going to climb higher.
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

      {/* Podium */}
      <Card className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <CardTitle>Top performers</CardTitle>
            <p className="mt-1 text-sm text-ink/50">This term's leading students.</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
            <Trophy className="h-4 w-4" />
          </span>
        </div>
        <div className="flex items-end justify-center gap-4">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-paper-dim font-display text-sm font-semibold text-ink/70 ring-1 ring-line">
              2
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 font-display text-sm font-semibold text-green-800">
              {top3[1]?.name.split(' ').map((p) => p[0]).join('') ?? '?'}
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-ink">{top3[1]?.name.split(' ')[0]}</div>
              <div className="text-xs text-ink/45 tabular-nums">{top3[1]?.points} pts</div>
            </div>
            <div className="h-16 w-20 rounded-t-2xl bg-paper-dim" />
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-200 font-display text-sm font-bold text-gold-900 ring-1 ring-gold-400">
              1
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 font-display text-base font-bold text-gold-800">
              {top3[0]?.name.split(' ').map((p) => p[0]).join('') ?? '?'}
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-ink">{top3[0]?.name.split(' ')[0]}</div>
              <div className="text-xs font-semibold text-gold-700 tabular-nums">{top3[0]?.points} pts</div>
            </div>
            <div className="h-24 w-20 rounded-t-2xl bg-gold-100" />
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clay-100 font-display text-sm font-semibold text-clay-800 ring-1 ring-clay-200">
              3
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 font-display text-sm font-semibold text-green-800">
              {top3[2]?.name.split(' ').map((p) => p[0]).join('') ?? '?'}
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-ink">{top3[2]?.name.split(' ')[0]}</div>
              <div className="text-xs text-ink/45 tabular-nums">{top3[2]?.points} pts</div>
            </div>
            <div className="h-10 w-20 rounded-t-2xl bg-clay-100/60" />
          </div>
        </div>
      </Card>

      {/* Full rankings table */}
      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <CardTitle>Beginner Juz Reading — Full rankings</CardTitle>
            <p className="mt-1 text-sm text-ink/50">Updated just now.</p>
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((row, i) => {
            const isMe = row.name === 'You'
            return (
              <div
                key={row.name}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
                  isMe ? 'border-green-300 bg-green-50/60' : 'border-line bg-white hover:bg-paper/60'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    rankStyles[i] ?? 'bg-paper-dim text-ink/45 ring-1 ring-line'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 font-display text-xs font-semibold text-green-800">
                  {row.name.split(' ').map((p) => p[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {isMe ? `${row.name} (you)` : row.name}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusConfig[row.status]}`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line/60">
                      <div
                        className="h-full rounded-full bg-green-600"
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-ink/45 tabular-nums">{row.progress}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-ink/55">
                    <Flame className="h-3.5 w-3.5 text-clay-500" />
                    <span className="tabular-nums">{row.streak}</span>
                  </div>
                  <span className="font-display font-semibold tabular-nums text-gold-700">{row.points}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
