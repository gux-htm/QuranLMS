import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, CheckCircle2, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { CURRENT_STUDENT, today } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/Toaster'

const FALLBACK_ASSIGNMENT = { id: 'current-student-lesson', curriculumTitle: 'Juz 1 · Pages 4–6', deadline: format(today, 'yyyy-MM-dd'), notes: 'Continue with a calm, steady pace.' }
const ASSIGNMENT_TITLES: Record<string, string> = { '1': 'Juz 1 · Pages 7–9', '2': 'Juz 1 · Pages 4–6', '3': 'Noorani Qaida · Lesson 12' }
const QARIS = [
  { label: 'Abdur-Rahman As-Sudais', id: 'ar.abdurrahmaansudais' },
  { label: 'Mohamed Siddiq Al-Minshawi', id: 'ar.minshawi' },
  { label: 'Mishary Rashid Alafasy', id: 'ar.alafasy' },
  { label: 'Mahmoud Khalil Al-Husary', id: 'ar.husary' },
  { label: 'Abdul Basit (Murattal)', id: 'ar.abdulbasitmurattal' },
]
const GLOBAL_AYAHS = [1, 2, 3, 4, 5, 6, 7]

export function StudentLessonPage() {
  const navigate = useNavigate(); const { id } = useParams(); const { lessonAssignments, lessonProgress, saveLessonProgress, completeLesson } = useAppStore(); const { push } = useToast()
  const [qari, setQari] = useState('ar.alafasy')
  const assignment = useMemo(() => {
    if (id) {
      const stored = lessonAssignments.find((item) => item.id === id && item.studentIds.includes(CURRENT_STUDENT.id))
      if (stored) return stored
      if (ASSIGNMENT_TITLES[id]) return { id, curriculumTitle: ASSIGNMENT_TITLES[id], deadline: format(today, 'yyyy-MM-dd'), notes: '' }
      return null
    }
    return lessonAssignments.find((item) => item.studentIds.includes(CURRENT_STUDENT.id)) ?? FALLBACK_ASSIGNMENT
  }, [id, lessonAssignments])
  const segments = useMemo(() => GLOBAL_AYAHS.map((ayah) => ({ label: `1:${ayah}`, url: `https://cdn.islamic.network/quran/audio/128/${qari}/${ayah}.mp3` })), [qari])
  if (!assignment) return <Card><CardContent className="py-12 text-center"><BookOpen className="mx-auto mb-3 h-8 w-8 text-green-700" /><p className="font-medium text-ink">This lesson isn't available yet.</p><button onClick={() => navigate('/student/assignments')} className="mt-3 text-sm font-medium text-green-700">Back to assignments</button></CardContent></Card>
  const saved = lessonProgress[assignment.id] ?? 0; const [lines, setLines] = useState(saved); const [saving, setSaving] = useState(false); const [completing, setCompleting] = useState(false)
  const progress = Math.round((Math.min(lines, 16) / 16) * 100); const status = lines >= 16 ? 'Completed' : lines > 0 ? 'In progress' : 'Pending'
  const statusClass = status === 'Completed' ? 'bg-green-50 text-green-700' : status === 'In progress' ? 'bg-sky-100 text-sky-700' : 'bg-gold-100 text-gold-800'
  const save = async () => { setSaving(true); await new Promise((r) => setTimeout(r, 500)); saveLessonProgress(assignment.id, lines); push('Progress saved'); setSaving(false) }
  const complete = async () => { setCompleting(true); await new Promise((r) => setTimeout(r, 500)); completeLesson(assignment.id); push('Lesson marked complete · Well done!'); setCompleting(false); navigate('/student/calendar') }
  return <div className="space-y-6 pb-24 md:pb-0">
    <button onClick={() => navigate('/student/calendar')} className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"><ArrowLeft className="h-4 w-4" /> My calendar</button>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="font-display text-2xl font-semibold text-ink">{assignment.curriculumTitle}</h1><p className="mt-1 text-sm text-ink/55">Assigned by {CURRENT_STUDENT.teacherName} · Due {format(new Date(`${assignment.deadline ?? format(today, 'yyyy-MM-dd')}T12:00:00`), 'MMM d, yyyy')}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{status}</span></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-6">
      <Card className="border-r-4 border-r-green-700"><CardTitle className="mb-4 text-green-900">Today's recitation</CardTitle><CardContent className="space-y-5"><div dir="rtl" className="text-right font-[Noto_Naskh_Arabic] text-3xl leading-[2.2] text-ink sm:text-4xl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ</div><div className="border-t border-line pt-4"><p className="text-sm leading-7 text-ink/60">Bismillāhi r-raḥmāni r-raḥīm. Al-ḥamdu lillāhi rabbi l-ʿālamīn…</p><p className="mt-2 text-xs leading-6 text-ink/45">In the name of Allah, the Most Compassionate, the Most Merciful. All praise belongs to Allah, Lord of all worlds…</p></div></CardContent></Card>
      <Card><CardTitle className="mb-1">Listen to recitation</CardTitle><CardContent className="space-y-4"><label className="block text-xs font-semibold uppercase tracking-wide text-ink/50">Qari<select value={qari} onChange={(e) => setQari(e.target.value)} className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"><option value="ar.abdurrahmaansudais">Abdur-Rahman As-Sudais</option><option value="ar.minshawi">Mohamed Siddiq Al-Minshawi</option><option value="ar.alafasy">Mishary Rashid Alafasy</option><option value="ar.husary">Mahmoud Khalil Al-Husary</option><option value="ar.abdulbasitmurattal">Abdul Basit (Murattal)</option></select></label><AudioPlayer segments={segments} emptyHint="No recitation is available for this lesson." /></CardContent></Card>
    </div><div className="space-y-4"><Card><CardTitle className="mb-4">Today's progress</CardTitle><CardContent className="space-y-4"><div className="flex items-center justify-between gap-4"><div><div className="text-sm font-medium text-ink">1 page (16 lines)</div><div className="mt-1 text-xs text-ink/55">Today's target</div></div><div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-100 text-sm font-semibold text-green-700" style={{ background: `conic-gradient(#2f6b4f ${progress}%, transparent 0)` }}><span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper">{progress}%</span></div></div><Input label="Lines completed today" type="number" min={0} max={16} value={lines} onChange={(e) => setLines(Math.max(0, Math.min(16, Number(e.target.value))))} /></CardContent></Card><Card><CardTitle className="mb-2">Tajweed note</CardTitle><CardContent><p className="text-sm leading-6 text-ink/60">Today's focus: Noon Sakinah — listen for the nasal sound.</p></CardContent></Card></div></div>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0"><div className="mx-auto flex max-w-6xl justify-end gap-2"><Button variant="outline" onClick={save} disabled={saving}><Save className="mr-1.5 h-4 w-4" />{saving ? 'Saving…' : 'Save progress'}</Button><Button onClick={complete} disabled={lines < 1 || completing}><CheckCircle2 className="mr-1.5 h-4 w-4" />{completing ? 'Completing…' : 'Mark complete'}</Button></div></div>
  </div>
}
