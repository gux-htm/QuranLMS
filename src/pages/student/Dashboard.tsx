import {
  Flame,
  Trophy,
  Video,
  ClipboardList,
  ArrowRight,
  CalendarDays,
  BookOpen,
  Sparkles,
  TrendingUp,
  BarChart3,
  Star,
  Clock3,
} from 'lucide-react'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  CURRENT_STUDENT,
  generateCalendarData,
  WEEK_SCORES,
  MILESTONES,
  SESSIONS,
  ACHIEVEMENTS,
  today,
} from '@/lib/mockData'
import { format, subDays } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { LookAhead } from '@/components/student/LookAhead'

export function StudentDashboard() {
  const navigate = useNavigate()
  const { lessonAssignments } = useAppStore()
  const calendarData = generateCalendarData()
  const todayEntry = calendarData[format(today, 'yyyy-MM-dd')]
  const yesterdayEntry = calendarData[format(subDays(today, 1), 'yyyy-MM-dd')]
  const nextSession = SESSIONS.find((s) => s.status === 'scheduled')
  const quranComplete = Math.round(
    (CURRENT_STUDENT.unitsCompleted / CURRENT_STUDENT.totalUnits) * 100
  )
  const upcomingMilestones = MILESTONES.filter((m) => m.percentage > quranComplete).slice(0, 3)
  const todaysAssignmentId =
    lessonAssignments.find((a) => a.studentIds.includes(CURRENT_STUDENT.id))?.id ??
    'current-student-lesson'

  const stats = [
    {
      icon: BarChart3,
      tone: 'bg-green-50 text-green-700',
      value: `${CURRENT_STUDENT.avgScore}%`,
      label: 'Your average',
      detail: `Class average: 87%`,
    },
    {
      icon: Flame,
      tone: 'bg-clay-100 text-clay-600',
      value: CURRENT_STUDENT.streak,
      label: 'Day streak',
      detail: `${CURRENT_STUDENT.points} pts earned`,
    },
    {
      icon: BookOpen,
      tone: 'bg-sky-100 text-sky-600',
      value: `${quranComplete}%`,
      label: 'Quran complete',
      detail: `Est. ${CURRENT_STUDENT.estimatedCompletion}`,
    },
    {
      icon: Trophy,
      tone: 'bg-gold-100 text-gold-700',
      value: CURRENT_STUDENT.points,
      label: 'Points',
      detail: `Rank #${CURRENT_STUDENT.rank} of ${CURRENT_STUDENT.totalStudents}`,
    },
  ]

  return (
    <div className="space-y-7">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-900 via-green-800 to-green-700 px-6 py-7 text-paper shadow-card sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-16 top-8 h-40 w-40 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-paper/80">
              <Sparkles className="h-3.5 w-3.5" /> Student workspace
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
              Assalamu alaikum, {CURRENT_STUDENT.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-paper/70">
              {CURRENT_STUDENT.className} · {CURRENT_STUDENT.teacherName} · Keep your daily streak
              going.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate('/student/calendar')}>
              <CalendarDays className="mr-2 h-4 w-4" /> My calendar
            </Button>
            <Button onClick={() => navigate(`/student/lesson/${todaysAssignmentId}`)}>
              <BookOpen className="mr-2 h-4 w-4" /> Start today's lesson
            </Button>
          </div>
        </div>
      </section>

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
                <div className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-semibold text-ink">{stat.label}</div>
                <div className="mt-1 text-xs text-ink/45">{stat.detail}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Today's lesson + upcoming session */}
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <CardTitle>Today's lesson</CardTitle>
              <p className="mt-1 text-sm text-ink/50">Your target for today's session.</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-green-200 bg-green-50/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-green-700">
                Today's target
              </div>
              <div className="mt-2 text-sm font-medium text-ink">
                Juz 1 · Pages 4–6 · Target: 1 page (16 lines)
              </div>
              {todayEntry && (
                <div className="mt-2 font-arabic text-lg leading-relaxed text-ink">
                  {todayEntry.target}
                </div>
              )}
            </div>
            <Button
              className="w-full"
              onClick={() => navigate(`/student/lesson/${todaysAssignmentId}`)}
            >
              Open lesson <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <CardTitle>Today's Quran verse</CardTitle>
              <p className="mt-1 text-sm text-ink/50">Your target passage for today.</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper-dim text-green-700">
              <Star className="h-4 w-4" />
            </span>
          </div>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-line bg-paper/60 p-4">
              <div className="font-arabic text-xl leading-relaxed text-ink">
                بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
              </div>
              <p className="mt-3 text-sm text-ink/60">
                {todayEntry?.target ?? 'Juz 1, Pages 16–17'}
              </p>
            </div>
            {nextSession && (
              <div className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Video className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">Next live session</div>
                  <div className="mt-0.5 truncate text-xs text-ink/50">
                    {format(new Date(`${nextSession.date}T${nextSession.time}`), 'EEE, h:mm a')} ·{' '}
                    {nextSession.duration} min
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => window.open(nextSession.meetUrl, '_blank')}>
                  Join
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <CardTitle>This week's scores</CardTitle>
              <p className="mt-1 text-sm text-ink/50">Your session performance over the last 7 days.</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper-dim text-green-700">
              <BarChart3 className="h-4 w-4" />
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={WEEK_SCORES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D3" />
              <XAxis dataKey="day" stroke="#1C2620" tick={{ fontSize: 12 }} />
              <YAxis stroke="#1C2620" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FBFAF6', border: '1px solid #E4E0D3', borderRadius: '12px' }}
              />
              <Bar dataKey="score" fill="#2F6B4F" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-5">
          {/* Progress milestones */}
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <CardTitle>Progress milestones</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                <Trophy className="h-4 w-4" />
              </span>
            </div>
            <CardContent className="space-y-3">
              {upcomingMilestones.map((m) => (
                <div key={m.name}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-ink">{m.name}</span>
                    <span className="text-xs text-ink/50">Est. {m.projectedDate}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-green-600"
                      style={{ width: `${Math.min((quranComplete / m.percentage) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate('/student/calendar')}
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 transition-colors hover:text-green-900"
              >
                View full calendar <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Look ahead + yesterday + achievements */}
      <div className="grid gap-5 lg:grid-cols-3">
        <LookAhead />

        {yesterdayEntry && yesterdayEntry.score !== null && (
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <CardTitle>Yesterday's report</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper-dim text-green-700">
                <ClipboardList className="h-4 w-4" />
              </span>
            </div>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
                <div className="min-w-0 flex-1 text-sm text-ink/70">
                  Scored{' '}
                  <span className="font-semibold text-ink">{yesterdayEntry.score}%</span> on{' '}
                  {yesterdayEntry.target} with{' '}
                  <span className="font-semibold text-ink">{yesterdayEntry.mistakes}</span>{' '}
                  {yesterdayEntry.mistakes === 1 ? 'mistake' : 'mistakes'} in{' '}
                  {yesterdayEntry.durationMinutes} min.
                </div>
              </div>
              <button
                onClick={() => navigate('/student/reports')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 transition-colors hover:text-green-900"
              >
                See full report <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        )}

        <Card className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <CardTitle>Recent achievements</CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <CardContent className="space-y-3">
            {ACHIEVEMENTS.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${a.badgeColor}26` }}
                >
                  <Trophy className="h-4 w-4" style={{ color: a.badgeColor }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">{a.badgeName}</div>
                  <div className="truncate text-xs text-ink/50">{a.description}</div>
                </div>
                <span className="text-xs font-semibold text-gold-700">+{a.points}</span>
              </div>
            ))}
            <button
              onClick={() => navigate('/student/achievements')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 transition-colors hover:text-green-900"
            >
              View all achievements <ArrowRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Estimated completion footer */}
      <section className="rounded-3xl border border-line bg-white p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">Keep moving</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Your learning tools, close at hand</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/student/reports')}>
            <BarChart3 className="mr-2 h-4 w-4" /> Reports
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => navigate('/student/assignments')}
            className="rounded-2xl bg-paper p-4 text-left transition-colors hover:bg-green-50"
          >
            <ClipboardList className="h-5 w-5 text-green-700" />
            <div className="mt-4 text-sm font-semibold">Assignments</div>
            <div className="mt-1 text-xs text-ink/50">Review tasks set by your teacher</div>
          </button>
          <button
            onClick={() => navigate('/student/calendar')}
            className="rounded-2xl bg-paper p-4 text-left transition-colors hover:bg-green-50"
          >
            <CalendarDays className="h-5 w-5 text-green-700" />
            <div className="mt-4 text-sm font-semibold">Calendar</div>
            <div className="mt-1 text-xs text-ink/50">See your daily targets and history</div>
          </button>
          <button
            onClick={() => navigate('/student/achievements')}
            className="rounded-2xl bg-paper p-4 text-left transition-colors hover:bg-green-50"
          >
            <Trophy className="h-5 w-5 text-green-700" />
            <div className="mt-4 text-sm font-semibold">Achievements</div>
            <div className="mt-1 text-xs text-ink/50">Track your badges and milestones</div>
          </button>
        </div>
        <p className="mt-5 rounded-2xl bg-paper-dim px-4 py-3 text-xs text-ink/55">
          At your current pace, you are estimated to complete the Quran by{' '}
          <span className="font-semibold text-ink">
            {format(new Date(CURRENT_STUDENT.estimatedCompletion), 'MMMM d, yyyy')}
          </span>
          . Keeping your daily target updates this automatically.
        </p>
      </section>
    </div>
  )
}
