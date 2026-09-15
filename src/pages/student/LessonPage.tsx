import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { WordByWordMode } from '@/components/student/WordByWordMode'
import { CURRENT_STUDENT, today } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/Toaster'

const FALLBACK_ASSIGNMENT = {
  id: 'current-student-lesson',
  curriculumTitle: 'Juz 1 · Pages 4–6',
  deadline: format(today, 'yyyy-MM-dd'),
  notes: 'Continue with a calm, steady pace.',
}

const ASSIGNMENT_TITLES: Record<string, string> = {
  '1': 'Juz 1 · Pages 7–9',
  '2': 'Juz 1 · Pages 4–6',
  '3': 'Noorani Qaida · Lesson 12',
}

const QARIS = [
  { label: 'Abdur-Rahman As-Sudais', id: 'ar.abdurrahmaansudais' },
  { label: 'Mohamed Siddiq Al-Minshawi', id: 'ar.minshawi' },
  { label: 'Mishary Rashid Alafasy', id: 'ar.alafasy' },
  { label: 'Mahmoud Khalil Al-Husary', id: 'ar.husary' },
  { label: 'Abdul Basit (Murattal)', id: 'ar.abdulbasitmurattal' },
]

const GLOBAL_AYAHS = [1, 2, 3, 4, 5, 6, 7]

export function StudentLessonPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { lessonAssignments, lessonProgress, saveLessonProgress, completeLesson } = useAppStore()
  const { push } = useToast()
  const [qari, setQari] = useState('ar.alafasy')
  const [mode, setMode] = useState<'full' | 'word'>('full')

  const assignment = useMemo(() => {
    if (id) {
      const stored = lessonAssignments.find(
        (item) => item.id === id && item.studentIds.includes(CURRENT_STUDENT.id)
      )
      if (stored) return stored
      if (ASSIGNMENT_TITLES[id]) return { id, curriculumTitle: ASSIGNMENT_TITLES[id], deadline: format(today, 'yyyy-MM-dd'), notes: '' }
      return null
    }
    return lessonAssignments.find((item) => item.studentIds.includes(CURRENT_STUDENT.id)) ?? FALLBACK_ASSIGNMENT
  }, [id, lessonAssignments])

  const saved = assignment ? lessonProgress[assignment.id] ?? 0 : 0
  const [lines, setLines] = useState(saved)
  const [quantity, setQuantity] = useState(Math.max(CURRENT_STUDENT.pace.quantity, 0.1))
  const [validation, setValidation] = useState('')
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)

  const completionUnit = CURRENT_STUDENT.pace.unit
  const targetQuantity = 1

  const segments = useMemo(
    () => GLOBAL_AYAHS.map((ayah) => ({ label: `1:${ayah}`, url: `https://cdn.islamic.network/quran/audio/128/${qari}/${ayah}.mp3` })),
    [qari]
  )

  if (!assignment) {
    return (
      <Card className="p-6">
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
            <BookOpen className="h-6 w-6 text-green-700" />
          </div>
          <p className="mt-4 font-semibold text-ink">This lesson isn't available yet.</p>
          <p className="mt-1 text-sm text-ink/50">Your teacher hasn't assigned it yet.</p>
          <button
            onClick={() => navigate('/student/assignments')}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to assignments
          </button>
        </CardContent>
      </Card>
    )
  }

  const progress = Math.round((Math.min(lines, 16) / 16) * 100)
  const status = lines >= 16 ? 'Completed' : lines > 0 ? 'In progress' : 'Pending'
  const statusClass =
    status === 'Completed'
      ? 'bg-green-50 text-green-700'
      : status === 'In progress'
      ? 'bg-sky-100 text-sky-700'
      : 'bg-gold-100 text-gold-800'

  const validate = (value: number) => {
    if (value <= 0 || value > targetQuantity * 2) {
      setValidation('Enter a valid amount')
      return false
    }
    setValidation('')
    return true
  }

  const save = async () => {
    if (!validate(quantity)) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    saveLessonProgress(
      assignment.id,
      Math.min(16, Math.round((quantity * 16) / Math.max(1, CURRENT_STUDENT.pace.quantity)))
    )
    push('Progress saved')
    setSaving(false)
  }

  const complete = async () => {
    if (!validate(quantity)) return
    setCompleting(true)
    await new Promise((r) => setTimeout(r, 500))
    completeLesson(assignment.id)
    push('Lesson marked complete!')
    setCompleting(false)
    navigate('/student')
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Back nav */}
      <button
        onClick={() => navigate('/student/assignments')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-900"
      >
        <ArrowLeft className="h-4 w-4" /> Assignments
      </button>

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{assignment.curriculumTitle}</h1>
          <p className="mt-1 text-sm text-ink/55">
            Assigned by {CURRENT_STUDENT.teacherName} · Due{' '}
            {format(new Date(`${assignment.deadline ?? format(today, 'yyyy-MM-dd')}T12:00:00`), 'MMM d, yyyy')}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{status}</span>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left — recitation */}
        <div className="space-y-5">
          {/* Arabic text */}
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <CardTitle className="text-green-900">Today's recitation</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <BookOpen className="h-4 w-4" />
              </span>
            </div>
            <CardContent className="space-y-4">
              <div
                dir="rtl"
                className="rounded-2xl border border-line bg-paper/60 p-5 text-right font-[Noto_Naskh_Arabic] text-3xl leading-[2.2] text-ink sm:text-4xl"
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ
                الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا
                الصِّرَاطَ الْمُسْتَقِيمَ
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-sm leading-7 text-ink/60">
                  Bismillāhi r-raḥmāni r-raḥīm. Al-ḥamdu lillāhi rabbi l-ʿālamīn…
                </p>
                <p className="mt-2 text-xs leading-6 text-ink/45">
                  In the name of Allah, the Most Compassionate, the Most Merciful. All praise belongs to Allah, Lord of all worlds…
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audio player */}
          <Card className="p-6">
            <CardContent className="space-y-4">
              {/* Mode toggle */}
              <div className="flex rounded-xl border border-line bg-paper-dim p-1">
                <button
                  type="button"
                  onClick={() => setMode('full')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    mode === 'full' ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'
                  }`}
                >
                  Full recitation
                </button>
                <button
                  type="button"
                  onClick={() => setMode('word')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    mode === 'word' ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'
                  }`}
                >
                  Word by word
                </button>
              </div>

              {mode === 'full' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50">
                      Qari
                    </label>
                    <select
                      aria-label="Qari"
                      value={qari}
                      onChange={(e) => setQari(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink"
                    >
                      {QARIS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                    Listen to recitation
                  </p>
                  <AudioPlayer key={qari} segments={segments} emptyHint="No recitation is available for this lesson." />
                </>
              ) : (
                <WordByWordMode
                  arabic="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"
                  transliteration="Bismillāhi r-raḥmāni r-raḥīm al-ḥamdu lillāhi rabbi l-ʿālamīn"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — progress sidebar */}
        <div className="space-y-4">
          {/* Progress ring */}
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <CardTitle>Today's progress</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper-dim text-green-700">
                <Clock3 className="h-4 w-4" />
              </span>
            </div>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-ink">1 page (16 lines)</div>
                  <div className="mt-0.5 text-xs text-ink/50">Today's target</div>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-green-100 text-sm font-bold text-green-700">
                  {progress}%
                </div>
              </div>
              <Input
                label="Lines completed today"
                type="number"
                min={0}
                max={16}
                value={lines}
                onChange={(e) => setLines(Math.max(0, Math.min(16, Number(e.target.value))))}
              />
            </CardContent>
          </Card>

          {/* Tajweed note */}
          <Card className="p-6">
            <CardTitle className="mb-3">Tajweed note</CardTitle>
            <CardContent>
              <p className="text-sm leading-6 text-ink/60">
                Today's focus: Noon Sakinah — listen for the nasal sound before continuing.
              </p>
            </CardContent>
          </Card>

          {/* Assignment notes */}
          {assignment.notes && (
            <Card className="p-6">
              <CardTitle className="mb-3">Teacher's note</CardTitle>
              <CardContent>
                <p className="text-sm leading-6 text-ink/60">{assignment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Self-report completion */}
      <Card className="border-green-200 bg-green-50/30 p-6">
        <CardContent className="space-y-4">
          <div>
            <CardTitle className="mb-1">How much did you complete today?</CardTitle>
            <p className="text-sm text-ink/55">Self-report your progress without waiting for a teacher.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="completion-amount">
                Completed today
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="completion-amount"
                  type="number"
                  min={0}
                  max={targetQuantity * 2}
                  step="0.1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(Number(e.target.value))
                    setValidation('')
                  }}
                  className="h-10 w-28 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/30"
                />
                <span className="text-sm text-ink/55">{completionUnit}</span>
              </div>
              {validation && <p className="mt-1 text-xs text-clay-700">{validation}</p>}
            </div>
            <Button onClick={complete} disabled={completing}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {completing ? 'Completing…' : 'Mark complete'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/student/assignments')}>
              Save for later
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sticky bottom save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-7xl justify-end gap-2">
          <Button variant="outline" onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? 'Saving…' : 'Save progress'}
          </Button>
        </div>
      </div>
    </div>
  )
}
