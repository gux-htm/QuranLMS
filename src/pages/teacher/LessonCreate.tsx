import { useMemo, useState } from 'react'
import { Check, Eye, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'
import { useAppStore } from '@/lib/store'

const LESSON_TYPES = [
  ['juz_based', 'Juz-based'],
  ['surah_based', 'Surah-based'],
  ['qaida', 'Noorani Qaida'],
  ['custom', 'Custom'],
] as const
const AUDIO_SOURCES = ['Sudais', 'Al-Minshawi', 'Pothwari', 'Custom URL'] as const
const RULES = ['Noon Ghunnah', 'Meem Ghunnah', 'Madd', 'Ikhfa', 'Idgham', 'Qalb', 'Izhar'] as const
const UNITS = ['pages', 'lines', 'ayahs', 'lessons'] as const

export function TeacherLessonCreate() {
  const navigate = useNavigate()
  const { classes } = useAppStore()
  const { push } = useToast()
  const [title, setTitle] = useState('')
  const [lessonType, setLessonType] = useState<(typeof LESSON_TYPES)[number][0]>('juz_based')
  const [arabic, setArabic] = useState('بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ')
  const [transliteration, setTransliteration] = useState('')
  const [translation, setTranslation] = useState('')
  const [qari, setQari] = useState<(typeof AUDIO_SOURCES)[number]>('Sudais')
  const [audioUrl, setAudioUrl] = useState('')
  const [unit, setUnit] = useState<(typeof UNITS)[number]>('pages')
  const [quantity, setQuantity] = useState('1')
  const [rules, setRules] = useState<string[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [saving, setSaving] = useState(false)

  const previewTitle = title.trim() || 'Untitled lesson'
  const preview = useMemo(() => ({ title: previewTitle, arabic: arabic.trim() || 'Arabic lesson content' }), [previewTitle, arabic])

  const toggleRule = (rule: string) => setRules((current) => current.includes(rule) ? current.filter((item) => item !== rule) : [...current, rule])
  const toggleClass = (classId: string) => setSelectedClasses((current) => current.includes(classId) ? current.filter((id) => id !== classId) : [...current, classId])

  const submit = async (mode: 'draft' | 'publish') => {
    if (!title.trim()) { push('Add a lesson title', 'error'); return }
    if (!arabic.trim()) { push('Add the Arabic lesson content', 'error'); return }
    if (!quantity || Number(quantity) <= 0) { push('Add a target quantity', 'error'); return }
    if (qari === 'Custom URL' && !audioUrl.trim()) { push('Add the custom audio URL', 'error'); return }
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    push(mode === 'publish' || publishImmediately ? 'Lesson published' : 'Lesson draft saved')
    setSaving(false)
    navigate('/teacher/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Create lesson</h1>
        <p className="mt-1 text-sm text-ink/55">Prepare a lesson and preview what students will see.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]">
        <Card>
          <CardContent className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Juz 1, Pages 1–3" className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-green-600/30" />
            </label>

            <div>
              <span className="mb-2 block text-sm font-medium text-ink">Lesson type</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Lesson type">
                {LESSON_TYPES.map(([value, label]) => <button type="button" key={value} onClick={() => setLessonType(value)} className={`rounded-md border px-3 py-2 text-sm ${lessonType === value ? 'border-green-300 bg-green-50 text-green-700' : 'border-line text-ink/55 hover:bg-paper-dim'}`}>{label}</button>)}
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Arabic content</span>
              <textarea dir="rtl" value={arabic} onChange={(event) => setArabic(event.target.value)} rows={7} placeholder="بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ" className="w-full rounded-md border border-line bg-white px-3 py-3 text-right font-[Noto_Naskh_Arabic] text-2xl leading-relaxed text-ink outline-none focus:ring-2 focus:ring-green-600/30" />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Transliteration</span><textarea value={transliteration} onChange={(event) => setTransliteration(event.target.value)} rows={4} placeholder="Optional transliteration" className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-green-600/30" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">English translation</span><textarea value={translation} onChange={(event) => setTranslation(event.target.value)} rows={4} placeholder="Optional English meaning" className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-green-600/30" /></label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="audio-source">Qari / audio source</label><select id="audio-source" value={qari} onChange={(event) => setQari(event.target.value as (typeof AUDIO_SOURCES)[number])} className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"><option>Sudais</option><option>Al-Minshawi</option><option>Pothwari</option><option>Custom URL</option></select></div>
              {qari === 'Custom URL' && <Input label="Audio URL" value={audioUrl} onChange={(event) => setAudioUrl(event.target.value)} placeholder="https://…" />}
            </div>

            <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="target-unit">Target unit</label><select id="target-unit" value={unit} onChange={(event) => setUnit(event.target.value as (typeof UNITS)[number])} className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink">{UNITS.map((item) => <option key={item}>{item}</option>)}</select></div><Input label="Target quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div>

            <div><span className="mb-2 block text-sm font-medium text-ink">Tajweed rules</span><div className="flex flex-wrap gap-2">{RULES.map((rule) => <button type="button" key={rule} onClick={() => toggleRule(rule)} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${rules.includes(rule) ? 'border-green-300 bg-green-50 text-green-700' : 'border-line text-ink/55 hover:bg-paper-dim'}`}>{rules.includes(rule) && <Check className="mr-1 h-3 w-3" />}{rule}</button>)}</div></div>

            <div><span className="mb-2 block text-sm font-medium text-ink">Assign to class</span><div className="grid gap-2 sm:grid-cols-2">{classes.map((item) => <label key={item.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-ink"><input type="checkbox" checked={selectedClasses.includes(item.id)} onChange={() => toggleClass(item.id)} />{item.name}</label>)}</div></div>

            <label className="flex items-center gap-3 text-sm text-ink"><input type="checkbox" checked={publishImmediately} onChange={(event) => setPublishImmediately(event.target.checked)} />Publish immediately</label>

            <div className="flex flex-wrap gap-2 border-t border-line pt-4"><Button variant="outline" onClick={() => submit('draft')} disabled={saving}><Save className="mr-1.5 h-4 w-4" />{saving ? 'Saving…' : 'Save draft'}</Button><Button onClick={() => submit('publish')} disabled={saving}><Eye className="mr-1.5 h-4 w-4" />{saving ? 'Publishing…' : 'Publish lesson'}</Button></div>
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24"><CardTitle className="mb-3">Student preview</CardTitle><CardContent><div className="rounded-md border border-line border-r-4 border-r-green-700 bg-white p-5"><div className="text-xs font-semibold uppercase tracking-wide text-ink/40">{LESSON_TYPES.find(([value]) => value === lessonType)?.[1]}</div><h2 className="mt-2 font-display text-xl font-semibold text-ink">{preview.title}</h2><div dir="rtl" className="mt-5 text-right font-[Noto_Naskh_Arabic] text-3xl leading-[2.15] text-ink">{preview.arabic}</div>{transliteration && <p className="mt-4 text-sm leading-7 text-ink/60">{transliteration}</p>}{translation && <p className="mt-2 text-xs leading-6 text-ink/45">{translation}</p>}<div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink/50"><span>Target</span><span className="font-semibold text-ink">{quantity} {unit}</span></div>{rules.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{rules.map((rule) => <span key={rule} className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700">{rule}</span>)}</div>}</div></CardContent></Card>
      </div>
    </div>
  )
}
