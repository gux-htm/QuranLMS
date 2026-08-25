import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Award, CheckCircle2, Clock, Copy, Trash2, Video } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { MistakeLogger } from '@/components/teacher/MistakeLogger'
import type { MistakeDraft } from '@/components/teacher/MistakeLogger'
import { ScoringRubric } from '@/components/teacher/ScoringRubric'
import { useSessionLesson } from '@/hooks/useSessionLesson'
import { useSubmitScore } from '@/hooks/useSubmitScore'
import { useToast } from '@/components/ui/Toaster'
import { useAppStore } from '@/lib/store'
import { QARI_OPTIONS, ayahAudioUrl } from '@/lib/curriculumData'
import { LESSON_MISTAKE_TYPE_LABELS, RUBRIC_MAX } from '@/types'
import type { LessonMistakeType, LessonRubric } from '@/types'
import { gradeFor } from '@/lib/mockData'
import type { MistakeType } from '@/lib/mockData'

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Quran.com word-level shape (with transliteration for the word popup)
interface MushafWord {
  position: number
  char_type_name: 'word' | 'end'
  text_uthmani: string
  transliteration?: string
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

// Maps the popup's mistake taxonomy onto the store's SessionMistake type
const TYPE_TO_STORE: Record<LessonMistakeType, MistakeType> = {
  makhraj: 'makhraj',
  ghunnah: 'tajweed',
  tafkheem: 'tajweed',
  tajweed_rule: 'tajweed',
  other: 'other',
}

export function TeacherLessonView() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const {
    students,
    sessionStarts,
    startSessionTimer,
    sessionAttendance,
    markAttendance,
    sessionMistakes,
    addMistake,
    removeMistake,
    sessionRubrics,
  } = useAppStore()
  const { data, loading } = useSessionLesson(sessionId)
  const { submit, loading: submitting } = useSubmitScore()

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (sessionId) startSessionTimer(sessionId)
  }, [sessionId])

  // --- Mushaf fetch (left panel content) ---
  const [verses, setVerses] = useState<MushafVerse[] | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState(false)

  useEffect(() => {
    const page = data?.detail.resumeFrom.page ?? null
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
  }, [data])

  // --- Mistake popup state ---
  const [selectedWord, setSelectedWord] = useState<RenderWord | null>(null)

  // --- Rubric + feedback state ---
  const savedRubric = sessionId ? sessionRubrics[sessionId] : undefined
  const [criteria, setCriteria] = useState<LessonRubric>({ ...RUBRIC_MAX })
  const [feedback, setFeedback] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (savedRubric) {
      setCriteria(savedRubric.criteria)
      setFeedback(savedRubric.feedback)
      setSaved(true)
    } else {
      setCriteria({ ...RUBRIC_MAX })
      setFeedback('')
      setSaved(false)
    }
  }, [sessionId, savedRubric])

  // --- Audio qari state ---
  const [qari, setQari] = useState('ar.abdurrahmaansudais')

  const mistakes = sessionId ? sessionMistakes[sessionId] ?? [] : []

  // Reverse-maps a stored mistake back into the popup's draft shape
  const guessType = (type: MistakeType, subtype?: string): LessonMistakeType => {
    if (type === 'makhraj') return 'makhraj'
    if (subtype?.includes(LESSON_MISTAKE_TYPE_LABELS.ghunnah)) return 'ghunnah'
    if (subtype?.includes(LESSON_MISTAKE_TYPE_LABELS.tafkheem)) return 'tafkheem'
    if (type === 'tajweed') return 'tajweed_rule'
    return 'other'
  }

  const existingDraft = useMemo<MistakeDraft | null>(() => {
    if (!selectedWord) return null
    const found = mistakes.find(
      (m) => m.verseKey === selectedWord.verseKey && m.wordPosition === selectedWord.position
    )
    if (!found) return null
    const type = guessType(found.type, found.subtype)
    const subtypePart = found.subtype?.split(':')[0].trim() ?? ''
    return {
      verseKey: found.verseKey,
      ayah: found.ayah,
      wordText: found.wordText,
      wordPosition: found.wordPosition,
      type,
      subtype: subtypePart,
      deduction: found.deduction ?? 0,
      note: found.note,
    }
  }, [selectedWord, mistakes])

  if (loading) {
    return (
      <div className="rounded-lg border border-line bg-white p-10 text-center text-sm text-ink/55">
        Loading session lesson…
      </div>
    )
  }

  if (!data || !sessionId) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Session not found</h1>
        <Button variant="outline" onClick={() => navigate('/teacher/schedule')}>
          Back to schedule
        </Button>
      </div>
    )
  }

  const { session, detail, studentName } = data
  const student = students.find((s) => s.name === studentName)
  const startedAt = sessionStarts[session.id]
  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
  const attendance = sessionAttendance[session.id]

  const total = criteria.makhraj + criteria.tajweed + criteria.fluency + criteria.consistency + criteria.memory
  const grade = gradeFor(total)

  const isQaida = !!detail.resumeFrom.qaidaLesson

  // Words for the clickable text (flat list preserving reading order)
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
            transliteration: w.transliteration,
          }))
      )

  const translitLine = words.map((w) => w.transliteration).filter(Boolean).join(' ')

  // Audio segments for the lesson's ayah range
  const audioSegments = useMemo(() => {
    if (!detail.audioRange) return []
    const segs = []
    for (let a = detail.audioRange.startAyah; a <= Math.min(detail.audioRange.endAyah, detail.audioRange.startAyah + 14); a++) {
      segs.push({ label: `${detail.audioRange.surah}:${a}`, url: ayahAudioUrl(detail.audioRange.surah, a, qari) })
    }
    return segs
  }, [detail.audioRange, qari])

  const mistakeAt = (verseKey: string, position: number) =>
    mistakes.find((m) => m.verseKey === verseKey && m.wordPosition === position)

  const handleAddMistake = (draft: MistakeDraft) => {
    addMistake(session.id, {
      verseKey: draft.verseKey,
      surahName: detail.resumeFrom.surahName ?? '',
      ayah: draft.ayah,
      wordText: draft.wordText,
      wordPosition: draft.wordPosition,
      type: TYPE_TO_STORE[draft.type],
      note: draft.note,
      subtype: [draft.subtype, LESSON_MISTAKE_TYPE_LABELS[draft.type]].filter(Boolean).join(': '),
      deduction: draft.deduction,
    })
    setSelectedWord(null)
    push(`Mistake logged on ${draft.verseKey}`)
  }

  const copyMeetLink = async () => {
    try {
      await navigator.clipboard.writeText(session.meetUrl)
      push('Meet link copied to clipboard')
    } catch {
      push('Could not copy the link', 'error')
    }
  }

  const handleSave = async () => {
    try {
      await submit(session.id, { criteria, total, grade, feedback: feedback.trim() })
      setSaved(true)
      push(`Score saved for ${studentName}`)
      navigate('/teacher/schedule')
    } catch {
      push('Failed to save. Try again.', 'error')
    }
  }

  // Session summary values (derived from the submission/lesson data)
  const linesCovered = verses?.length ? Math.max(16, words.length > 0 ? 16 : 24) : 24
  const completionPct = student && student.totalUnits > 0 ? Math.round((student.unitsCompleted / student.totalUnits) * 100) : 0

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/teacher/schedule')}
        className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to schedule
      </button>

      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Class: {session.className} | Student: {studentName}
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            {session.lessonTitle} • estimated {session.duration} min
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold tabular-nums text-paper">
            <Clock className="h-4 w-4" />
            Session elapsed: {formatElapsed(elapsed)}
          </span>
          <Button variant="outline" size="sm" onClick={copyMeetLink}>
            <Copy className="mr-1.5 h-4 w-4" />
            Copy Meet link
          </Button>
          <Button size="sm" onClick={() => window.open(session.meetUrl, '_blank')}>
            <Video className="mr-1.5 h-4 w-4" />
            Join Meet
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ==================== Left: lesson content ==================== */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">Lesson content</CardTitle>

            {isQaida ? (
              <div className="space-y-3">
                <div className="rounded-md border border-line bg-paper p-5 text-center">
                  <p className="font-arabic text-3xl leading-loose text-ink" dir="rtl">
                    {detail.contentAr}
                  </p>
                </div>
                <p className="text-sm italic text-ink/60">{detail.contentTranslit}</p>
                <p className="text-sm text-ink/70">{detail.contentEn}</p>
              </div>
            ) : (
              <>
                {pageLoading && (
                  <div className="rounded-md border border-line bg-paper-dim/50 p-8 text-center text-sm text-ink/55">
                    Loading Mushaf page {detail.resumeFrom.page}…
                  </div>
                )}
                {pageError && (
                  <div className="rounded-md border border-line bg-paper-dim/50 p-5 text-center text-sm text-ink/60">
                    Couldn't load the Mushaf page (offline?). Lesson text:
                    <p className="mt-3 font-arabic text-2xl leading-loose text-ink" dir="rtl">
                      {detail.contentAr}
                    </p>
                  </div>
                )}
                {verses && (
                  <>
                    <div className="rounded-lg border-2 border-gold-300 bg-paper p-4">
                      <p className="text-justify font-arabic text-[26px] leading-[2.2] text-ink" dir="rtl">
                        {words.map((w, i) => {
                          const marked = mistakeAt(w.verseKey, w.position)
                          return (
                            <span key={i}>
                              <span
                                onClick={() => setSelectedWord(w)}
                                title="Click to log a mistake"
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

                    <div className="mt-3">
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                        English translation
                      </h4>
                      <p className="text-sm text-ink/70">{detail.contentEn}</p>
                    </div>
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
                  className="h-8 rounded-md border border-line bg-white px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
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
              emptyHint="No pre-recorded audio for this lesson — recite live with the student."
            />
          </Card>
        </div>

        {/* ==================== Right: attendance + scoring ==================== */}
        <div className="space-y-4">
          {/* Attendance panel */}
          <Card>
            <CardTitle className="mb-3">Attendance</CardTitle>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={attendance?.status === 'present' ? 'default' : 'outline'}
                onClick={() => markAttendance(session.id, 'present')}
              >
                Mark Present
              </Button>
              <Button
                className={attendance?.status === 'late' ? '' : 'border border-line text-ink hover:bg-gold-100'}
                variant={attendance?.status === 'late' ? 'default' : 'ghost'}
                onClick={() => markAttendance(session.id, 'late')}
              >
                Mark Late
              </Button>
              <Button variant="danger" onClick={() => markAttendance(session.id, 'absent')}>
                Mark Absent
              </Button>
            </div>
            {attendance ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                {attendance.status === 'present' ? 'Presence' : attendance.status === 'late' ? 'Late arrival' : 'Absence'}{' '}
                recorded at {format(new Date(attendance.markedAt), 'h:mm a')}
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink/50">Attendance not marked yet.</p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm">
              <div className="rounded-md border border-line p-2.5">
                <div className="text-xs text-ink/50">Session start</div>
                <div className="font-medium text-ink">
                  {startedAt ? format(new Date(startedAt), 'h:mm a') : `${session.time} (scheduled)`}
                </div>
              </div>
              <div className="rounded-md border border-line p-2.5">
                <div className="text-xs text-ink/50">Estimated duration</div>
                <div className="font-medium text-ink">{session.duration} min</div>
              </div>
              <div className="rounded-md border border-line p-2.5">
                <div className="text-xs text-ink/50">Lines covered</div>
                <div className="font-medium tabular-nums text-ink">{isQaida ? 8 : linesCovered} lines</div>
              </div>
              <div className="rounded-md border border-line p-2.5">
                <div className="text-xs text-ink/50">Completion</div>
                <div className="font-medium tabular-nums text-ink">
                  {completionPct}%{student ? ` • est. ${format(new Date(student.estimatedCompletion), 'MMM d, yyyy')}` : ''}
                </div>
              </div>
            </div>
          </Card>

          {/* Scoring rubric */}
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-700" />
                Scoring rubric
              </CardTitle>
              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold tabular-nums text-green-700">
                Total: {total}/100 | Grade: {grade}
              </span>
            </div>

            <ScoringRubric value={criteria} onChange={setCriteria} />

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Feedback summary</span>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                placeholder='e.g. "Excellent work today! Focus on Ghar clarity next time."'
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
              />
            </label>

            {saved && savedRubric && (
              <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                Saved: {savedRubric.total}/100 ({savedRubric.grade}) at {format(new Date(savedRubric.savedAt), 'h:mm a')}
              </p>
            )}
          </Card>

          {/* Mistake list */}
          {!isQaida && (
            <Card>
              <CardTitle className="mb-3">Logged mistakes ({mistakes.length})</CardTitle>
              {mistakes.length === 0 ? (
                <p className="rounded-md border border-line p-4 text-sm text-ink/55">
                  Click any word in the lesson text to log a mistake.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-paper-dim text-xs uppercase tracking-wide text-ink/50">
                      <tr>
                        <th className="px-3 py-2 font-medium">Word</th>
                        <th className="px-3 py-2 font-medium">Ayah</th>
                        <th className="px-3 py-2 font-medium">Issue</th>
                        <th className="px-3 py-2 font-medium">Deducted</th>
                        <th className="px-3 py-2 font-medium">Notes</th>
                        <th className="px-3 py-2 font-medium" aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {mistakes.map((m) => (
                        <tr key={m.id} className="border-t border-line">
                          <td className="px-3 py-2 font-arabic text-base text-ink" dir="rtl">
                            {m.wordText}
                          </td>
                          <td className="px-3 py-2 tabular-nums text-ink/60">{m.verseKey}</td>
                          <td className="px-3 py-2 text-ink/70">{m.subtype ?? m.type}</td>
                          <td className="px-3 py-2 tabular-nums text-clay-600">
                            {m.deduction ? `-${m.deduction}` : '—'}
                          </td>
                          <td className="max-w-[160px] truncate px-3 py-2 text-ink/55" title={m.note}>
                            {m.note || '—'}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => removeMistake(session.id, m.id)}
                              className="rounded-md p-1.5 text-ink/40 hover:bg-clay-100 hover:text-clay-700"
                              aria-label="Remove mistake"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={submitting} className="flex-1">
              {submitting ? 'Saving…' : 'Save Score'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/schedule')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Word-click mistake popup */}
      <MistakeLogger
        word={
          selectedWord
            ? {
                verseKey: selectedWord.verseKey,
                ayah: selectedWord.ayah,
                wordText: selectedWord.text,
                wordPosition: selectedWord.position,
                transliteration: selectedWord.transliteration,
              }
            : null
        }
        existing={existingDraft}
        onClose={() => setSelectedWord(null)}
        onAdd={handleAddMistake}
      />
    </div>
  )
}
