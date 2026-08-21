import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, BookOpenText, ChevronLeft, ChevronRight, FileText, Flag, PenLine, PhoneOff, Trash2, Video } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MISTAKE_TYPE_LABELS, PASS_THRESHOLD, SCORE_CRITERIA_LABELS, SCORE_WEIGHTS, SESSION_DETAILS, TEACHER_SCHEDULE, UNIT_LABELS, gradeFor } from '@/lib/mockData'
import type { LessonPoint, MistakeType, ScoreCriteria } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'

function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function pointChips(point: LessonPoint) {
  if (point.qaidaLesson) {
    return [`Noorani Qaida — Lesson ${point.qaidaLesson}`]
  }
  const chips: string[] = []
  if (point.juz) chips.push(`Juz ${point.juz}`)
  if (point.surahName) {
    const ref = [point.surahNumber, point.ayah].filter(Boolean).join(':')
    chips.push(`Surah ${point.surahName}${ref ? ` ${ref}` : ''}`)
  }
  if (point.page) chips.push(`Page ${point.page}`)
  return chips
}

// --- Quran.com API shape (word-level, keeps the 16-line Mushaf layout) ---
interface MushafWord {
  position: number
  char_type_name: 'word' | 'end'
  text_uthmani: string
  line_number: number
}

interface MushafVerse {
  verse_key: string
  verse_number: number
  words: MushafWord[]
}

type RenderItem =
  | { kind: 'word'; verseKey: string; ayah: number; position: number; text: string; indexInVerse: number }
  | { kind: 'end'; ayah: number; verseKey: string; text: string }

function buildLines(verses: MushafVerse[]): RenderItem[][] {
  const lines: RenderItem[][] = []
  let current: RenderItem[] = []
  let currentLine = -1
  for (const verse of verses) {
    let seen = 0
    for (const w of verse.words) {
      if (w.line_number !== currentLine) {
        if (current.length) lines.push(current)
        current = []
        currentLine = w.line_number
      }
      if (w.char_type_name === 'end') {
        current.push({ kind: 'end', ayah: verse.verse_number, verseKey: verse.verse_key, text: w.text_uthmani })
      } else {
        seen += 1
        current.push({
          kind: 'word',
          verseKey: verse.verse_key,
          ayah: verse.verse_number,
          position: w.position,
          text: w.text_uthmani,
          indexInVerse: seen,
        })
      }
    }
  }
  if (current.length) lines.push(current)
  return lines
}

interface SelectedWord {
  verseKey: string
  ayah: number
  wordText: string
  wordPosition: number
  indexInVerse: number
}

export function TeacherSessionLesson() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const {
    students,
    sessionStarts,
    startSessionTimer,
    sessionEnds,
    endSession,
    sessionAttendance,
    markAttendance,
    sessionMistakes,
    addMistake,
    removeMistake,
    sessionEndpoints,
    saveEndpoint,
    sessionScores,
    submitScore,
  } = useAppStore()

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (sessionId) startSessionTimer(sessionId)
  }, [sessionId])

  const session = TEACHER_SCHEDULE.find((s) => s.id === sessionId)
  const detail = sessionId ? SESSION_DETAILS[sessionId] : undefined
  const student = students.find((s) => s.name === session?.studentName)

  // --- Mushaf page (Quran.com word-level text, PRD 4.2) ---
  const pageNumber = detail?.resumeFrom.page ?? null
  const [pageVerses, setPageVerses] = useState<MushafVerse[] | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState(false)
  const [pageOffset, setPageOffset] = useState(0)
  const [endCandidate, setEndCandidate] = useState<{ ayah: number } | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // Reset per-session UI state when switching sessions
  useEffect(() => {
    setPageVerses(null)
    setSelectedWord(null)
    setMistakeType('makhraj')
    setMistakeNote('')
    setPageOffset(0)
    setEndCandidate(null)
    setDraftCriteria({ makhraj: 0, tajweed: 0, fluency: 0, consistency: 0 })
    setTeacherMessage('')
    setEditingScore(false)
  }, [sessionId])

  // Fetch the currently displayed Mushaf page (lesson page + teacher navigation)
  useEffect(() => {
    const base = sessionId ? SESSION_DETAILS[sessionId]?.resumeFrom.page ?? null : null
    if (!base) return
    const page = base + pageOffset
    let cancelled = false
    setPageVerses(null)
    setPageLoading(true)
    setPageError(false)
    fetch(
      `https://api.quran.com/api/v4/verses/by_page/${page}?words=true&word_fields=text_uthmani&fields=verse_key`
    )
      .then((res) => {
        if (!res.ok) throw new Error('page fetch failed')
        return res.json()
      })
      .then((data: { verses: MushafVerse[] }) => {
        if (!cancelled) setPageVerses(data.verses)
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
  }, [sessionId, pageOffset])

  // --- Word-click mistake marking (PRD 6.2 / 7.1) ---
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null)
  const [mistakeType, setMistakeType] = useState<MistakeType>('makhraj')
  const [mistakeNote, setMistakeNote] = useState('')

  // --- Scoring rubric draft (PRD 6.2) ---
  const [draftCriteria, setDraftCriteria] = useState<ScoreCriteria>({
    makhraj: 0,
    tajweed: 0,
    fluency: 0,
    consistency: 0,
  })
  const [teacherMessage, setTeacherMessage] = useState('')
  const [editingScore, setEditingScore] = useState(false)

  const mistakes = session ? sessionMistakes[session.id] ?? [] : []
  const mistakeAt = (verseKey: string, position: number) =>
    mistakes.find((m) => m.verseKey === verseKey && m.wordPosition === position)

  const onWordClick = (item: Extract<RenderItem, { kind: 'word' }>) => {
    const existing = mistakeAt(item.verseKey, item.position)
    setSelectedWord({
      verseKey: item.verseKey,
      ayah: item.ayah,
      wordText: item.text,
      wordPosition: item.position,
      indexInVerse: item.indexInVerse,
    })
    setMistakeType(existing?.type ?? 'makhraj')
    setMistakeNote(existing?.note ?? '')
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
  }

  const saveMistake = () => {
    if (!selectedWord || !detail || !session) return
    addMistake(session.id, {
      verseKey: selectedWord.verseKey,
      surahName: detail.resumeFrom.surahName ?? '',
      ayah: selectedWord.ayah,
      wordText: selectedWord.wordText,
      wordPosition: selectedWord.wordPosition,
      type: mistakeType,
      note: mistakeNote.trim(),
    })
    setSelectedWord(null)
    setMistakeNote('')
  }

  const unmarkSelected = () => {
    if (!selectedWord || !session) return
    const existing = mistakeAt(selectedWord.verseKey, selectedWord.wordPosition)
    if (existing) removeMistake(session.id, existing.id)
    setSelectedWord(null)
    setMistakeNote('')
  }

  // Saves the clicked ayah marker as today's end point (tomorrow's starting point)
  const confirmEndMark = () => {
    if (!endCandidate || !detail || !session) return
    saveEndpoint(session.id, {
      verseKey: `${detail.resumeFrom.surahNumber ?? 0}:${endCandidate.ayah}`,
      surahName: detail.resumeFrom.surahName ?? '',
      ayah: endCandidate.ayah,
      page: (detail.resumeFrom.page ?? 1) + pageOffset,
    })
    setEndCandidate(null)
  }

  const goToPage = (delta: number) => {
    setPageOffset((o) => Math.max(0, o + delta))
    setEndCandidate(null)
  }

  if (!session || !detail) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Session not found</h1>
        <Button variant="outline" onClick={() => navigate('/teacher/schedule')}>
          Back to schedule
        </Button>
      </div>
    )
  }

  const openMeet = () => window.open(session.meetUrl, '_blank')

  const startedAt = sessionStarts[session.id]
  const endedAt = sessionEnds[session.id]
  const elapsed = startedAt ? Math.max(0, Math.floor(((endedAt ?? now) - startedAt) / 1000)) : 0
  const attendance = sessionAttendance[session.id]
  const endpoint = sessionEndpoints[session.id]
  const displayPage = (pageNumber ?? 1) + pageOffset

  const score = sessionScores[session.id]
  const draftTotal = draftCriteria.makhraj + draftCriteria.tajweed + draftCriteria.fluency + draftCriteria.consistency

  const submitScoreCard = () => {
    submitScore(session.id, {
      criteria: draftCriteria,
      total: draftTotal,
      grade: gradeFor(draftTotal),
      passed: draftTotal >= PASS_THRESHOLD,
      teacherMessage: teacherMessage.trim(),
    })
    setEditingScore(false)
  }

  const editScore = () => {
    if (!score) return
    setDraftCriteria(score.criteria)
    setTeacherMessage(score.teacherMessage)
    setEditingScore(true)
  }

  const startAyah = detail.resumeFrom.ayah
  const endAyah = detail.targetEnd.ayah

  // Words before the resume point were covered yesterday; words after the target are for later
  const verseState = (ayah: number): 'past' | 'today' | 'future' => {
    if (pageOffset > 0) return 'today'
    if (startAyah === null || endAyah === null) return 'today'
    if (ayah < startAyah) return 'past'
    if (ayah > endAyah) return 'future'
    return 'today'
  }

  const lines = pageVerses ? buildLines(pageVerses) : []

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/teacher/schedule')}
        className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to schedule
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Today's lesson — {session.studentName}</h1>
          <p className="mt-1 text-sm text-ink/55">
            {session.className} • {session.lessonTitle} • {session.duration} min session
          </p>
        </div>
        <Button onClick={openMeet}>
          <Video className="mr-2 h-4 w-4" />
          Open Google Meet
        </Button>
      </div>

      <Card className="py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold tabular-nums ${
                endedAt ? 'bg-paper-dim text-ink/60' : 'bg-ink text-paper'
              }`}
            >
              {!endedAt && <span className="h-2 w-2 animate-pulse rounded-full bg-clay-400" />}
              {formatElapsed(elapsed)}
            </span>
            <span className="text-sm text-ink/55">
              {endedAt
                ? `Session ended at ${format(new Date(endedAt), 'h:mm a')}`
                : `Class in progress${startedAt ? ` — started at ${format(new Date(startedAt), 'h:mm a')}` : ''}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink">Attendance:</span>
            {attendance ? (
              <>
                {attendance.status === 'present' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                    Present • marked at {format(new Date(attendance.markedAt), 'h:mm a')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-100 px-3 py-1 text-sm font-medium text-clay-700">
                    Absent • marked at {format(new Date(attendance.markedAt), 'h:mm a')}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markAttendance(session.id, attendance.status === 'present' ? 'absent' : 'present')}
                >
                  Change to {attendance.status === 'present' ? 'absent' : 'present'}
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => markAttendance(session.id, 'present')}>
                  Mark present
                </Button>
                <Button size="sm" variant="danger" onClick={() => markAttendance(session.id, 'absent')}>
                  Mark absent
                </Button>
              </>
            )}

            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

            {!endedAt ? (
              <Button size="sm" variant="danger" onClick={() => endSession(session.id)}>
                <PhoneOff className="mr-1.5 h-4 w-4" />
                End session
              </Button>
            ) : (
              <span className="rounded-full bg-clay-100 px-3 py-1 text-xs font-medium text-clay-700">
                Session ended
              </span>
            )}
          </div>
        </div>
      </Card>

      {endedAt && startedAt && (
        <Card className="border-clay-200">
          <CardTitle className="mb-3">Session summary</CardTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-line p-3">
              <div className="text-xs text-ink/50">Total duration</div>
              <div className="font-display text-lg font-semibold tabular-nums text-ink">{formatElapsed(elapsed)}</div>
            </div>
            <div className="rounded-md border border-line p-3">
              <div className="text-xs text-ink/50">Started</div>
              <div className="text-sm font-medium text-ink">{format(new Date(startedAt), 'h:mm a')}</div>
            </div>
            <div className="rounded-md border border-line p-3">
              <div className="text-xs text-ink/50">Ended</div>
              <div className="text-sm font-medium text-ink">{format(new Date(endedAt), 'h:mm a')}</div>
            </div>
          </div>

          {/* PRD 7.1 — marked mistakes flow into the daily report */}
          <div className="mt-4 border-t border-line pt-3">
            <h3 className="text-sm font-semibold text-ink">Today's mistakes — included in the daily report</h3>
            {mistakes.length === 0 ? (
              <p className="mt-2 text-sm text-ink/55">No mistakes were marked during this session.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {mistakes.map((m, i) => (
                  <div key={m.id} className="rounded-md border border-clay-200 bg-clay-100/30 p-3 text-sm">
                    <div className="font-medium text-ink">
                      Mistake #{i + 1} — Surah {m.surahName}, Ayah {m.ayah}
                    </div>
                    <div className="mt-1 font-arabic text-lg text-ink" dir="rtl">
                      {m.wordText}
                    </div>
                    <div className="mt-1 text-ink/60">Issue: {MISTAKE_TYPE_LABELS[m.type]}</div>
                    {m.note && <div className="mt-1 text-ink/60">Correction: {m.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {score && (
            <p className="mt-3 rounded-md border border-line bg-paper-dim px-3 py-2 text-sm text-ink">
              Score submitted: <span className="font-semibold">{score.total}/100 ({score.grade})</span>{' '}
              {score.passed ? '— marked complete' : '— needs improvement'} • at{' '}
              {format(new Date(score.submittedAt), 'h:mm a')}
            </p>
          )}

          {endpoint && (
            <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              Next session resumes from Surah {endpoint.surahName}, Ayah {endpoint.ayah} (page {endpoint.page}) —
              saved as the new starting point.
            </p>
          )}

          {!attendance && (
            <p className="mt-3 rounded-md bg-gold-100 px-3 py-2 text-sm text-gold-800">
              Attendance wasn't marked for this session — use the buttons above before you leave.
            </p>
          )}
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-300">
          <CardTitle className="mb-3 flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-green-700" />
            Start from here
          </CardTitle>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {pointChips(detail.resumeFrom).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-800"
                >
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-sm text-ink/60">
              This is exactly where {session.studentName.split(' ')[0]} stopped in the last session — begin reading
              from this point.
            </p>
            <p className="rounded-md bg-paper-dim p-3 text-xs text-ink/60">{detail.notes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="mb-3 flex items-center gap-2">
            <Flag className="h-5 w-5 text-clay-600" />
            Today's target
          </CardTitle>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {pointChips(detail.targetEnd).map((chip) => (
                <span key={chip} className="rounded-full bg-paper-dim px-3 py-1 text-sm font-medium text-ink/70">
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-sm text-ink/60">Cover up to this point by the end of today's session.</p>
            {student && (
              <button
                onClick={() => navigate(`/teacher/students/${student.id}`)}
                className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
              >
                View {student.name.split(' ')[0]}'s pace & calendar
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ==================== Lesson content ==================== */}
      {/* Mistake marking form — appears above the Mushaf page */}
      {selectedWord && !detail.resumeFrom.qaidaLesson && (
        <div ref={formRef}>
          <Card className="border-gold-300">
            <CardTitle className="mb-3 flex items-center gap-2">
              <PenLine className="h-5 w-5 text-gold-700" />
              Mark mistake — Surah {detail.resumeFrom.surahName} {selectedWord.verseKey}
            </CardTitle>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-paper-dim px-3 py-1.5 font-arabic text-xl text-ink" dir="rtl">
                  {selectedWord.wordText}
                </span>
                <span className="text-xs text-ink/50">
                  Ayah {selectedWord.ayah}, word {selectedWord.indexInVerse}
                </span>
                {mistakeAt(selectedWord.verseKey, selectedWord.wordPosition) && (
                  <span className="rounded-full bg-clay-100 px-2.5 py-0.5 text-xs font-medium text-clay-700">
                    Already marked — edit or remove below
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink/60">Mistake type</span>
                  <select
                    value={mistakeType}
                    onChange={(e) => setMistakeType(e.target.value as MistakeType)}
                    className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                  >
                    {(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map((t) => (
                      <option key={t} value={t}>
                        {MISTAKE_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink/60">Correction / note</span>
                  <input
                    value={mistakeNote}
                    onChange={(e) => setMistakeNote(e.target.value)}
                    placeholder='e.g. "Ghar not clear — repeat from deep in the throat"'
                    className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={saveMistake}>
                  Save mistake
                </Button>
                {mistakeAt(selectedWord.verseKey, selectedWord.wordPosition) && (
                  <Button size="sm" variant="danger" onClick={unmarkSelected}>
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Remove mark
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setSelectedWord(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {detail.resumeFrom.qaidaLesson ? (
        <Card>
          <CardTitle className="mb-3">Lesson content — Noorani Qaida, Lesson {detail.resumeFrom.qaidaLesson}</CardTitle>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-line bg-paper p-5 text-center">
              <p className="font-arabic text-2xl leading-loose text-ink" dir="rtl">
                {detail.contentAr}
              </p>
            </div>
            <p className="text-sm text-ink/70">{detail.contentEn}</p>
            <p className="text-xs text-ink/50">Qaida audio comes from teacher uploads / the Qaida library.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardTitle className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span>Mushaf — Page {displayPage}</span>
            <span className="flex items-center gap-2">
              {detail.resumeFrom.juz && (
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                  Juz {detail.resumeFrom.juz}
                </span>
              )}
              <span className="rounded-full bg-paper-dim px-2.5 py-0.5 text-xs font-medium text-ink/55">
                16-line Madani Mushaf
              </span>
              <span className="rounded-full bg-clay-100 px-2.5 py-0.5 text-xs font-medium text-clay-700">
                {mistakes.length} mistake{mistakes.length === 1 ? '' : 's'} marked
              </span>
            </span>
          </CardTitle>
          <p className="mb-3 text-xs text-ink/50">
            Click any word to mark a mistake and write the correction — marked words turn red and feed today's report.
            Click a ﴿…﴾ ayah marker to mark where today's lesson ends.
          </p>

          {pageLoading && (
            <div className="rounded-md border border-line bg-paper-dim/50 p-8 text-center text-sm text-ink/55">
              Loading Mushaf page {displayPage} from Quran.com…
            </div>
          )}

          {pageError && (
            <div className="rounded-md border border-line bg-paper-dim/50 p-5 text-center text-sm text-ink/60">
              Couldn't load the Mushaf page (offline?). Starting text for today:
              <p className="mt-3 font-arabic text-xl leading-loose text-ink" dir="rtl">
                {detail.contentAr}
              </p>
            </div>
          )}

          {pageVerses && (
            <div className="rounded-lg border-2 border-gold-300 bg-paper p-4 shadow-card sm:p-6">
              <div dir="rtl" className="space-y-1">
                {lines.map((line, li) => (
                  <p key={li} className="font-arabic text-[21px] leading-[2.35] text-justify text-ink">
                    {line.map((item, ii) => {
                      if (item.kind === 'end') {
                        const isMarkedEnd = endpoint?.verseKey === item.verseKey
                        const isCandidate = endCandidate?.ayah === item.ayah
                        return (
                          <span
                            key={ii}
                            onClick={() => setEndCandidate({ ayah: item.ayah })}
                            title="Click to mark where today's lesson ends"
                            className={[
                              'mx-0.5 cursor-pointer rounded px-0.5 transition',
                              isMarkedEnd
                                ? 'bg-green-100 text-green-700 ring-1 ring-green-500'
                                : isCandidate
                                  ? 'bg-gold-200 text-gold-800 ring-2 ring-gold-500'
                                  : 'text-gold-700 hover:bg-gold-100',
                            ].join(' ')}
                          >
                            ﴿{item.text}﴾
                          </span>
                        )
                      }
                      const state = verseState(item.ayah)
                      const mistake = mistakeAt(item.verseKey, item.position)
                      const isStart = item.ayah === startAyah && item.position === 1 && pageOffset === 0
                      const isSelected =
                        selectedWord?.verseKey === item.verseKey && selectedWord?.wordPosition === item.position
                      return (
                        <span key={ii}>
                          {isStart && (
                            <span
                              dir="ltr"
                              className="mx-1 inline-flex translate-y-[-2px] items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white"
                            >
                              ▶ Start — Ayah {item.ayah}
                            </span>
                          )}
                          <span
                            onClick={() => onWordClick(item)}
                            title="Click to mark a mistake on this word"
                            className={[
                              'cursor-pointer rounded-sm px-0.5 transition',
                              state === 'today' ? 'hover:bg-gold-100' : 'text-ink/35 hover:bg-gold-100/60',
                              item.ayah === startAyah && state === 'today' ? 'bg-green-100/70' : '',
                              mistake ? 'bg-clay-200 text-clay-900 ring-1 ring-clay-400' : '',
                              isSelected ? 'bg-gold-200 ring-2 ring-gold-500' : '',
                            ].join(' ')}
                          >
                            {item.text}
                          </span>{' '}
                        </span>
                      )
                    })}
                  </p>
                ))}
              </div>
            </div>
          )}

          {pageVerses && (
            <>
              {endCandidate && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-gold-400 bg-gold-100/60 px-3 py-2">
                  <span className="text-sm text-ink/80">
                    End today's lesson at{' '}
                    <span className="font-semibold">
                      Surah {detail.resumeFrom.surahName}, Ayah {endCandidate.ayah}
                    </span>
                    ? The next session will start from this point.
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" onClick={confirmEndMark}>
                      Mark end for today
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEndCandidate(null)}>
                      Cancel
                    </Button>
                  </span>
                </div>
              )}

              {endpoint && !endCandidate && (
                <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  End of today's lesson marked at Surah {endpoint.surahName}, Ayah {endpoint.ayah} (page{' '}
                  {endpoint.page}) — the next session starts from this point. To change it, click another ﴿…﴾ marker.
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={pageOffset === 0} onClick={() => goToPage(-1)}>
                  <ChevronRight className="mr-1 h-4 w-4" />
                  Previous page
                </Button>
                <span className="text-sm font-medium text-ink/60">Page {displayPage}</span>
                <Button variant="outline" size="sm" onClick={() => goToPage(1)}>
                  Next page
                  <ChevronLeft className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Live mistake list for this session */}
      {!detail.resumeFrom.qaidaLesson && mistakes.length > 0 && (
        <Card>
          <CardTitle className="mb-3">Marked mistakes ({mistakes.length})</CardTitle>
          <CardContent className="space-y-2">
            {mistakes.map((m, i) => (
              <div key={m.id} className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-line p-3">
                <div className="min-w-0 text-sm">
                  <div className="font-medium text-ink">
                    #{i + 1} — Surah {m.surahName}, Ayah {m.ayah}
                  </div>
                  <div className="mt-0.5 font-arabic text-lg text-ink" dir="rtl">
                    {m.wordText}
                  </div>
                  <div className="mt-1 text-ink/60">Issue: {MISTAKE_TYPE_LABELS[m.type]}</div>
                  {m.note ? (
                    <div className="mt-0.5 text-ink/60">Correction: {m.note}</div>
                  ) : (
                    <div className="mt-0.5 text-xs italic text-ink/40">No correction note written</div>
                  )}
                  <div className="mt-1 text-[11px] text-ink/40">
                    Marked at {format(new Date(m.markedAt), 'h:mm a')} • goes into today's report
                  </div>
                </div>
                <button
                  onClick={() => removeMistake(session.id, m.id)}
                  className="rounded-md p-1.5 text-ink/40 hover:bg-clay-100 hover:text-clay-700"
                  title="Remove this mistake"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ==================== Scoring (PRD 6.2) ==================== */}
      <Card>
        <CardTitle className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-700" />
            Scoring — {session.studentName}
          </span>
          {score && !editingScore && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                score.passed ? 'bg-green-50 text-green-700' : 'bg-clay-100 text-clay-700'
              }`}
            >
              {score.total}/100 ({score.grade}) {score.passed ? '• Complete' : '• Needs improvement'}
            </span>
          )}
        </CardTitle>

        {score && !editingScore ? (
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(SCORE_WEIGHTS) as (keyof ScoreCriteria)[]).map((k) => (
                <div key={k} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
                  <span className="text-ink/70">{SCORE_CRITERIA_LABELS[k]}</span>
                  <span className="font-semibold tabular-nums text-ink">
                    {score.criteria[k]}/{SCORE_WEIGHTS[k]}
                  </span>
                </div>
              ))}
            </div>
            {score.teacherMessage && (
              <p className="rounded-md bg-paper-dim p-3 text-sm italic text-ink/70">“{score.teacherMessage}”</p>
            )}
            <Button size="sm" variant="outline" onClick={editScore}>
              Change score
            </Button>
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {(Object.keys(SCORE_WEIGHTS) as (keyof ScoreCriteria)[]).map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-48 shrink-0 text-sm text-ink/70">{SCORE_CRITERIA_LABELS[k]}</span>
                  <input
                    type="range"
                    min={0}
                    max={SCORE_WEIGHTS[k]}
                    value={draftCriteria[k]}
                    onChange={(e) => setDraftCriteria((c) => ({ ...c, [k]: Number(e.target.value) }))}
                    className="flex-1 accent-green-600"
                  />
                  <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">
                    {draftCriteria[k]}/{SCORE_WEIGHTS[k]}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
              <span className="font-display text-xl font-semibold tabular-nums text-ink">
                {draftTotal}/100 ({gradeFor(draftTotal)})
              </span>
              {draftTotal >= PASS_THRESHOLD ? (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  ≥ {PASS_THRESHOLD} — will be marked complete
                </span>
              ) : (
                <span className="rounded-full bg-clay-100 px-3 py-1 text-xs font-medium text-clay-700">
                  Below {PASS_THRESHOLD} — needs improvement
                </span>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">
                Teacher's message (goes into the daily report)
              </span>
              <textarea
                value={teacherMessage}
                onChange={(e) => setTeacherMessage(e.target.value)}
                rows={2}
                placeholder="e.g. Excellent work! Keep focus on throat clarity and you'll be perfect."
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
              />
            </label>

            <div className="flex gap-2">
              <Button size="sm" onClick={submitScoreCard}>
                {score ? 'Update score' : 'Submit score'}
              </Button>
              {score && (
                <Button size="sm" variant="ghost" onClick={() => setEditingScore(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* ==================== Daily report (PRD 7.1) ==================== */}
      <Card>
        <CardTitle className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-clay-600" />
          Daily report — live preview of the email sent to {session.studentName} / parent
        </CardTitle>
        <CardContent>
          <div className="space-y-4 rounded-md border border-line bg-paper-dim/40 p-4 text-sm sm:p-5">
            <div className="border-b border-line pb-3">
              <div className="font-display text-lg font-semibold text-ink">
                Your Tajweed Report — {format(new Date(), 'MMM d, yyyy')}
              </div>
              <div className="text-xs text-ink/50">Sent automatically at the end of the class day</div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
                Today's performance summary
              </h4>
              <div className="grid gap-1.5 sm:grid-cols-2">
                <div>
                  Target: <span className="font-medium text-ink">{pointChips(detail.targetEnd).join(' • ')}</span>
                </div>
                <div>
                  Attendance:{' '}
                  <span className="font-medium text-ink">
                    {attendance
                      ? attendance.status === 'present'
                        ? `Present (${formatElapsed(elapsed)})`
                        : 'Absent'
                      : 'Not marked yet'}
                  </span>
                </div>
                <div>
                  Score:{' '}
                  <span className="font-medium text-ink">{score ? `${score.total}/100 (${score.grade})` : 'Not scored yet'}</span>
                </div>
                <div>
                  Mistakes marked: <span className="font-medium text-ink">{mistakes.length}</span>
                </div>
              </div>
            </div>

            {mistakes.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Today's mistakes</h4>
                <div className="space-y-2">
                  {mistakes.map((m, i) => (
                    <div key={m.id} className="rounded-md border border-line bg-paper p-3">
                      <div className="font-medium text-ink">
                        Mistake #{i + 1}: Surah {m.surahName}, Ayah {m.ayah}
                      </div>
                      <div className="mt-1 font-arabic text-base text-ink" dir="rtl">
                        {m.wordText}
                      </div>
                      <div className="mt-1 text-ink/60">Issue: {MISTAKE_TYPE_LABELS[m.type]}</div>
                      {m.note && <div className="text-ink/60">How to fix: {m.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Tomorrow's lesson</h4>
              <div className="rounded-md border border-line bg-paper p-3">
                <div className="font-medium text-ink">
                  {endpoint
                    ? `Surah ${endpoint.surahName}, Ayah ${endpoint.ayah} (page ${endpoint.page})`
                    : pointChips(detail.targetEnd).join(' • ')}
                </div>
                <div className="mt-1 text-ink/60">Expected duration: 20–25 minutes</div>
              </div>
            </div>

            {student && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Your progress</h4>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <div>
                    {UNIT_LABELS[student.pace.unit]} completed:{' '}
                    <span className="font-medium text-ink">
                      {student.unitsCompleted} / {student.totalUnits}
                    </span>
                  </div>
                  <div>
                    Estimated finish: <span className="font-medium text-ink">{student.estimatedCompletion}</span>
                  </div>
                  <div>
                    Streak: <span className="font-medium text-ink">{student.streak} days</span>
                  </div>
                  <div>
                    Points: <span className="font-medium text-ink">{student.points}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Teacher's message</h4>
              <p className="rounded-md border border-line bg-paper p-3 italic text-ink/70">
                {score?.teacherMessage ? `“${score.teacherMessage}”` : 'Add a message in the scoring section above.'}
              </p>
            </div>

            <div className="border-t border-line pt-3 text-xs text-ink/45">
              Best regards,
              <br />
              TILP Team — Tajweed Interactive Learning Platform
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={openMeet}>
          <Video className="mr-2 h-4 w-4" />
          Open Google Meet
        </Button>
        <Button variant="outline" onClick={() => navigate('/teacher/schedule')}>
          Back to schedule
        </Button>
      </div>
    </div>
  )
}
