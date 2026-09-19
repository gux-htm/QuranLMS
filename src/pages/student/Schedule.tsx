import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  XCircle,
  ChevronRight,
  Award,
  BookOpen,
  Play,
} from 'lucide-react'
import { format, parseISO, differenceInSeconds, addMinutes } from 'date-fns'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import {
  CURRENT_STUDENT,
  TEACHER_SCHEDULE,
  SESSION_DETAILS,
  MISTAKE_TYPE_LABELS,
  today,
} from '@/lib/mockData'
import { calculateLessonLibrary } from '@/lib/lessonCalculator'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { mapPageRangeToQuran, getSurah } from '@/lib/quranData'
import { useQuranText } from '@/hooks/useQuranText'

/* ── constants ───────────────────────────────────────────── */

const MY_SESSIONS = TEACHER_SCHEDULE.filter(
  (s) => s.studentName === CURRENT_STUDENT.name,
)

const ATTENDANCE_CONFIG = {
  present: { label: 'Present', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200' },
  late:    { label: 'Late',    icon: Clock,         cls: 'bg-gold-100 text-gold-700 border-gold-200' },
  absent:  { label: 'Absent',  icon: XCircle,       cls: 'bg-clay-100 text-clay-700 border-clay-200' },
} as const

const MISTAKE_TYPE_COLOUR: Record<string, string> = {
  makhraj: 'bg-clay-100 text-clay-700',
  tajweed: 'bg-sky-100 text-sky-700',
  fluency: 'bg-gold-100 text-gold-700',
  other:   'bg-paper-dim text-ink/60',
}

/* ── component ────────────────────────────────────────────── */

export function StudentSchedule() {
  const navigate = useNavigate()
  const {
    sessionAttendance,
    sessionMistakes,
    sessionScores,
    sessionRubrics,
    lessonProgress,
  } = useAppStore()

  const defaultSession =
    MY_SESSIONS.find((s) => s.date === format(today, 'yyyy-MM-dd')) ?? MY_SESSIONS[0]
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultSession?.id)
  const [countdown, setCountdown] = useState<number>(0)

  const selected = MY_SESSIONS.find((s) => s.id === selectedId)
  const detail   = selectedId ? SESSION_DETAILS[selectedId] : undefined

  // Find today's session for countdown
  const todaysSession = useMemo(() => 
    MY_SESSIONS.find((s) => s.date === format(today, 'yyyy-MM-dd')),
    []
  )

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

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`
    }
    return `${m}m ${s}s`
  }

  // Fetch lesson from library based on selected session date
  const { lessons } = useMemo(() => {
    const result = calculateLessonLibrary({
      studentId: CURRENT_STUDENT.id,
      currentDate: today,
      pace: CURRENT_STUDENT.pace,
      unitsCompleted: CURRENT_STUDENT.unitsCompleted,
      totalUnits: CURRENT_STUDENT.totalUnits,
      completedLessons: lessonProgress,
    })
    console.log('Generated lessons:', result.lessons)
    return result
  }, [lessonProgress])

  // Find the lesson for the selected session date
  const todaysLesson = useMemo(() => {
    if (!selected) return null
    const lessonId = `lesson-${selected.date}`
    console.log('Looking for lesson:', lessonId, 'in', lessons.length, 'lessons')
    const found = lessons.find(l => l.id === lessonId)
    console.log('Found lesson:', found)
    return found
  }, [selected, lessons])

  // Map lesson page range to Quran content
  const quranMapping = useMemo(() => {
    if (!todaysLesson || CURRENT_STUDENT.pace.unit !== 'pages') return null
    return mapPageRangeToQuran(todaysLesson.startUnit, todaysLesson.endUnit)
  }, [todaysLesson])

  // Fetch actual Quran text for the mapped range
  const { ayahs: quranAyahs, loading: quranLoading, error: quranError } = useQuranText(
    'surah',
    quranMapping?.startSurah ?? null
  )

  // Filter ayahs to only show the range for this lesson
  const lessonAyahs = useMemo(() => {
    if (!quranMapping || !quranAyahs.length) return []
    
    // If lesson spans multiple surahs, we need to fetch all of them
    // For now, just show the first surah's ayahs in the range
    return quranAyahs.filter(ayah => 
      ayah.numInSurah >= quranMapping.startAyah && 
      ayah.numInSurah <= (quranMapping.endSurah === quranMapping.startSurah ? quranMapping.endAyah : ayah.numInSurah)
    )
  }, [quranAyahs, quranMapping])

  const attendance = selectedId
    ? (sessionAttendance[`${selectedId}:${CURRENT_STUDENT.id}`] ?? sessionAttendance[selectedId])
    : undefined
  const mistakes  = selectedId ? (sessionMistakes[selectedId] ?? []) : []
  const score     = selectedId ? sessionScores[selectedId]   : undefined
  const rubric    = selectedId ? sessionRubrics[selectedId]  : undefined

  const finalTotal = rubric?.total ?? score?.total
  const finalGrade = rubric?.grade ?? score?.grade
  const finalMsg   = rubric?.feedback ?? score?.teacherMessage

  const isToday = selected?.date === format(today, 'yyyy-MM-dd')
  const isPast  = selected ? selected.date < format(today, 'yyyy-MM-dd') : false

  const joinClass = () => {
    if (selected?.meetUrl) {
      // Open Google Meet in new tab
      window.open(selected.meetUrl, '_blank')
      // Navigate to session lesson in current tab
      navigate(`/student/sessions/${selected.id}/lesson`)
    }
  }

  const openLessonPractice = () => {
    if (todaysLesson) {
      navigate(`/student/lesson/${todaysLesson.id.replace('lesson-', '')}`)
    }
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Schedule</h1>
        <p className="mt-1 text-sm text-ink/55">
          Your sessions, teacher feedback, and attendance — all in one place.
        </p>
      </div>

      {/* Today's session countdown card */}
      {todaysSession && (() => {
        const todayDetail = SESSION_DETAILS[todaysSession.id]
        const todayLesson = lessons.find(l => l.id === `lesson-${todaysSession.date}`)
        const todayMapping = todayLesson && CURRENT_STUDENT.pace.unit === 'pages' 
          ? mapPageRangeToQuran(todayLesson.startUnit, todayLesson.endUnit)
          : null

        return (
          <Card className="overflow-hidden border-2 border-green-600 bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Today
                  </span>
                  {countdown > 0 && (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 font-mono text-sm font-semibold text-green-700">
                      <Clock className="h-3.5 w-3.5" />
                      {formatCountdown(countdown)}
                    </span>
                  )}
                  {countdown === 0 && (
                    <span className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white animate-pulse">
                      <Video className="h-3.5 w-3.5" />
                      Class is starting!
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Juz and pages info */}
                {todayMapping && (
                  <div className="text-2xl font-bold text-green-900">
                    {todayMapping.label}
                  </div>
                )}
                
                {/* Session details */}
                <div className="text-lg font-semibold text-ink">
                  {todaysSession.className} · {format(new Date(todaysSession.date + 'T00:00:00'), 'EEEE, MMMM d')} · {todaysSession.time}
                </div>

                {/* Surah and Ayah range */}
                {todayMapping && (
                  <div className="text-base text-green-800">
                    {todayMapping.startSurah === todayMapping.endSurah 
                      ? `Surah ${todayMapping.startSurahName}, Ayah ${todayMapping.startAyah}–${todayMapping.endAyah}`
                      : `${todayMapping.startSurahName} ${todayMapping.startAyah} – ${todayMapping.endSurahName} ${todayMapping.endAyah}`
                    }
                  </div>
                )}

                {/* Tajweed focus */}
                {todayDetail?.tajweedRules && todayDetail.tajweedRules.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {todayDetail.tajweedRules.map((rule) => (
                      <span key={rule} className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-green-900">
                        {rule}
                      </span>
                    ))}
                  </div>
                )}

                {/* Join button */}
                <div className="pt-2">
                  <Button 
                    size="lg" 
                    onClick={joinClass}
                    className="w-full bg-green-700 hover:bg-green-800 text-white shadow-lg"
                  >
                    <Video className="mr-2 h-5 w-5" />
                    Join Class Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )
      })()}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

        {/* ── Left: session list ─────────────────────────── */}
        <div className="space-y-2">
          {MY_SESSIONS.length === 0 ? (
            <Card className="p-6 text-center text-sm text-ink/50">
              No sessions scheduled yet.
            </Card>
          ) : (
            MY_SESSIONS.map((s) => {
              const att = sessionAttendance[`${s.id}:${CURRENT_STUDENT.id}`] ?? sessionAttendance[s.id]
              const det = SESSION_DETAILS[s.id]
              const isActive      = s.id === selectedId
              const sessionIsToday = s.date === format(today, 'yyyy-MM-dd')

              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all duration-150 ${
                    isActive
                      ? 'border-green-700 bg-green-50 shadow-sm'
                      : 'border-line bg-white hover:border-green-200 hover:bg-paper/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink">{s.lessonTitle}</span>
                        {sessionIsToday && (
                          <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-ink/50">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        {format(new Date(s.date + 'T00:00:00'), 'EEE, MMM d')} · {s.time}
                        <span>·</span>
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {s.duration} min
                      </div>
                      {det?.tajweedRules.length ? (
                        <div className="mt-1 truncate text-xs text-ink/40">
                          {det.tajweedRules.join(', ')}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {att ? (
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${ATTENDANCE_CONFIG[att.status].cls}`}>
                          {ATTENDANCE_CONFIG[att.status].label}
                        </span>
                      ) : (
                        <span className="rounded-full border border-line bg-paper-dim px-2 py-0.5 text-[10px] text-ink/40">
                          —
                        </span>
                      )}
                      <ChevronRight className={`h-4 w-4 transition-colors ${isActive ? 'text-green-700' : 'text-ink/25'}`} />
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* ── Right: detail panel ───────────────────────── */}
        {selected ? (
          <div className="space-y-5">

            {/* Session header card */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-line bg-green-900 px-6 py-5 text-paper">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-semibold">{selected.lessonTitle}</h2>
                      {isToday && (
                        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper/80">
                          Today
                        </span>
                      )}
                      {isPast && (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-paper/60">
                          Past
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-paper/65">
                      {selected.className} · {format(new Date(selected.date + 'T00:00:00'), 'EEEE, MMMM d')} · {selected.time}
                    </p>
                    {quranMapping && (
                      <p className="mt-1 text-sm font-medium text-paper/90">
                        {quranMapping.label}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/student/sessions/${selected.id}/lesson`)}>
                      <BookOpen className="mr-1.5 h-4 w-4" />
                      View lesson
                    </Button>
                    {isToday && (
                      <Button size="sm" variant="secondary" onClick={joinClass}>
                        <Video className="mr-1.5 h-4 w-4" />
                        Join class
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3-col stat strip */}
              <div className="grid grid-cols-3 divide-x divide-line bg-white">
                <div className="px-5 py-4">
                  <div className="text-xs text-ink/45">Attendance</div>
                  {attendance ? (
                    <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                      {(() => {
                        const cfg  = ATTENDANCE_CONFIG[attendance.status]
                        const Icon = cfg.icon
                        return <><Icon className="h-4 w-4" /><span>{cfg.label}</span></>
                      })()}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-ink/35">Not marked</div>
                  )}
                </div>
                <div className="px-5 py-4">
                  <div className="text-xs text-ink/45">Score</div>
                  {finalTotal !== undefined ? (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-display text-2xl font-semibold text-ink">{finalTotal}%</span>
                      <span className={`rounded-lg px-2 py-0.5 text-sm font-bold ${
                        finalTotal >= 90 ? 'bg-green-50 text-green-700' :
                        finalTotal >= 70 ? 'bg-sky-100 text-sky-700' :
                        'bg-clay-100 text-clay-700'
                      }`}>{finalGrade}</span>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-ink/35">Not submitted</div>
                  )}
                </div>
                <div className="px-5 py-4">
                  <div className="text-xs text-ink/45">Mistakes</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-display text-2xl font-semibold text-ink">{mistakes.length}</span>
                    {mistakes.length > 0
                      ? <AlertCircle className="h-4 w-4 text-clay-600" />
                      : <CheckCircle2 className="h-4 w-4 text-green-600" />
                    }
                  </div>
                </div>
              </div>
            </Card>

            {/* Main content grid: lesson content + session info */}
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">

              {/* Left: Lesson content from library (read-only) */}
              <div className="space-y-5">
                {todaysLesson ? (
                  <>
                    {/* Lesson text card */}
                    <Card className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <CardTitle className="text-green-900">Today's lesson content</CardTitle>
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
                          <BookOpen className="h-4 w-4" />
                        </span>
                      </div>
                      <CardContent className="space-y-4">
                        {/* Lesson info */}
                        <div className="flex items-center justify-between rounded-xl bg-paper p-3">
                          <div>
                            <div className="text-xs text-ink/50">Content range</div>
                            <div className="mt-0.5 font-semibold text-ink">
                              {quranMapping ? quranMapping.label : todaysLesson.label}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-ink/50">Target</div>
                            <div className="mt-0.5 font-semibold text-ink">
                              {todaysLesson.targetQuantity} {todaysLesson.targetQuantity === 1 ? CURRENT_STUDENT.pace.unit.slice(0, -1) : CURRENT_STUDENT.pace.unit}
                            </div>
                          </div>
                        </div>

                        {/* Arabic text (fetched from library, read-only during session) */}
                        {quranLoading ? (
                          <div className="rounded-2xl border border-line bg-paper/60 p-8 text-center">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
                            <p className="mt-3 text-sm text-ink/50">Loading Quran text...</p>
                          </div>
                        ) : quranError ? (
                          <div className="rounded-2xl border border-clay-200 bg-clay-50 p-5 text-center">
                            <AlertCircle className="mx-auto h-6 w-6 text-clay-600" />
                            <p className="mt-2 text-sm text-clay-700">{quranError}</p>
                          </div>
                        ) : lessonAyahs.length > 0 ? (
                          <>
                            <div
                              dir="rtl"
                              className="rounded-2xl border border-line bg-paper/60 p-5 text-right font-[Noto_Naskh_Arabic] text-3xl leading-[2.2] text-ink sm:text-4xl"
                            >
                              {lessonAyahs.map((ayah, idx) => (
                                <span key={ayah.global}>
                                  {ayah.ar}
                                  {idx < lessonAyahs.length - 1 && ' ۝ '}
                                </span>
                              ))}
                            </div>
                            <div className="border-t border-line pt-4">
                              <p className="text-sm leading-7 text-ink/60">
                                {lessonAyahs.map(a => a.translit).join(' · ')}
                              </p>
                              <p className="mt-2 text-xs leading-6 text-ink/45">
                                {lessonAyahs.map(a => a.en).join(' · ')}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-2xl border border-line bg-paper/60 p-8 text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-ink/20" />
                            <p className="mt-3 text-sm text-ink/50">No Quran text available for this lesson range</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Audio player for reference */}
                    {lessonAyahs.length > 0 && (
                      <Card className="p-6">
                        <CardTitle className="mb-4 flex items-center gap-2">
                          <Play className="h-4 w-4 text-green-700" />
                          Listen during class
                        </CardTitle>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-ink/60">
                            Audio recitation available for reference. For full word-by-word practice, use the Practice button below.
                          </p>
                          <AudioPlayer 
                            segments={lessonAyahs.map(ayah => ({
                              label: `${ayah.surahNum}:${ayah.numInSurah}`,
                              url: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.global}.mp3`
                            }))}
                            emptyHint="Audio not available"
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Open in practice mode */}
                    <Card className="border-green-200 bg-green-50/30 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-ink">Practice this lesson</div>
                          <div className="mt-0.5 text-xs text-ink/50">
                            Open full lesson view with word-by-word recitation and progress tracking
                          </div>
                        </div>
                        <Button size="sm" onClick={openLessonPractice}>
                          <BookOpen className="mr-1.5 h-4 w-4" />
                          Practice
                        </Button>
                      </div>
                    </Card>
                  </>
                ) : (
                  <Card className="p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/5">
                      <BookOpen className="h-6 w-6 text-ink/40" />
                    </div>
                    <p className="mt-4 font-semibold text-ink">No lesson content available</p>
                    <p className="mt-1 text-sm text-ink/50">
                      This session date doesn't have a corresponding lesson in your library yet.
                    </p>
                    {selected && (
                      <div className="mt-3 rounded-xl bg-paper p-3 text-left text-xs text-ink/60">
                        <div>Session date: {selected.date}</div>
                        <div>Looking for lesson ID: lesson-{selected.date}</div>
                        <div>Total lessons in library: {lessons.length}</div>
                        {lessons.length > 0 && (
                          <div className="mt-2">
                            First lesson: {lessons[0]?.id} ({lessons[0]?.label})
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )}
              </div>

              {/* Right: Session info sidebar */}
              <div className="space-y-5">

                {/* Mistakes panel */}
                <Card className="p-6">
                  <CardTitle className="mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-clay-600" />
                    Mistakes
                    {mistakes.length > 0 && (
                      <span className="ml-auto rounded-full bg-clay-100 px-2 py-0.5 text-xs font-bold text-clay-700">
                        {mistakes.length}
                      </span>
                    )}
                  </CardTitle>
                  <CardContent className="space-y-0">
                    {/* Tajweed focus chips (from session detail) */}
                    {detail?.tajweedRules.length ? (
                      <div className="mb-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">
                          Tajweed in focus
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {detail.tajweedRules.map((rule) => (
                            <span key={rule} className="rounded-full bg-paper-dim px-3 py-1 text-xs font-medium text-ink/70">
                              {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {mistakes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-line bg-paper/60 py-6 text-center">
                        <CheckCircle2 className="mx-auto h-6 w-6 text-green-600" />
                        <p className="mt-2 text-sm font-medium text-ink">No mistakes</p>
                        <p className="mt-1 text-xs text-ink/45">
                          {isToday ? 'Session in progress' : 'Clean session!'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {mistakes.map((m) => (
                          <div key={m.id} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-clay-50">
                              <AlertCircle className="h-3.5 w-3.5 text-clay-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-arabic text-sm text-ink">{m.wordText}</span>
                                <span className="text-xs text-ink/45">{m.surahName} {m.ayah}:{m.wordPosition}</span>
                              </div>
                              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${MISTAKE_TYPE_COLOUR[m.type] ?? MISTAKE_TYPE_COLOUR.other}`}>
                                {MISTAKE_TYPE_LABELS[m.type]}
                              </span>
                              {m.note && <p className="mt-1 text-xs leading-5 text-ink/60">{m.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teacher note */}
                    {detail?.notes && (
                      <div className="mt-4 rounded-2xl border border-gold-200 bg-gold-100/40 p-3">
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-700/70">
                          Teacher's note
                        </div>
                        <p className="text-xs leading-5 text-ink/70">{detail.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Score breakdown (if submitted) */}
                {(score || rubric) && (
                  <Card className="p-6">
                    <CardTitle className="mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-gold-700" />
                      Score
                    </CardTitle>
                    <CardContent className="space-y-0">
                      <div className="mb-4 flex items-end gap-3">
                        <span className="font-display text-4xl font-semibold tracking-tight text-ink">
                          {finalTotal}%
                        </span>
                        <span className={`mb-1 rounded-xl px-3 py-1 font-display text-xl font-bold ${
                          (finalTotal ?? 0) >= 90 ? 'bg-green-50 text-green-700' :
                          (finalTotal ?? 0) >= 70 ? 'bg-sky-100 text-sky-700' :
                          'bg-clay-100 text-clay-700'
                        }`}>
                          {finalGrade}
                        </span>
                      </div>

                      {(rubric?.criteria ?? score?.criteria) && (() => {
                        const crit   = rubric?.criteria ?? score!.criteria
                        const maxMap = rubric
                          ? { makhraj: 25, tajweed: 25, fluency: 20, consistency: 15 }
                          : { makhraj: 40, tajweed: 30, fluency: 20, consistency: 10 }
                        return (
                          <div className="space-y-3">
                            {(Object.entries(crit) as [string, number][]).map(([key, val]) => {
                              const max = (maxMap as Record<string, number>)[key] ?? 25
                              const pct = Math.round((val / max) * 100)
                              return (
                                <div key={key}>
                                  <div className="mb-1 flex justify-between text-xs">
                                    <span className="font-medium capitalize text-ink/70">{key}</span>
                                    <span className="text-ink/50">{val}/{max}</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-line">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-green-600' : pct >= 60 ? 'bg-sky-500' : 'bg-clay-500'}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}

                      {finalMsg && (
                        <div className="mt-4 rounded-2xl bg-paper p-3 text-sm leading-6 text-ink/70">
                          <span className="font-semibold text-ink">Teacher: </span>
                          {finalMsg}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>

          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CalendarDays className="h-10 w-10 text-ink/20" />
            <p className="mt-4 font-medium text-ink">Select a session on the left</p>
            <p className="mt-1 text-sm text-ink/45">
              Your attendance status and teacher feedback will appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
