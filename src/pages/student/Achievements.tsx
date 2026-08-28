import { Flame, Lock, Medal, Trophy } from 'lucide-react'
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
  progress: number // 0–100
  progressLabel: string
}

export function StudentAchievements() {
  const { getEnrolledStudents, getClass, teacherSettings } = useAppStore()

  const quranComplete = Math.round((CURRENT_STUDENT.unitsCompleted / CURRENT_STUDENT.totalUnits) * 100)
  const juzCompleted = CURRENT_STUDENT.unitsCompleted / (CURRENT_STUDENT.totalUnits / 30)

  // Locked badges the student is still working towards
  const lockedBadges: LockedBadge[] = [
    {
      id: 'locked-silver-streak',
      badgeName: 'Silver Streak',
      description: '14-day consecutive streak',
      points: 50,
      progress: Math.min(100, Math.round((CURRENT_STUDENT.streak / 14) * 100)),
      progressLabel: `${CURRENT_STUDENT.streak}/14 days`,
    },
    {
      id: 'locked-gold-streak',
      badgeName: 'Gold Streak',
      description: '30-day consecutive streak',
      points: 150,
      progress: Math.min(100, Math.round((CURRENT_STUDENT.streak / 30) * 100)),
      progressLabel: `${CURRENT_STUDENT.streak}/30 days`,
    },
    {
      id: 'locked-5-juz',
      badgeName: '5 Juz Master',
      description: 'Complete your first 5 paras',
      points: 250,
      progress: Math.min(100, Math.round((juzCompleted / 5) * 100)),
      progressLabel: `${juzCompleted.toFixed(1)}/5 juz`,
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

  // ---------- Leaderboard ----------
  const klass = CURRENT_STUDENT.classId ? getClass(CURRENT_STUDENT.classId) : undefined
  const leaderboardVisible =
    !!klass && klass.leaderboardEnabled && teacherSettings.leaderboardEnabled && teacherSettings.leaderboardVisibleToStudents
  const classmates = CURRENT_STUDENT.classId
    ? [...getEnrolledStudents(CURRENT_STUDENT.classId)].sort((a, b) => b.points - a.points)
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Achievements</h1>
        <p className="mt-1 text-sm text-ink/55">
          Earn points and badges for streaks, attendance and Quran completion. Keep going!
        </p>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="space-y-2">
            <Trophy className="h-6 w-6 text-gold-600" />
            <div className="font-display text-2xl font-semibold text-ink">{CURRENT_STUDENT.points}</div>
            <div className="text-sm text-ink/50">Total points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <Medal className="h-6 w-6 text-green-700" />
            <div className="font-display text-2xl font-semibold text-ink">#{CURRENT_STUDENT.rank}</div>
            <div className="text-sm text-ink/50">Class rank of {CURRENT_STUDENT.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <Flame className="h-6 w-6 text-clay-600" />
            <div className="font-display text-2xl font-semibold text-ink">{CURRENT_STUDENT.streak}</div>
            <div className="text-sm text-ink/50">Day streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <Trophy className="h-6 w-6 text-gold-600" />
            <div className="font-display text-2xl font-semibold text-ink">{ACHIEVEMENTS.length}</div>
            <div className="text-sm text-ink/50">Badges earned</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---------- Badge collection ---------- */}
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">Badge collection</CardTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 rounded-md border border-line p-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${badge.badgeColor}26` }}
                >
                  <Trophy className="h-6 w-6" style={{ color: badge.badgeColor }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{badge.badgeName}</span>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                      Earned
                    </span>
                  </div>
                  <div className="text-xs text-ink/55">{badge.description}</div>
                  <div className="mt-0.5 text-[11px] text-ink/40">
                    Unlocked {format(new Date(badge.unlockedDate), 'MMM d, yyyy')}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gold-700">+{badge.points}</span>
              </div>
            ))}

            {lockedBadges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 rounded-md border border-dashed border-line bg-paper/50 p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper-dim">
                  <Lock className="h-5 w-5 text-ink/35" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink/60">{badge.badgeName}</span>
                    <span className="rounded-full bg-paper-dim px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink/45">
                      Locked
                    </span>
                  </div>
                  <div className="text-xs text-ink/50">{badge.description}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-line">
                      <div className="h-full rounded-full bg-gold-500" style={{ width: `${badge.progress}%` }} />
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-ink/50">{badge.progressLabel}</span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-ink/35">+{badge.points}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ---------- Class leaderboard ---------- */}
        <Card>
          <CardTitle className="mb-3">Class leaderboard</CardTitle>
          {leaderboardVisible ? (
            <div className="space-y-2">
              {classmates.map((mate, index) => {
                const isMe = mate.id === CURRENT_STUDENT.id
                return (
                  <div
                    key={mate.id}
                    className={`flex items-center gap-3 rounded-md border p-3 ${
                      isMe ? 'border-green-300 bg-green-50' : 'border-line'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-gold-200 text-gold-800'
                          : index === 1
                            ? 'bg-paper-dim text-ink/70'
                            : 'bg-paper-dim text-ink/50'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 font-display text-xs font-semibold text-green-800">
                      {initialsOf(mate.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">
                        {isMe ? `${mate.name} (you)` : mate.name}
                      </div>
                      <div className="text-xs text-ink/50">{mate.streak}-day streak</div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-gold-700">{mate.points}</span>
                  </div>
                )
              })}
              <p className="pt-1 text-xs text-ink/45">
                Points are earned for daily completion, attendance and perfect scores.
              </p>
            </div>
          ) : (
            <p className="rounded-md border border-line p-4 text-sm text-ink/55">
              Your teacher has hidden the leaderboard for this class.
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---------- Milestones ---------- */}
        <Card>
          <CardTitle className="mb-4">Quran completion milestones</CardTitle>
          <CardContent className="space-y-4">
            {MILESTONES.map((m) => {
              const reached = quranComplete >= m.percentage
              return (
                <div key={m.name}>
                  <div className="flex items-baseline justify-between">
                    <span className={`font-display text-sm font-medium ${reached ? 'text-green-700' : 'text-ink'}`}>
                      {m.name}
                    </span>
                    <span className="text-xs text-ink/50">
                      {reached ? 'Completed' : `Est. ${format(new Date(m.projectedDate), 'MMM d, yyyy')}`}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${reached ? 'bg-green-600' : 'bg-gold-500'}`}
                      style={{ width: `${Math.min((quranComplete / m.percentage) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* ---------- Weekly scores ---------- */}
        <Card>
          <CardTitle className="mb-2">This week's scores</CardTitle>
          <TrendChart type="bar" data={WEEK_SCORES} xKey="day" yKey="score" domain={[0, 100]} unit="%" />
          <p className="mt-2 text-xs text-ink/45">
            Average this week:{' '}
            {Math.round(WEEK_SCORES.reduce((sum, d) => sum + d.score, 0) / WEEK_SCORES.length)}% — scores of 70 or
            more mark the day's lesson as complete.
          </p>
        </Card>
      </div>
    </div>
  )
}
