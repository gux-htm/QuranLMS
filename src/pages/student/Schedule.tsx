import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  Video,
  BookOpen,
} from 'lucide-react'
import { format, differenceInSeconds } from 'date-fns'
import { Button } from '@/components/ui/Button'
import {
  CURRENT_STUDENT,
  TEACHER_SCHEDULE,
  SESSION_DETAILS,
  today,
} from '@/lib/mockData'

/* ── constants ───────────────────────────────────────────── */

const MY_SESSIONS = TEACHER_SCHEDULE.filter(
  (s) => s.studentName === CURRENT_STUDENT.name,
)

/* ── countdown digit box ─────────────────────────────────── */

function DigitBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 font-mono text-2xl font-bold text-paper shadow-inner backdrop-blur-sm sm:h-20 sm:w-20 sm:text-3xl">
        {value}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/50">
        {label}
      </span>
    </div>
  )
}

/* ── component ────────────────────────────────────────────── */

export function StudentSchedule() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState<number>(0)

  // Find today's session for countdown
  const todaysSession = useMemo(
    () => MY_SESSIONS.find((s) => s.date === format(today, 'yyyy-MM-dd')),
    [],
  )

  const todayDetail = todaysSession ? SESSION_DETAILS[todaysSession.id] : undefined

  // Calculate countdown timer
  useEffect(() => {
    if (!todaysSession) return

    const updateCountdown = () => {
      const [hours, minutes] = todaysSession.time.split(':').map(Number)
      const sessionTime = new Date(today)
      sessionTime.setHours(hours, minutes, 0, 0)

      const now = new Date()
      const diff = differenceInSeconds(sessionTime, now)

      setCountdown(Math.max(0, diff))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [todaysSession])

  // Break countdown into h / m / s strings
  const countdownDigits = useMemo(() => {
    const h = Math.floor(countdown / 3600)
    const m = Math.floor((countdown % 3600) / 60)
    const s = countdown % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    return { h: pad(h), m: pad(m), s: pad(s), hasHours: h > 0 }
  }, [countdown])

  const classIsLive = countdown === 0

  const joinClass = () => {
    if (todaysSession?.meetUrl) {
      window.open(todaysSession.meetUrl, '_blank')
      navigate(`/student/sessions/${todaysSession.id}/lesson`)
    }
  }

  /* ── render ──────────────────────────────────────────────── */

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Schedule</h1>
        <p className="mt-1 text-sm text-ink/55">
          Your upcoming class at a glance.
        </p>
      </div>

      {/* ── Today's session card ────────────────────────────── */}
      {todaysSession ? (
        <section className="relative overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-900 via-green-800 to-green-700 px-6 py-8 text-paper shadow-card sm:px-10 sm:py-10">
          {/* Decorative rings (matches Dashboard hero) */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-16 top-8 h-40 w-40 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full border border-white/[0.06]" />

          {/* ── Top row: badge + live indicator ── */}
          <div className="relative mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-paper/80">
              <CalendarDays className="h-3.5 w-3.5" />
              Today's class
            </span>

            {classIsLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-600 px-3 py-1.5 text-xs font-bold text-paper animate-pulse shadow-lg">
                <span className="h-2 w-2 rounded-full bg-paper" />
                LIVE — Class is starting!
              </span>
            )}
          </div>

          {/* ── Main content ── */}
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {/* Left: lesson info */}
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {todaysSession.lessonTitle}
              </h2>

              <p className="flex items-center gap-2 text-sm leading-6 text-paper/70">
                <BookOpen className="h-4 w-4 shrink-0" />
                {todaysSession.className} · {format(new Date(todaysSession.date + 'T00:00:00'), 'EEEE, MMMM d')} · {todaysSession.time}
              </p>

              {/* Tajweed focus chips */}
              {todayDetail?.tajweedRules && todayDetail.tajweedRules.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {todayDetail.tajweedRules.map((rule) => (
                    <span
                      key={rule}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-paper/80"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: countdown + action */}
            <div className="flex flex-col items-start gap-6 lg:items-end">
              {/* Countdown digits */}
              {!classIsLive && (
                <div className="flex items-center gap-3">
                  {countdownDigits.hasHours && (
                    <>
                      <DigitBox value={countdownDigits.h} label="Hours" />
                      <span className="mt-[-18px] font-mono text-2xl font-bold text-paper/30">:</span>
                    </>
                  )}
                  <DigitBox value={countdownDigits.m} label="Min" />
                  <span className="mt-[-18px] font-mono text-2xl font-bold text-paper/30">:</span>
                  <DigitBox value={countdownDigits.s} label="Sec" />
                </div>
              )}

              {/* Join button */}
              <Button
                size="lg"
                onClick={joinClass}
                className="w-full bg-paper text-green-900 hover:bg-paper-dim shadow-card sm:w-auto"
              >
                <Video className="mr-2 h-4 w-4" />
                {classIsLive ? 'Join Class Now' : 'Join When Ready'}
              </Button>
            </div>
          </div>
        </section>
      ) : (
        /* No session today */
        <section className="rounded-3xl border border-line bg-white px-6 py-12 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <p className="mt-5 font-display text-lg font-semibold text-ink">No class today</p>
          <p className="mt-1 text-sm text-ink/50">
            Check back tomorrow or view your calendar for upcoming sessions.
          </p>
        </section>
      )}
    </div>
  )
}

