import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpenText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  PenLine,
  PhoneOff,
  Trash2,
  Video,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BackLink } from '@/components/ui/BackLink'
import {
  MISTAKE_TYPE_LABELS,
  PASS_THRESHOLD,
  SCORE_CRITERIA_LABELS,
  SCORE_WEIGHTS,
  SESSION_DETAILS,
  TEACHER_SCHEDULE,
  UNIT_LABELS,
  gradeFor,
} from '@/lib/mockData'
import type { LessonPoint, MistakeType, ScoreCriteria } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'

/* ── helpers ─────────────────────────────────────────────── */

function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function pointChips(point: LessonPoint) {
  if (point.qaidaLesson) return [`Noorani Qaida — Lesson ${point.qaidaLesson}`]
  const chips: string[] = []
  if (point.juz) chips.push(`Juz ${point.juz}`)
  if (point.surahName) {
    const ref = [point.surahNumber, point.ayah].filter(Boolean).join(':')
    chips.push(`Surah ${point.surahName}${ref ? ` ${ref}` : ''}`)
  }
  if (point.page) chips.push(`Page ${point.page}`)
  return chips
}

// ── Quran.com API shape ────────────────────────────────────

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

/* ── component ────────────────────────────────────────────── */

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
  const detail  = sessionId ? SESSION_DETAILS[sessionId] : undefined
  const student = students.find((s) => s.name === session?.studentName)

  // ── Mushaf page state ──────────────────────────────────
  const pageNumber = detail?.resumeFrom.page ?? null
  const [pageVerses, setPageVerses]   = useState<MushafVerse[] | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError]     = useState(false)
  const [pageOffset, setPageOffset]   = useState(0)
  const [endCandidate, setEndCandidate] = useState<{ ayah: number } | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const base = sessionId ? SESSION_DETAILS[sessionId]?.resumeFrom.page ?? null : null
    if (!base) return
    const page = base + pageOffset
    let cancelled = false
    setPageVerses(null)
    setPageLoading(true)
    setPageError(false)
    fetch(`https://api.quran.com/api/v4/verses/by_page/${page}?words=true&word_fields=text_uthmani&fields=verse_key`)
      .then((res) => { if (!res.ok) throw new Error('page fetch failed'); return res.json() })
      .then((data: { verses: MushafVerse[] }) => { if (!cancelled) setPageVerses(data.verses) })
      .catch(() => { if (!cancelled) setPageError(true) })
      .finally(() => { if (!cancelled) setPageLoading(false) })
    return () => { cancelled = true }
  }, [sessionId, pageOffset])

  // ── Mistake marking state ──────────────────────────────
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null)
  const [mistakeType, setMistakeType]   = useState<MistakeType>('makhraj')
  const [mistakeNote, setMistakeNote]   = useState('')

  // ── Scoring draft state ────────────────────────────────
  const [draftCriteria, setDraftCriteria] = useState<ScoreCriteria>({ makhraj: 0, tajweed: 0, fluency: 0, consistency: 0 })
  const [teacherMessage, setTeacherMessage] = useState('')
  const [editingScore, setEditingScore]     = useState(false)

  const mistakes  = session ? sessionMistakes[session.id] ?? [] : []
  const mistakeAt = (verseKey: string, position: number) =>
    mistakes.find((m) => m.verseKey === verseKey && m.wordPosition === position)

  const onWordClick = (item: Extract<RenderItem, { kind: 'word' }>) => {
    const existing = mistakeAt(item.verseKey, item.position)
    setSelectedWord({ verseKey: item.verseKey, ayah: item.ayah, wordText: item.text, wordPosition: item.position, indexInVerse: item.indexInVerse })
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

  const goToPage = (delta: number) => { setPageOffset((o) => Math.max(0, o + delta)); setEndCandidate(null) }

  if (!session || !detail) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Session not found</h1>
        <Button variant="outline" onClick={() => navigate('/teacher/schedule')}>Back to schedule</Button>
      </div>
    )
  }

  const openMeet   = () => window.open(session.meetUrl, '_blank')
  const startedAt  = sessionStarts[session.id]
  const endedAt    = sessionEnds[session.id]
  const elapsed    = startedAt ? Math.max(0, Math.floor(((endedAt ?? now) - startedAt) / 1000)) : 0
  const attendance = sessionAttendance[session.id]
  const endpoint   = sessionEndpoints[session.id]
  const displayPage = (pageNumber ?? 1) + pageOffset
  const score      = sessionScores[session.id]
  const draftTotal = draftCriteria.makhraj + draftCriteria.tajweed + draftCriteria.fluency + draftCriteria.consistency

  const submitScoreCard = () => {
    submitScore(session.id, { criteria: draftCriteria, total: draftTotal, grade: gradeFor(draftTotal), passed: draftTotal >= PASS_THRESHOLD, teacherMessage: teacherMessage.trim() })
    setEditingScore(false)
  }

  const editScore = () => {
    if (!score) return
    setDraftCriteria(score.criteria)
    setTeacherMessage(score.teacherMessage)
    setEditingScore(true)
  }

  const startAyah  = detail.resumeFrom.ayah
  const endAyah    = detail.targetEnd.ayah
  const verseState = (ayah: number): 'past' | 'today' | 'future' => {
    if (pageOffset > 0) return 'today'
    if (startAyah === null || endAyah === null) return 'today'
    if (ayah < startAyah) return 'past'
    if (ayah > endAyah) return 'future'
    return 'today'
  }
  const lines = pageVerses ? buildLines(pageVerses) : []

  /* ── render ───────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <BackLink to="/teacher/schedule" label="Back to schedule" />

      {/* ── Session header card (matches student schedule style) ── */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-line bg-green-900 px-6 py-5 text-paper">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-semibold">
                  {session.lessonTitle} — {session.studentName}
                </h1>
                {!endedAt && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper/80">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-300" />
                    Live
                  </span>
                )}
                {endedAt && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-paper/60">
                    Ended
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-paper/65">
                {session.className} · {session.duration} min session
                {startedAt && ` · started ${format(new Date(startedAt), 'h:mm a')}`}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={openMeet}>
              <Video className="mr-1.5 h-4 w-4" />
              Open Google Meet
            </Button>
          </div>
        </div>

        {/* ── 4-col stat strip ── */}
        <div className="grid grid-cols-2 divide-x divide-y divide-line bg-white sm:grid-cols-4 sm:divide-y-0">
          {/* Elapsed */}
          <div className="px-5 py-4">
            <div className="text-xs text-ink/45">Elapsed</div>
            <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
              {formatElapsed(elapsed)}
            </div>
          </div>

          {/* Attendance */}
          <div className="px-5 py-4">
            <div className="text-xs text-ink/45">Attendance</div>
            <div className="mt-1">
              {attendance ? (
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {attendance.status === 'present' ? (
                    <><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-green-700">Present</span></>
                  ) : (
                    <><XCircle className="h-4 w-4 text-clay-600" /><span className="text-clay-700">Absent</span></>
                  )}
                </div>
              ) : (
                <div className="text-sm text-ink/35">Not marked</div>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="px-5 py-4">
            <div className="text-xs text-ink/45">Score</div>
            {score ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-ink">{score.total}%</span>
                <span className={`rounded-lg px-2 py-0.5 text-sm font-bold ${score.passed ? 'bg-green-50 text-green-700' : 'bg-clay-100 text-clay-700'}`}>
                  {score.grade}
                </span>
              </div>
            ) : (
              <div className="mt-1 text-sm text-ink/35">Not scored</div>
            )}
          </div>

          {/* Mistakes */}
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

      {/* ── Attendance + session control bar ── */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink/60">Attendance:</span>
            {attendance ? (
              <>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${attendance.status === 'present' ? 'bg-green-50 text-green-700' : 'bg-clay-100 text-clay-700'}`}>
                  {attendance.status === 'present' ? 'Present' : 'Absent'} · {format(new Date(attendance.markedAt), 'h:mm a')}
                </span>
                <Button size="sm" variant="ghost" onClick={() => markAttendance(session.id, attendance.status === 'present' ? 'absent' : 'present')}>
                  Change to {attendance.status === 'present' ? 'absent' : 'present'}
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => markAttendance(session.id, 'present')}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark present
                </Button>
                <Button size="sm" variant="danger" onClick={() => markAttendance(session.id, 'absent')}>
                  <XCircle className="mr-1.5 h-4 w-4" /> Mark absent
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!endedAt ? (
              <Button size="sm" variant="danger" onClick={() => endSession(session.id)}>
                <PhoneOff className="mr-1.5 h-4 w-4" />
                End session
              </Button>
            ) : (
              <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-medium text-ink/50">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                Session ended · {format(new Date(endedAt), 'h:mm a')}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* ── Post-session summary (shown once session ends) ── */}
      {endedAt && startedAt && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-line bg-paper-dim/60 px-6 py-4">
            <h2 className="font-display text-base font-semibold text-ink">Session summary</h2>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line bg-white">
            <div className="px-5 py-4">
              <div className="text-xs text-ink/45">Duration</div>
              <div className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">{formatElapsed(elapsed)}</div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-ink/45">Started</div>
              <div className="mt-1 text-sm font-medium text-ink">{format(new Date(startedAt), 'h:mm a')}</div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-ink/45">Ended</div>
              <div className="mt-1 text-sm font-medium text-ink">{format(new Date(endedAt), 'h:mm a')}</div>
            </div>
          </div>
          {endpoint && (
            <div className="border-t border-green-200 bg-green-50 px-5 py-3 text-sm text-green-800">
              Next session resumes from Surah {endpoint.surahName}, Ayah {endpoint.ayah} (page {endpoint.page}) — saved as the new starting point.
            </div>
          )}
          {!attendance && (
            <div className="border-t border-gold-200 bg-gold-100/60 px-5 py-3 text-sm text-gold-800">
              Attendance wasn't marked — use the bar above before you leave.
            </div>
          )}
        </Card>
      )}

      {/* ── Start / Target range cards ── */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <CardTitle className="mb-4 flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-green-700" />
            Start from here
          </CardTitle>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {pointChips(detail.resumeFrom).map((chip) => (
                <span key={chip} className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-800">
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-sm text-ink/60">
              This is where {session.studentName.split(' ')[0]} stopped last session — begin reading from this point.
            </p>
            {detail.notes && (
              <div className="rounded-2xl border border-gold-200 bg-gold-100/40 p-3.5">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-700/70">Teacher's note</div>
                <p className="text-xs leading-5 text-ink/70">{detail.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardTitle className="mb-4 flex items-center gap-2">
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

      {/* ── Mistake marking form (appears when word is selected) ── */}
      {selectedWord && !detail.resumeFrom.qaidaLesson && (
        <div ref={formRef}>
          <Card className="border-gold-300 p-6">
            <CardTitle className="mb-4 flex items-center gap-2">
              <PenLine className="h-5 w-5 text-gold-700" />
              Mark mistake — Surah {detail.resumeFrom.surahName} {selectedWord.verseKey}
            </CardTitle>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-2xl bg-paper-dim px-3 py-1.5 font-arabic text-xl text-ink" dir="rtl">
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
                    className="h-10 w-full rounded-xl border border-line bg-white px-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                  >
                    {(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map((t) => (
                      <option key={t} value={t}>{MISTAKE_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink/60">Correction / note</span>
                  <input
                    value={mistakeNote}
                    onChange={(e) => setMistakeNote(e.target.value)}
                    placeholder='e.g. "Ghar not clear — repeat from deep in the throat"'
                    className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={saveMistake}>Save mistake</Button>
                {mistakeAt(selectedWord.verseKey, selectedWord.wordPosition) && (
                  <Button size="sm" variant="danger" onClick={unmarkSelected}>
                    <Trash2 className="mr-1.5 h-4 w-4" />Remove mark
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setSelectedWord(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Lesson content (Qaida or Mushaf) ── */}
      {detail.resumeFrom.qaidaLesson ? (
        <Card className="p-6">
          <CardTitle className="mb-4">Lesson content — Noorani Qaida, Lesson {detail.resumeFrom.qaidaLesson}</CardTitle>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-line bg-paper p-5 text-center">
              <p className="font-arabic text-2xl leading-loose text-ink" dir="rtl">{detail.contentAr}</p>
            </div>
            <p className="text-sm text-ink/70">{detail.contentEn}</p>
            <p className="text-xs text-ink/50">Qaida audio comes from teacher uploads / the Qaida library.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Mushaf — Page {displayPage}</CardTitle>
            <div className="flex items-center gap-2">
              {detail.resumeFrom.juz && (
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                  Juz {detail.resumeFrom.juz}
                </span>
              )}
              <span className="rounded-full bg-paper-dim px-2.5 py-0.5 text-xs font-medium text-ink/55">
                16-line Madani Mushaf
              </span>
              <span className="rounded-full bg-clay-100 px-2.5 py-0.5 text-xs font-medium text-clay-700">
                {mistakes.length} mistake{mistakes.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <p className="mb-4 text-xs text-ink/50">
            Click any word to mark a mistake and write the correction — marked words turn red. Click a ﴿…﴾ ayah marker to mark where today's lesson ends.
          </p>

          {pageLoading && (
            <div className="rounded-2xl border border-line bg-paper-dim/50 p-8 text-center text-sm text-ink/55">
              Loading Mushaf page {displayPage} from Quran.com…
            </div>
          )}
          {pageError && (
            <div className="rounded-2xl border border-line bg-paper-dim/50 p-5 text-center text-sm text-ink/60">
              Couldn't load the Mushaf page (offline?). Starting text for today:
              <p className="mt-3 font-arabic text-xl leading-loose text-ink" dir="rtl">{detail.contentAr}</p>
            </div>
          )}
          {pageVerses && (
            <>
              <div className="rounded-2xl border-2 border-gold-300 bg-paper p-4 shadow-card sm:p-6">
                <div dir="rtl" className="space-y-1">
                  {lines.map((line, li) => (
                    <p key={li} className="font-arabic text-[21px] leading-[2.35] text-justify text-ink">
                      {line.map((item, ii) => {
                        if (item.kind === 'end') {
                          const isMarkedEnd  = endpoint?.verseKey === item.verseKey
                          const isCandidate  = endCandidate?.ayah === item.ayah
                          return (
                            <span
                              key={ii}
                              onClick={() => setEndCandidate({ ayah: item.ayah })}
                              title="Click to mark where today's lesson ends"
                              className={[
                                'mx-0.5 cursor-pointer rounded px-0.5 transition',
                                isMarkedEnd ? 'bg-green-100 text-green-700 ring-1 ring-green-500'
                                  : isCandidate ? 'bg-gold-200 text-gold-800 ring-2 ring-gold-500'
                                  : 'text-gold-700 hover:bg-gold-100',
                              ].join(' ')}
                            >
                              ﴿{item.text}﴾
                            </span>
                          )
                        }
                        const state    = verseState(item.ayah)
                        const mistake  = mistakeAt(item.verseKey, item.position)
                        const isStart  = item.ayah === startAyah && item.position === 1 && pageOffset === 0
                        const isSelected = selectedWord?.verseKey === item.verseKey && selectedWord?.wordPosition === item.position
                        return (
                          <span key={ii}>
                            {isStart && (
                              <span dir="ltr" className="mx-1 inline-flex translate-y-[-2px] items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">
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
                                mistake   ? 'bg-clay-200 text-clay-900 ring-1 ring-clay-400' : '',
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

              {endCandidate && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gold-400 bg-gold-100/60 px-4 py-3">
                  <span className="text-sm text-ink/80">
                    End today's lesson at{' '}
                    <span className="font-semibold">Surah {detail.resumeFrom.surahName}, Ayah {endCandidate.ayah}</span>?
                    The next session will start from this point.
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={confirmEndMark}>Mark end for today</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEndCandidate(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              {endpoint && !endCandidate && (
                <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  End of today's lesson marked at Surah {endpoint.surahName}, Ayah {endpoint.ayah} (page {endpoint.page}) — the next session starts from this point. To change it, click another ﴿…﴾ marker.
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={pageOffset === 0} onClick={() => goToPage(-1)}>
                  <ChevronRight className="mr-1 h-4 w-4" />Previous page
                </Button>
                <span className="text-sm font-medium text-ink/60">Page {displayPage}</span>
                <Button variant="outline" size="sm" onClick={() => goToPage(1)}>
                  Next page<ChevronLeft className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* ── Live mistakes list ── */}
      {!detail.resumeFrom.qaidaLesson && (
        <Card className="p-6">
          <CardTitle className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-clay-600" />
            Mistakes marked ({mistakes.length})
            {mistakes.length > 0 && (
              <span className="ml-auto rounded-full bg-clay-100 px-2 py-0.5 text-xs font-bold text-clay-700">
                {mistakes.length}
              </span>
            )}
          </CardTitle>
          <CardContent className="space-y-0">
            {mistakes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-paper/60 py-8 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-green-600" />
                <p className="mt-2 font-medium text-ink">No mistakes marked yet</p>
                <p className="mt-1 text-xs text-ink/45">Click words in the Mushaf above to mark mistakes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mistakes.map((m, i) => (
                  <div key={m.id} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-clay-50">
                      <AlertCircle className="h-4 w-4 text-clay-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-arabic text-base text-ink">{m.wordText}</span>
                        <span className="text-xs text-ink/45">Surah {m.surahName} {m.ayah}</span>
                        <span className="rounded-full bg-clay-100 px-2 py-0.5 text-[10px] font-semibold text-clay-700">
                          {MISTAKE_TYPE_LABELS[m.type]}
                        </span>
                        <span className="text-[10px] text-ink/35">#{i + 1} · {format(new Date(m.markedAt), 'h:mm a')}</span>
                      </div>
                      {m.note && <p className="mt-1 text-xs leading-5 text-ink/60">{m.note}</p>}
                    </div>
                    <button
                      onClick={() => removeMistake(session.id, m.id)}
                      className="rounded-xl p-1.5 text-ink/35 hover:bg-clay-100 hover:text-clay-700"
                      title="Remove this mistake"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Scoring ── */}
      <Card className="p-6">
        <CardTitle className="mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-gold-700" />
          Score — {session.studentName}
          {score && !editingScore && (
            <span className={`ml-auto rounded-full px-3 py-1 text-sm font-semibold ${score.passed ? 'bg-green-50 text-green-700' : 'bg-clay-100 text-clay-700'}`}>
              {score.total}/100 ({score.grade}) {score.passed ? '· Complete' : '· Needs work'}
            </span>
          )}
        </CardTitle>
        <CardContent className="space-y-0">
          {score && !editingScore ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(SCORE_WEIGHTS) as (keyof ScoreCriteria)[]).map((k) => {
                  const pct = Math.round((score.criteria[k] / SCORE_WEIGHTS[k]) * 100)
                  return (
                    <div key={k}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-ink/70">{SCORE_CRITERIA_LABELS[k]}</span>
                        <span className="text-ink/50">{score.criteria[k]}/{SCORE_WEIGHTS[k]}</span>
                      </div>
                      <div className="h-2 rounded-full bg-line">
                        <div className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-600' : pct >= 60 ? 'bg-sky-500' : 'bg-clay-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              {score.teacherMessage && (
                <div className="rounded-2xl bg-paper p-3.5 text-sm leading-6 text-ink/70">
                  <span className="font-semibold text-ink">Message: </span>{score.teacherMessage}
                </div>
              )}
              <Button size="sm" variant="outline" onClick={editScore}>Change score</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {(Object.keys(SCORE_WEIGHTS) as (keyof ScoreCriteria)[]).map((k) => (
                  <div key={k}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-ink/70">{SCORE_CRITERIA_LABELS[k]}</span>
                      <span className="text-ink/50">{draftCriteria[k]}/{SCORE_WEIGHTS[k]}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={SCORE_WEIGHTS[k]}
                      value={draftCriteria[k]}
                      onChange={(e) => setDraftCriteria((c) => ({ ...c, [k]: Number(e.target.value) }))}
                      className="w-full accent-green-600"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 border-t border-line pt-3">
                <span className="font-display text-2xl font-semibold tabular-nums text-ink">
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
                <span className="mb-1 block text-xs font-medium text-ink/60">Teacher's message (goes into the daily report)</span>
                <textarea
                  value={teacherMessage}
                  onChange={(e) => setTeacherMessage(e.target.value)}
                  rows={2}
                  placeholder="e.g. Excellent work! Keep focus on throat clarity and you'll be perfect."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
                />
              </label>

              <div className="flex gap-2">
                <Button size="sm" onClick={submitScoreCard}>
                  {score ? 'Update score' : 'Submit score'}
                </Button>
                {score && (
                  <Button size="sm" variant="ghost" onClick={() => setEditingScore(false)}>Cancel</Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Daily report preview ── */}
      <Card className="p-6">
        <CardTitle className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-clay-600" />
          Daily report — live preview
        </CardTitle>
        <CardContent>
          <div className="space-y-4 rounded-2xl border border-line bg-paper-dim/40 p-4 text-sm sm:p-5">
            <div className="border-b border-line pb-3">
              <div className="font-display text-lg font-semibold text-ink">
                Your Tajweed Report — {format(new Date(), 'MMM d, yyyy')}
              </div>
              <div className="text-xs text-ink/50">Sent automatically at the end of the class day</div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div>Target: <span className="font-medium text-ink">{pointChips(detail.targetEnd).join(' · ')}</span></div>
              <div>Attendance: <span className="font-medium text-ink">{attendance ? (attendance.status === 'present' ? `Present (${formatElapsed(elapsed)})` : 'Absent') : 'Not marked yet'}</span></div>
              <div>Score: <span className="font-medium text-ink">{score ? `${score.total}/100 (${score.grade})` : 'Not scored yet'}</span></div>
              <div>Mistakes: <span className="font-medium text-ink">{mistakes.length}</span></div>
            </div>

            {mistakes.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Today's mistakes</div>
                <div className="space-y-2">
                  {mistakes.map((m, i) => (
                    <div key={m.id} className="rounded-2xl border border-line bg-white p-3">
                      <div className="font-medium text-ink">#{i + 1}: Surah {m.surahName}, Ayah {m.ayah}</div>
                      <div className="mt-1 font-arabic text-base text-ink" dir="rtl">{m.wordText}</div>
                      <div className="mt-1 text-ink/60">Issue: {MISTAKE_TYPE_LABELS[m.type]}</div>
                      {m.note && <div className="text-ink/60">How to fix: {m.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Tomorrow's lesson</div>
              <div className="rounded-2xl border border-line bg-white p-3">
                <div className="font-medium text-ink">
                  {endpoint ? `Surah ${endpoint.surahName}, Ayah ${endpoint.ayah} (page ${endpoint.page})` : pointChips(detail.targetEnd).join(' · ')}
                </div>
                <div className="mt-1 text-ink/60">Expected duration: 20–25 minutes</div>
              </div>
            </div>

            {student && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Student progress</div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <div>{UNIT_LABELS[student.pace.unit]} completed: <span className="font-medium text-ink">{student.unitsCompleted} / {student.totalUnits}</span></div>
                  <div>Estimated finish: <span className="font-medium text-ink">{student.estimatedCompletion}</span></div>
                  <div>Streak: <span className="font-medium text-ink">{student.streak} days</span></div>
                  <div>Points: <span className="font-medium text-ink">{student.points}</span></div>
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Teacher's message</div>
              <p className="rounded-2xl border border-line bg-white p-3 italic text-ink/70">
                {score?.teacherMessage ? `"${score.teacherMessage}"` : 'Add a message in the scoring section above.'}
              </p>
            </div>

            <div className="border-t border-line pt-3 text-xs text-ink/45">
              Best regards,<br />
              TILP Team — Tajweed Interactive Learning Platform
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom buttons ── */}
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
