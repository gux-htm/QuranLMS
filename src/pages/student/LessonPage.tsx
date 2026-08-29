import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { ayahAudioUrl } from '@/lib/curriculumData'
import { CURRENT_STUDENT } from '@/lib/mockData'
import { useToast } from '@/components/ui/Toaster'

const verses = [
  ['بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'Bismillāhi r-raḥmāni r-raḥīm', 'In the name of Allah, the Most Compassionate, Most Merciful.'],
  ['الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'Al-ḥamdu lillāhi rabbi l-ʿālamīn', 'All praise is for Allah—Lord of all worlds.'],
  ['الرَّحْمَٰنِ الرَّحِيمِ', 'Ar-raḥmāni r-raḥīm', 'The Most Compassionate, Most Merciful.'],
  ['مَالِكِ يَوْمِ الدِّينِ', 'Māliki yawmi d-dīn', 'Master of the Day of Judgment.'],
]

export function StudentLessonPage() {
  const navigate = useNavigate()
  const { push } = useToast()
  const [lines, setLines] = useState(0)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const percent = Math.round((lines / 16) * 100)
  const audio = useMemo(() => [1, 2, 3, 4, 5, 6, 7].map((ayah) => ({ label: `1:${ayah}`, url: ayahAudioUrl(1, ayah, 'ar.abdurrahmaansudais') })), [])

  const save = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSaving(false)
    push('Progress saved')
  }
  const complete = async () => {
    if (!lines) return
    setCompleting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setCompleting(false)
    push('Lesson marked complete · Well done!')
    navigate('/student/calendar')
  }

  return <div className="space-y-6 pb-20 sm:pb-6">
    <button onClick={() => navigate('/student/calendar')} className="inline-flex items-center gap-2 text-sm font-medium text-ink/55 hover:text-green-700"><ArrowLeft className="h-4 w-4" /> My calendar</button>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-display text-2xl font-semibold text-ink">Juz 1 · Pages 4–6</h1><p className="mt-1 text-sm text-ink/55">Assigned by {CURRENT_STUDENT.teacherName} · Due this week</p></div>
      <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-800">Pending</span>
    </div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <Card className="border-r-4 border-r-green-700">
          <CardTitle className="mb-5 flex items-center gap-2 text-green-900"><BookOpen className="h-5 w-5" /> Quran reading</CardTitle>
          <CardContent className="space-y-6">
            {verses.map(([arabic, transliteration, meaning], index) => <div key={arabic} className="border-b border-line pb-5 last:border-0 last:pb-0"><p dir="rtl" className="text-right font-[Noto_Naskh_Arabic] text-3xl leading-[2.1] text-ink">{arabic} <span className="text-base text-green-700">﴿{index + 1}﴾</span></p><p className="mt-2 text-sm text-ink/60">{transliteration}</p><p className="mt-1 text-sm text-ink/45">{meaning}</p></div>)}
          </CardContent>
        </Card>
        <Card><CardTitle className="mb-1">Listen and follow</CardTitle><p className="mb-4 text-sm text-ink/55">Recited by Sheikh Sudais</p><CardContent><AudioPlayer segments={audio} /></CardContent></Card>
      </div>
      <div className="space-y-4">
        <Card><CardTitle className="mb-4">Today's progress</CardTitle><CardContent className="space-y-5"><div className="flex items-end justify-between"><div><p className="text-sm text-ink/55">Today's target</p><p className="font-display text-xl font-semibold text-ink">1 page (16 lines)</p></div><div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-green-100 text-sm font-semibold text-green-700" style={{ background: `conic-gradient(#2f6b4f ${percent * 3.6}deg, transparent 0deg)` }}><span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper">{percent}%</span></div></div><label className="block text-sm font-medium text-ink">Lines completed today<input type="number" min={0} max={16} value={lines} onChange={(event) => setLines(Math.max(0, Math.min(16, Number(event.target.value))))} className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-green-200" /></label></CardContent></Card>
        <Card><CardTitle className="mb-2 text-green-900">Tajweed focus</CardTitle><CardContent><p className="text-sm text-ink/60">Today's focus: Noon Sakinah — listen for the nasal sound.</p></CardContent></Card>
      </div>
    </div>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0"><div className="mx-auto flex max-w-6xl justify-end gap-3"><Button variant="outline" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save progress'}</Button><Button onClick={complete} disabled={!lines || completing}>{completing ? 'Completing…' : <><CheckCircle2 className="mr-2 h-4 w-4" /> Mark complete</>}</Button></div></div>
  </div>
}
