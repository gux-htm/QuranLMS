import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { CURRENT_STUDENT, today } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/Toaster'

const FALLBACK_ASSIGNMENT = { id: 'current-student-lesson', curriculumTitle: 'Juz 1 · Pages 4–6', deadline: format(today, 'yyyy-MM-dd'), notes: 'Continue with a calm, steady pace.' }
const AUDIO = [{ label: '1:1', url: 'https://verses.quran.com/AbdulBaset/Mujawwad/mp3/001001.mp3' }]

export function StudentLessonPage() {
  const navigate = useNavigate(); const { lessonAssignments, lessonProgress, saveLessonProgress, completeLesson } = useAppStore(); const { push } = useToast()
  const assignment = useMemo(() => lessonAssignments.find((item) => item.studentIds.includes(CURRENT_STUDENT.id)) ?? FALLBACK_ASSIGNMENT, [lessonAssignments])
  const saved = lessonProgress[assignment.id] ?? 0; const [lines, setLines] = useState(saved); const [saving, setSaving] = useState(false); const [completing, setCompleting] = useState(false)
  const progress = Math.round((Math.min(lines, 16) / 16) * 100); const status = lines >= 16 ? 'Completed' : lines > 0 ? 'In progress' : 'Pending'
  const statusClass = status === 'Completed' ? 'bg-green-50 text-green-700' : status === 'In progress' ? 'bg-sky-100 text-sky-700' : 'bg-gold-100 text-gold-800'
  const save = async () => { setSaving(true); await new Promise((r) => setTimeout(r, 500)); saveLessonProgress(assignment.id, lines); push('Progress saved'); setSaving(false) }
  const complete = async () => { setCompleting(true); await new Promise((r) => setTimeout(r, 500)); completeLesson(assignment.id); push('Lesson marked complete · Well done!'); setCompleting(false); navigate('/student/calendar') }
  if (!assignment) return <Card><CardContent className="py-12 text-center"><BookOpen className="mx-auto mb-3 h-8 w-8 text-green-700" /><p className="text-sm text-ink/55">No lesson assigned yet. Your teacher will assign one soon.</p></CardContent></Card>
  return <div className="space-y-6 pb-24 md:pb-0">
    <button onClick={() => navigate('/student/calendar')} className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"><ArrowLeft className="h-4 w-4" /> My calendar</button>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="font-display text-2xl font-semibold text-ink">{assignment.curriculumTitle}</h1><p className="mt-1 text-sm text-ink/55">Assigned by {CURRENT_STUDENT.teacherName} · Due {format(new Date(`${assignment.deadline ?? format(today, 'yyyy-MM-dd')}T12:00:00`), 'MMM d, yyyy')}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{status}</span></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Card className="border-r-4 border-r-green-700"><CardTitle className="mb-4 text-green-900">Today's recitation</CardTitle><CardContent className="space-y-5"><div dir="rtl" className="text-right font-[Noto_Naskh_Arabic] text-3xl leading-[2.2] text-ink sm:text-4xl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ</div><div className="border-t border-line pt-4"><p className="text-sm leading-7 text-ink/60">Bismillāhi r-raḥmāni r-raḥīm. Al-ḥamdu lillāhi rabbi l-ʿālamīn…</p><p className="mt-2 text-xs leading-6 text-ink/45">In the name of Allah, the Most Compassionate, the Most Merciful. All praise belongs to Allah, Lord of all worlds…</p></div></CardContent></Card>
        <Card><CardTitle className="mb-1">Listen and repeat</CardTitle><p className="mb-4 text-sm text-ink/55">Recited by Sheikh Sudais</p><AudioPlayer segments={AUDIO} /></Card>
      </div>
      <div className="space-y-4"><Card><CardTitle className="mb-4">Today's progress</CardTitle><CardContent className="space-y-4"><div className="flex items-center justify-between gap-4"><div><div className="text-sm font-medium text-ink">1 page (16 lines)</div><div className="mt-1 text-xs text-ink/55">Today's target</div></div><div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-100 text-sm font-semibold text-green-700" style={{ background: `conic-gradient(#2f6b4f ${progress}%, transparent 0)` }}><span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper">{progress}%</span></div></div><Input label="Lines completed today" type="number" min={0} max={16} value={lines} onChange={(e) => setLines(Math.max(0, Math.min(16, Number(e.target.value))))} /></CardContent></Card><Card><CardTitle className="mb-2">Tajweed note</CardTitle><CardContent><p className="text-sm leading-6 text-ink/60">Today's focus: Noon Sakinah — listen for the nasal sound.</p></CardContent></Card></div>
    </div>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0"><div className="mx-auto flex max-w-6xl justify-end gap-2"><Button variant="outline" onClick={save} disabled={saving}><Save className="mr-1.5 h-4 w-4" />{saving ? 'Saving…' : 'Save progress'}</Button><Button onClick={complete} disabled={lines < 1 || completing}><CheckCircle2 className="mr-1.5 h-4 w-4" />{completing ? 'Completing…' : 'Mark complete'}</Button></div></div>
  </div>
}
