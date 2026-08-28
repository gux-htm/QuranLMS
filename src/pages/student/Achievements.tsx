import { Flame, Lock, Medal, TrendingUp, Trophy } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { TrendChart } from '@/components/charts/TrendChart'
import { ACHIEVEMENTS, CURRENT_STUDENT, MILESTONES, WEEK_SCORES } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { initialsOf } from '@/pages/teacher/Students'

interface LockedBadge {
  id: string
  badgeName: string
  description: string
  points: number
  progress: number
  progressLabel: string
}

export function StudentAchievements() {
  const { getEnrolledStudents, getClass, teacherSettings } = useAppStore()

  const quranComplete = Math.round((CURRENT_STUDENT.unitsCompleted / CURRENT_STUDENT.totalUnits) * 100)
  const juzCompleted = CURRENT_STUDENT.unitsCompleted / (CURRENT_STUDENT.totalUnits / 30)

  const lockedBadges: LockedBadge[] = [
    {
      id: 'locked-silver-streak',
      badgeName: 'Silver Streak',
      description: '14-day consecutive streak',
      points: 50,
      progress: Math.min(100, Math.round((CURRENT_STUDENT.streak / 14) * 100)),
      progressLabel: `${CURRENT_STUDENT.streak} of 14 days`,
    },
    {
      id: 'locked-gold-streak',
      badgeName: 'Gold Streak',
      description: '30-day consecutive streak',
      points: 150,
      progress: Math.min(100, Math.round((CURRENT_STUDENT.streak / 30) * 100)),
      progressLabel: `${CURRENT_STUDENT.streak} of 30 days`,
    },
    {
      id: 'locked-5-juz',
      badgeName: '5 Juz Master',
      description: 'Complete your first 5 paras',
      points: 250,
      progress: Math.min(100, Math.round((juzCompleted / 5) * 100)),
      progressLabel: `${juzCompleted.toFixed(1)} of 5 juz`,
    },
    {
      id: 'locked-hafiz',
      badgeName: 'Hafiz',
      description: 'Complete the entire Quran',
      points: 1000,
      progress: quranComplete,
      progressLabel: `${quranComplete}% complete`,
    },
  ]

  const klass = CURRENT_STUDENT.classId ? getClass(CURRENT_STUDENT.classId) : undefined
  const leaderboardVisible =
    !!klass && klass.leaderboardEnabled && teacherSettings.leaderboardEnabled && teacherSettings.leaderboardVisibleToStudents
  const classmates = CURRENT_STUDENT.classId
    ? [...getEnrolledStudents(CURRENT_STUDENT.classId)].sort((a, b) => b.points - a.points)
    : []

  const rankStyles = [
    'bg-gold-200 text-gold-900 ring-1 ring-gold-400',
    'bg-paper-dim text-ink/70 ring-1 ring-line',
    'bg-clay-100 text-clay-800 ring-1 ring-clay-200',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Achievements</h1>
        <p className="mt-1 text-sm text-ink/55">
          Earn points and badges for streaks, attendance and Quran completion.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gold-100/70" />
          <CardContent className="relative space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gold-100">
              <Trophy className="h-5 w-5 text-gold-700" />
            </span>
            <div className="font-display text-2xl font-semibold tabular-nums text-ink">{CURRENT_STUDENT.points}</div>
            <div className="text-xs font-medium text-ink/50">Total points</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-green-100/70" />
          <CardContent className="relative space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <Medal className="h-5 w-5 text-green-700" />
            </span>
            <div className="font-display text-2xl font-semibold tabular-nums text-ink">#{CURRENT_STUDENT.rank}</div>
            <div className="text-xs font-medium text-ink/50">Class rank of {CURRENT_STUDENT.totalStudents}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-clay-100/70" />
          <CardContent className="relative space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-clay-100">
              <Flame className="h-5 w-5 text-clay-600" />
            </span>
            <div className="font-display text-2xl font-semibold tabular-nums text-ink">{CURRENT_STUDENT.streak}</div>
            <div className="text-xs font-medium text-ink/50">Day streak</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-sky-100/70" />
          <CardContent className="relative space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100">
              <TrendingUp className="h-5 w-5 text-sky-600" />
            </span>
            <div className="font-display text-2xl font-semibold tabular-nums text-ink">{ACHIEVEMENTS.length}</div>
            <div className="text-xs font-medium text-ink/50">Badges earned</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Badge collection */}
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">Badge collection</CardTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.map((badge) => (
              <div
                key={badge.id}
                className="group relative overflow-hidden rounded-lg border border-line bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-card"
              >
                <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundColor: badge.badgeColor }} />
                <div className="relative flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: `${badge.badgeColor}20`, boxShadow: `0 0 0 4px ${badge.badgeColor}14` }}
                  >
                    <Trophy className="h-5 w-5" style={{ color: badge.badgeColor }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink">{badge.badgeName}</div>
                    <div className="mt-0.5 text-xs text-ink/55">{badge.description}</div>
                    <div className="mt-1 text-[11px] text-ink/40">
                      Unlocked {format(new Date(badge.unlockedDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold tabular-nums text-green-700">
                    +{badge.points}
                  </span>
                </div>
              </div>
            ))}

            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-lg border border-dashed border-line bg-paper/60 p-4 transition-colors duration-200 hover:border-gold-300 hover:bg-paper"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper-dim">
                    <Lock className="h-4 w-4 text-ink/30" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink/55">{badge.badgeName}</div>
                    <div className="mt-0.5 text-xs text-ink/45">{badge.description}</div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-ink/30">+{badge.points}</span>
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
                    <div
                      className="h-full rounded-full bg-gold-500 transition-all duration-500"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-ink/45">
                    {badge.progressLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardTitle className="mb-4">Class leaderboard</CardTitle>
          {leaderboardVisible ? (
            <div className="space-y-2">
              {classmates.map((mate, index) => {
                const isMe = mate.id === CURRENT_STUDENT.id
                return (
                  <div
                    key={mate.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors duration-150 ${
                      isMe ? 'border-green-300 bg-green-50/70' : 'border-line bg-white hover:bg-paper/60'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        rankStyles[index] ?? 'bg-paper-dim text-ink/45'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 font-display text-[11px] font-semibold text-green-800">
                      {initialsOf(mate.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">
                        {isMe ? `${mate.name} (you)` : mate.name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-ink/45">
                        <Flame className="h-3 w-3 text-clay-500" />
                        {mate.streak}-day streak
                      </div>
                    </div>
                    <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-gold-700">
                      {mate.points}
                    </span>
                  </div>
                )
              })}
              <p className="pt-2 text-[11px] leading-relaxed text-ink/40">
                Points are earned for daily completion, attendance and perfect scores.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-line bg-paper/50 p-6 text-center">
              <Lock className="mx-auto h-6 w-6 text-ink/25" />
              <p className="mt-2 text-sm text-ink/50">Your teacher has hidden the leaderboard for this class.</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Milestones */}
        <Card>
          <CardTitle className="mb-4">Quran completion milestones</CardTitle>
          <CardContent className="space-y-4">
            {MILESTONES.map((m) => {
              const reached = quranComplete >= m.percentage
              const pct = Math.min((quranComplete / m.percentage) * 100, 100)
              return (
                <div key={m.name}>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-sm font-medium ${reached ? 'text-green-700' : 'text-ink'}`}>{m.name}</span>
                    <span className="text-[11px] tabular-nums text-ink/45">
                      {reached ? 'Completed' : `Est. ${format(new Date(m.projectedDate), 'MMM d, yyyy')}`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line/60">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-green-600' : 'bg-gold-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Weekly scores */}
        <Card>
          <CardTitle className="mb-3">This week's scores</CardTitle>
          <TrendChart type="bar" data={WEEK_SCORES} xKey="day" yKey="score" domain={[0, 100]} unit="%" height={200} />
          <p className="mt-3 rounded-md bg-paper-dim px-3 py-2 text-xs text-ink/55">
            Weekly average:{' '}
            <span className="font-semibold text-ink">
              {Math.round(WEEK_SCORES.reduce((sum, d) => sum + d.score, 0) / WEEK_SCORES.length)}%
            </span>{' '}
            Scores of 70+ mark a lesson as complete.
          </p>
        </Card>
      </div>
    </div>
  )
}
