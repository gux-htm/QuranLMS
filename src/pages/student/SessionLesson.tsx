import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, Video, BookOpen, Play, AlertCircle, CheckCircle2, Award, Copy } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BackLink } from '@/components/ui/BackLink'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { useAppStore } from '@/lib/store'
import { QARI_OPTIONS, ayahAudioUrl } from '@/lib/curriculumData'
import { CURRENT_STUDENT, TEACHER_SCHEDULE, SESSION_DETAILS, MISTAKE_TYPE_LABELS, today } from '@/lib/mockData'
import { calculateLessonLibrary } from '@/lib/lessonCalculator'
import { mapPageRangeToQuran } from '@/lib/quranData'
import { useQuranText } from '@/hooks/useQuranText'
import { useToast } from '@/components/ui/Toaster'

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Quran.com word-level shape
interface MushafWord {
  position: number
  char_type_name: 'word' | 'end'
  text_uthmani: string
  transliteration?: { text: string; language_name: string }
  line_number: number
}

interface MushafVerse {
  verse_key: string
  verse_number: number
  words: MushafWord[]
}

type RenderWord = {
  verseKey: string
  ayah: number
  position: number
  text: string
  transliteration?: string
}

const MISTAKE_TYPE_COLOUR: Record<string, string> = {
  makhraj: 'bg-clay-100 text-clay-700',
  tajweed: 'bg-sky-100 text-sky-700',
  fluency: 'bg-gold-100 text-gold-700',
  other: 'bg-paper-dim text-ink/60',
}

const ATTENDANCE_CONFIG = {
  present: { label: 'Present', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200' },
  late: { label: 'Late', icon: Clock, cls: 'bg-gold-100 text-gold-700 border-gold-200' },
  absent: { label: 'Absent', icon: Video, cls: 'bg-clay-100 text-clay-700 border-clay-200' },
} as const

export function StudentSessionLesson() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const {
    sessionStarts,
    sessionAttendance,
    sessionMistakes,
    sessionScores,
    sessionRubrics,
    lessonProgress,
  } = useAppStore()

  const [now, setNow] = useState(() => Date.now())
  const [verses, setVerses] = useState<MushafVerse[] | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState(false)
  const [selectedWord, setSelectedWord] = useState<RenderWord | null>(null)
  const [qari, setQari] = useState('ar.abdurrahmaansudais')

  const session = TEACHER_SCHEDULE.find((s) => s.id === sessionId && s.studentName === CURRENT_STUDENT.name)
  const detail = sessionId ? SESSION_DETAILS[sessionId] : undefined

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch lesson from library based on session date
  const { lessons } = useMemo(() => {
    const result = calculateLessonLibrary({
      studentId: CURRENT_STUDENT.id,
      currentDate: today,
      pace: CURRENT_STUDENT.pace,
      unitsCompleted: CURRENT_STUDENT.unitsCompleted,
      totalUnits: CURRENT_STUDENT.totalUnits,
      completedLessons: lessonProgress,
    })
    return result
  }, [lessonProgress])

  // Find the lesson for the selected session date
  const todaysLesson = useMemo(() => {
    if (!session) return null
    const lessonId = `lesson-${session.date}`
    return lessons.find(l => l.id === lessonId)
  }, [session, lessons])

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
    return quranAyahs.filter(ayah => 
      ayah.numInSurah >= quranMapping.startAyah && 
      ayah.numInSurah <= (quranMapping.endSurah === quranMapping.startSurah ? quranMapping.endAyah : ayah.numInSurah)
    )
  }, [quranAyahs, quranMapping])

  useEffect(() => {
    const page = detail?.resumeFrom.page ?? null
    if (!page) return
    let cancelled = false
    setVerses(null)
    setPageLoading(true)
    setPageError(false)
    fetch(
      `https://api.quran.com/api/v4/verses/by_page/${page}?words=true&word_fields=text_uthmani,transliteration&fields=verse_key`
    )
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then((json: { verses: MushafVerse[] }) => {
        if (!cancelled) setVerses(json.verses)
      })
      .catch(() => {
        if (!cancelled) setPageError(true)
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [detail])

  const mistakes = sessionId ? (sessionMistakes[sessionId] ?? []) : []
  const attendance = sessionId
    ? (sessionAttendance[`${sessionId}:${CURRENT_STUDENT.id}`] ?? sessionAttendance[sessionId])
    : undefined
  const score = sessionId ? sessionScores[sessionId] : undefined
  const rubric = sessionId ? sessionRubrics[sessionId] : undefined

  const finalTotal = rubric?.total ?? score?.total
  const finalGrade = rubric?.grade ?? score?.grade
  const finalMsg = rubric?.feedback ?? score?.teacherMessage

  const startedAt = sessionId ? sessionStarts[sessionId] : undefined
  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0

  const isQaida = !!detail?.resumeFrom.qaidaLesson
  const isToday = session?.date === format(today, 'yyyy-MM-dd')

  // Words for the clickable text
  const words: RenderWord[] = isQaida
    ? []
    : (verses ?? []).flatMap((v) =>
        v.words
          .filter((w) => w.char_type_name === 'word')
          .map((w) => ({
            verseKey: v.verse_key,
            ayah: v.verse_number,
            position: w.position,
            text: w.text_uthmani,
            transliteration: w.transliteration?.text,
          }))
      )

  const translitLine = words.map((w) => w.transliteration).filter(Boolean).join(' ')

  const mistakeAt = (verseKey: string, position: number) =>
    mistakes.find((m) => m.verseKey === verseKey && m.wordPosition === position)

  // Audio segments
  const audioSegments = useMemo(() => {
    if (lessonAyahs.length > 0) {
      return lessonAyahs.slice(0, 15).map(ayah => ({
        label: `${ayah.surahNum}:${ayah.numInSurah}`,
        url: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.global}.mp3`
      }))
    }
    if (!detail?.audioRange) return []
    const segs = []
    for (let a = detail.audioRange.startAyah; a <= Math.min(detail.audioRange.endAyah, detail.audioRange.startAyah + 14); a++) {
      segs.push({ label: `${detail.audioRange.surah}:${a}`, url: ayahAudioUrl(detail.audioRange.surah, a, qari) })
    }
    return segs
  }, [detail, qari, lessonAyahs])

  const copyMeetLink = async () => {
    if (!session) return
    try {
      await navigator.clipboard.writeText(session.meetUrl)
      push('Meet link copied to clipboard')
    } catch {
      push('Could not copy the link', 'error')
    }
  }

  const openPractice = () => {
    if (todaysLesson) {
      navigate(`/student/lesson/${todaysLesson.id.replace('lesson-', '')}`)
    }
  }

  if (!session || !sessionId) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Session not found</h1>
        <Button variant="outline" onClick={() => navigate('/student/schedule')}>
          Back to schedule
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <BackLink to="/student/schedule" label="Back to schedule" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {session.className} – {session.lessonTitle}
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            {format(new Date(session.date + 'T00:00:00'), 'EEEE, MMMM d')} • {session.time} • {session.duration} min
          </p>
          {quranMapping && (
            <p className="mt-1 text-sm font-medium text-green-700">{quranMapping.label}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isToday && startedAt && (
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold tabular-nums text-paper">
              <Clock className="h-4 w-4" />
              {formatElapsed(elapsed)}
            </span>
          )}
          {isToday && (
            <>
              <Button variant="outline" size="sm" onClick={copyMeetLink}>
                <Copy className="mr-1.5 h-4 w-4" />
                Copy link
              </Button>
              <Button size="sm" onClick={() => window.open(session.meetUrl, '_blank')}>
                <Video className="mr-1.5 h-4 w-4" />
                Join class
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left: Lesson content */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">Lesson content</CardTitle>

            {isQaida ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-line bg-paper p-5 text-center">
                  <p className="font-arabic text-3xl leading-loose text-ink" dir="rtl">
                    {detail?.contentAr}
                  </p>
                </div>
                <p className="text-sm italic text-ink/60">{detail?.contentTranslit}</p>
                <p className="text-sm text-ink/70">{detail?.contentEn}</p>
              </div>
            ) : (
              <>
                {quranLoading && (
                  <div className="rounded-xl border border-line bg-paper-dim/50 p-8 text-center text-sm text-ink/55">
                    Loading Quran text…
                  </div>
                )}
                {quranError && (
                  <div className="rounded-xl border border-line bg-paper-dim/50 p-5 text-center text-sm text-ink/60">
                    Couldn't load the Quran text. Try refreshing.
                  </div>
                )}
                {pageLoading && !lessonAyahs.length && (
                  <div className="rounded-xl border border-line bg-paper-dim/50 p-8 text-center text-sm text-ink/55">
                    Loading Mushaf page {detail?.resumeFrom.page}…
                  </div>
                )}
                {pageError && !lessonAyahs.length && detail && (
                  <div className="rounded-xl border border-line bg-paper-dim/50 p-5 text-center text-sm text-ink/60">
                    Couldn't load the Mushaf page.
                    <p className="mt-3 font-arabic text-2xl leading-loose text-ink" dir="rtl">
                      {detail.contentAr}
                    </p>
                  </div>
                )}
                {lessonAyahs.length > 0 && (
                  <>
                    <div
                      dir="rtl"
                      className="rounded-2xl border-2 border-gold-300 bg-paper p-5 text-right font-[Noto_Naskh_Arabic] text-3xl leading-[2.2] text-ink sm:text-4xl"
                    >
                      {lessonAyahs.map((ayah, idx) => (
                        <span key={ayah.global}>
                          {ayah.ar}
                          {idx < lessonAyahs.length - 1 && ' ۝ '}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-line pt-4">
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                        Transliteration
                      </h4>
                      <p className="text-sm leading-7 italic text-ink/60">
                        {lessonAyahs.map(a => a.translit).join(' · ')}
                      </p>
                    </div>
                    <div className="mt-3">
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                        English translation
                      </h4>
                      <p className="text-xs leading-6 text-ink/45">
                        {lessonAyahs.map(a => a.en).join(' · ')}
                      </p>
                    </div>
                  </>
                )}
                {verses && lessonAyahs.length === 0 && (
                  <>
                    <div className="rounded-lg border-2 border-gold-300 bg-paper p-4">
                      <p className="text-justify font-arabic text-[26px] leading-[2.2] text-ink" dir="rtl">
                        {words.map((w, i) => {
                          const marked = mistakeAt(w.verseKey, w.position)
                          return (
                            <span key={i}>
                              <span
                                onClick={() => setSelectedWord(w)}
                                title={marked ? 'Mistake logged here' : 'Word'}
                                className={`cursor-pointer rounded-sm px-0.5 transition hover:bg-gold-100 ${
                                  marked ? 'bg-clay-200 text-clay-900 ring-1 ring-clay-400' : ''
                                }`}
                              >
                                {w.text}
                              </span>{' '}
                            </span>
                          )
                        })}
                      </p>
                    </div>

                    {translitLine && (
                      <div className="mt-3">
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                          Transliteration
                        </h4>
                        <p className="text-sm italic text-ink/60">{translitLine}</p>
                      </div>
                    )}

                    {detail && (
                      <div className="mt-3">
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                          English translation
                        </h4>
                        <p className="text-sm text-ink/70">{detail.contentEn}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </Card>

          {/* Audio player */}
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Recitation audio</CardTitle>
              <label className="flex items-center gap-2 text-xs text-ink/60">
                Qari
                <select
                  value={qari}
                  onChange={(e) => setQari(e.target.value)}
                  className="h-8 rounded-xl border border-line bg-white px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                >
                  {QARI_OPTIONS.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <AudioPlayer
              segments={audioSegments}
              emptyHint="No audio available for this lesson"
            />
          </Card>

          {/* Practice button */}
          {todaysLesson && (
            <Card className="border-green-200 bg-green-50/30 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-ink">Practice mode</div>
                  <div className="mt-0.5 text-xs text-ink/50">
                    Open full lesson with word-by-word recitation and progress tracking
                  </div>
                </div>
                <Button size="sm" onClick={openPractice}>
                  <Play className="mr-1.5 h-4 w-4" />
                  Practice
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Session info */}
        <div className="space-y-4">
          {/* Attendance */}
          <Card>
            <CardTitle className="mb-3">Attendance</CardTitle>
            {attendance ? (
              <div className="rounded-xl border p-4">
                <div className={`flex items-center gap-2 ${ATTENDANCE_CONFIG[attendance.status].cls.split(' ')[1]}`}>
                  {(() => {
                    const cfg = ATTENDANCE_CONFIG[attendance.status]
                    const Icon = cfg.icon
                    return <><Icon className="h-5 w-5" /><span className="font-semibold">{cfg.label}</span></>
                  })()}
                </div>
                <p className="mt-2 text-xs text-ink/50">
                  Recorded at {format(new Date(attendance.markedAt), 'h:mm a')}
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-line bg-paper/60 p-4 text-center text-sm text-ink/50">
                Not marked yet
              </p>
            )}
          </Card>

          {/* Score breakdown */}
          {(score || rubric) && (
            <Card>
              <CardTitle className="mb-3 flex items-center gap-2">
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
                  const crit = rubric?.criteria ?? score!.criteria
                  const maxMap = rubric
                    ? { makhraj: 25, tajweed: 25, fluency: 20, consistency: 15, memory: 15 }
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

          {/* Mistakes panel */}
          <Card>
            <CardTitle className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-clay-600" />
              Mistakes
              {mistakes.length > 0 && (
                <span className="ml-auto rounded-full bg-clay-100 px-2 py-0.5 text-xs font-bold text-clay-700">
                  {mistakes.length}
                </span>
              )}
            </CardTitle>
            <CardContent className="space-y-0">
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
        </div>
      </div>

      {/* Word detail popup */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setSelectedWord(null)}>
          <div className="max-w-sm rounded-2xl border border-line bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Word details</h3>
              <button onClick={() => setSelectedWord(null)} className="text-ink/40 hover:text-ink">✕</button>
            </div>
            <div className="space-y-2">
              <div className="rounded-xl border border-line bg-paper p-3 text-center">
                <p className="font-arabic text-3xl text-ink" dir="rtl">{selectedWord.text}</p>
              </div>
              {selectedWord.transliteration && (
                <p className="text-center text-sm italic text-ink/60">{selectedWord.transliteration}</p>
              )}
              <p className="text-center text-xs text-ink/50">{selectedWord.verseKey}</p>
            </div>
            {mistakeAt(selectedWord.verseKey, selectedWord.position) && (
              <div className="mt-3 rounded-xl border border-clay-200 bg-clay-50 p-3">
                <p className="text-xs font-semibold text-clay-700">Mistake logged on this word</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
