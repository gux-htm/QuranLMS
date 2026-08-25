import { Fragment, useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, BookOpenText, Clock, GraduationCap, Languages, Moon, PauseCircle, ScrollText, Search, Volume2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { CurriculumCard, TRACK_FILTER_LABELS } from '@/components/teacher/CurriculumCard'
import { AssignmentModal } from '@/components/teacher/AssignmentModal'
import { CURRICULUM_ITEMS, QARI_OPTIONS, globalAyahAudioUrl, qariName } from '@/lib/curriculumData'
import { SURAHS, JUZ_LIST } from '@/lib/quranData'
import { LEVEL_LABELS } from '@/lib/mockData'
import { useToast } from '@/components/ui/Toaster'
import { useAppStore } from '@/lib/store'
import { useQuranText } from '@/hooks/useQuranText'
import type { CurriculumItem } from '@/types'
import type { LucideIcon } from 'lucide-react'

// ---------- Category configuration for the curriculum home ----------

type CategoryTrack = 'qaida' | 'tajweed' | 'makharij' | 'waqf' | 'duas' | 'hadith'

interface Category {
  key: 'quran' | CategoryTrack
  title: string
  subtitle: string
  icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { key: 'quran', title: 'The Holy Quran', subtitle: 'The entire Quran — 30 paras and 114 surahs, with audio recitation', icon: BookOpen },
  { key: 'qaida', title: 'Noorani Qaida', subtitle: 'Complete Qaida — all 17 lessons from letters to full ayahs', icon: GraduationCap },
  { key: 'tajweed', title: 'Tajweed Guide', subtitle: 'Complete tajweed rules — noon, meem, madd, qalqalah, lam and ra', icon: Volume2 },
  { key: 'makharij', title: 'Makharij Guide', subtitle: 'All 17 articulation points of the Arabic letters', icon: Languages },
  { key: 'waqf', title: 'Stopping Rules', subtitle: 'Waqf and ibtida — stop signs, categories and resuming', icon: PauseCircle },
  { key: 'duas', title: 'Duas', subtitle: 'Daily supplications with Arabic, transliteration and translation', icon: Moon },
  { key: 'hadith', title: 'Hadiths', subtitle: 'Selected authentic hadiths for students of the Quran', icon: ScrollText },
]

// ---------- Navigation state ----------

type View =
  | { kind: 'home' }
  | { kind: 'quran' }
  | { kind: 'quran-item'; item: CurriculumItem }
  | { kind: 'category'; track: CategoryTrack }
  | { kind: 'content-item'; item: CurriculumItem }

export function TeacherCurriculum() {
  const { push } = useToast()
  const { lessonAssignments } = useAppStore()

  const [view, setView] = useState<View>({ kind: 'home' })
  const [assignItem, setAssignItem] = useState<CurriculumItem | null>(null)
  const [assignMode, setAssignMode] = useState<'class' | 'student'>('class')

  const startAssign = (item: CurriculumItem, mode: 'class' | 'student') => {
    setAssignMode(mode)
    setAssignItem(item)
  }

  const handleAssigned = (count: number, target: string) => {
    setAssignItem(null)
    push(`Assigned to ${count} student${count === 1 ? '' : 's'} in ${target}`)
  }

  return (
    <div className="space-y-6">
      {view.kind === 'home' && (
        <HomeView
          onOpenQuran={() => setView({ kind: 'quran' })}
          onOpenCategory={(track) => setView({ kind: 'category', track })}
        />
      )}

      {view.kind === 'quran' && (
        <QuranTilesView
          onBack={() => setView({ kind: 'home' })}
          onOpenItem={(item) => setView({ kind: 'quran-item', item })}
        />
      )}

      {view.kind === 'quran-item' && (
        <QuranReadingView
          item={view.item}
          onBack={() => setView({ kind: 'quran' })}
          onAssign={(item, mode) => startAssign(item, mode)}
        />
      )}

      {view.kind === 'category' && (
        <CategoryView
          track={view.track}
          onBack={() => setView({ kind: 'home' })}
          onOpenItem={(item) => setView({ kind: 'content-item', item })}
        />
      )}

      {view.kind === 'content-item' && (
        <ContentItemView
          item={view.item}
          onBack={() => setView({ kind: 'category', track: view.item.track as CategoryTrack })}
          onAssign={(item, mode) => startAssign(item, mode)}
        />
      )}

      {lessonAssignments.length > 0 && view.kind !== 'home' && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
          {lessonAssignments.length} assignment{lessonAssignments.length === 1 ? '' : 's'} created this session.
        </p>
      )}

      <AssignmentModal
        item={assignItem}
        mode={assignMode}
        onClose={() => setAssignItem(null)}
        onAssigned={handleAssigned}
      />
    </div>
  )
}

// ---------- Home: one card per category ----------

function HomeView({ onOpenQuran, onOpenCategory }: {
  onOpenQuran: () => void
  onOpenCategory: (track: CategoryTrack) => void
}) {
  const countFor = (track: CategoryTrack) => CURRICULUM_ITEMS.filter((i) => i.track === track).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Curriculum</h1>
        <p className="mt-1 text-sm text-ink/55">
          The complete library — Quran, Noorani Qaida, Tajweed, Makharij, stopping rules, duas and hadiths. Open a
          section, then assign any unit to a class or student.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const count = cat.key === 'quran' ? SURAHS.length + JUZ_LIST.length : countFor(cat.key)
          return (
            <button
              key={cat.key}
              onClick={() => (cat.key === 'quran' ? onOpenQuran() : onOpenCategory(cat.key))}
              className="group flex w-full flex-col rounded-lg border border-line bg-white p-5 text-left shadow-card transition hover:border-green-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-green-50 p-2.5 text-green-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-paper-dim px-2.5 py-0.5 text-xs font-medium text-ink/55">
                  {count} units
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink group-hover:text-green-800">{cat.title}</h3>
              <p className="mt-1 text-sm text-ink/55">{cat.subtitle}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Quran: 30 para tiles / 114 surah tiles with search ----------

function QuranTilesView({ onBack, onOpenItem }: {
  onBack: () => void
  onOpenItem: (item: CurriculumItem) => void
}) {
  const [mode, setMode] = useState<'juz' | 'surah'>('juz')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()

  const juzItems = useMemo(
    () => CURRICULUM_ITEMS.filter((i) => i.track === 'juz_based'),
    [],
  )
  const surahItems = useMemo(
    () => CURRICULUM_ITEMS.filter((i) => i.track === 'surah_based'),
    [],
  )

  const filteredJuz = useMemo(
    () =>
      juzItems.filter((item) => {
        if (!q) return true
        const juz = JUZ_LIST[(item.juzNum ?? 1) - 1]
        const haystack = `para ${item.juzNum} juz ${item.juzNum} ${item.title} ${juz?.name ?? ''}`.toLowerCase()
        return haystack.includes(q)
      }),
    [juzItems, q],
  )

  const filteredSurahs = useMemo(
    () =>
      surahItems.filter((item) => {
        if (!q) return true
        const surah = SURAHS[(item.surahNum ?? 1) - 1]
        const haystack = `surah ${item.surahNum} ${item.surahName ?? ''} ${surah?.arabic ?? ''}`.toLowerCase()
        return haystack.includes(q)
      }),
    [surahItems, q],
  )

  const switchMode = (m: 'juz' | 'surah') => {
    setMode(m)
    setQuery('')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink/65 hover:bg-paper-dim"
          >
            <ArrowLeft className="h-4 w-4" />
            Curriculum
          </button>
          <h1 className="font-display text-2xl font-semibold text-ink">The Holy Quran</h1>
        </div>

        {/* Para / Surah switch */}
        <div className="flex rounded-md border border-line bg-white p-0.5" role="tablist" aria-label="Quran browsing mode">
          <button
            role="tab"
            aria-selected={mode === 'juz'}
            onClick={() => switchMode('juz')}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === 'juz' ? 'bg-green-600 text-paper' : 'text-ink/60 hover:bg-paper-dim'
            }`}
          >
            By Para
          </button>
          <button
            role="tab"
            aria-selected={mode === 'surah'}
            onClick={() => switchMode('surah')}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === 'surah' ? 'bg-green-600 text-paper' : 'text-ink/60 hover:bg-paper-dim'
            }`}
          >
            By Surah
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === 'juz' ? 'Search para by name or number…' : 'Search surah by name or number…'}
          className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-8 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink/40 hover:bg-paper-dim"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <p className="text-sm text-ink/55">
        {mode === 'juz'
          ? `${filteredJuz.length} of 30 paras`
          : `${filteredSurahs.length} of 114 surahs`}
      </p>

      {mode === 'juz' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredJuz.map((item) => {
            const juz = JUZ_LIST[(item.juzNum ?? 1) - 1]
            const startSurah = SURAHS[juz.startSurah - 1]
            return (
              <button
                key={item.id}
                onClick={() => onOpenItem(item)}
                className="group flex w-full items-start gap-4 rounded-lg border border-line bg-white p-5 text-left shadow-card transition hover:border-green-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 font-display text-lg font-semibold text-green-700">
                  {item.juzNum}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-base font-semibold text-ink group-hover:text-green-800">
                    Para {item.juzNum} — {juz.name}
                  </span>
                  <span className="mt-1 block text-xs text-ink/55">
                    Starts: Surah {startSurah?.name} {juz.startSurah}:{juz.startAyah}
                  </span>
                  <span className="block text-xs text-ink/45">Pages {juz.pageFrom}–{juz.pageTo} • full para</span>
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSurahs.map((item) => {
            const surah = SURAHS[(item.surahNum ?? 1) - 1]
            return (
              <button
                key={item.id}
                onClick={() => onOpenItem(item)}
                className="group flex w-full items-center gap-4 rounded-lg border border-line bg-white p-4 text-left shadow-card transition hover:border-green-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 font-display text-sm font-semibold text-green-700">
                  {item.surahNum}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-base font-semibold text-ink group-hover:text-green-800">
                    {item.surahName}
                  </span>
                  <span className="block text-xs text-ink/50">
                    {surah.revelation} • {surah.ayahs} ayahs
                  </span>
                </span>
                <span className="font-arabic shrink-0 text-xl text-ink/70" dir="rtl">
                  {surah.arabic}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {(mode === 'juz' ? filteredJuz : filteredSurahs).length === 0 && (
        <Card>
          <div className="py-8 text-center">
            <BookOpenText className="mx-auto h-8 w-8 text-ink/25" />
            <p className="mt-2 text-sm text-ink/55">
              No {mode === 'juz' ? 'para' : 'surah'} matches "{query}". Try a number or another name.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

// ---------- Full para / full surah reading view ----------

function QuranReadingView({ item, onBack, onAssign }: {
  item: CurriculumItem
  onBack: () => void
  onAssign: (item: CurriculumItem, mode: 'class' | 'student') => void
}) {
  const kind: 'surah' | 'juz' = item.track === 'surah_based' ? 'surah' : 'juz'
  const num = kind === 'surah' ? item.surahNum : item.juzNum

  const { ayahs, loading, error } = useQuranText(kind, num ?? null)
  const [qari, setQari] = useState(item.defaultQari)
  const [showTranslit, setShowTranslit] = useState(false)
  const [showTranslation, setShowTranslation] = useState(true)

  const segments = useMemo(
    () => ayahs.map((a) => ({ label: `${a.surahNum}:${a.numInSurah}`, url: globalAyahAudioUrl(a.global, qari) })),
    [ayahs, qari],
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink/65 hover:bg-paper-dim"
          >
            <ArrowLeft className="h-4 w-4" />
            The Holy Quran
          </button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{item.title}</h1>
            <p className="text-xs text-ink/50">{item.description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onAssign(item, 'class')}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Assign to Class
          </Button>
          <Button variant="outline" onClick={() => onAssign(item, 'student')}>
            Assign to Student
          </Button>
        </div>
      </div>

      {/* Audio */}
      <Card>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Audio recitation</h3>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-ink/60">
                <input
                  type="checkbox"
                  checked={showTranslit}
                  onChange={(e) => setShowTranslit(e.target.checked)}
                  className="h-3.5 w-3.5 accent-green-600"
                />
                Transliteration
              </label>
              <label className="flex items-center gap-1.5 text-xs text-ink/60">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="h-3.5 w-3.5 accent-green-600"
                />
                Translation
              </label>
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
          </div>
          <AudioPlayer
            segments={loading || error ? [] : segments}
            emptyHint={error ? 'Audio unavailable — the text above failed to load.' : 'Loading ayahs…'}
          />
          {segments.length > 0 && <p className="text-[11px] text-ink/45">Recited by {qariName(qari)} • {segments.length} ayahs</p>}
        </div>
      </Card>

      {/* Text */}
      {loading && (
        <Card>
          <div className="space-y-3 py-4">
            <p className="text-center text-sm text-ink/55">Loading the complete text…</p>
            <div className="mx-auto h-2 w-2/3 animate-pulse rounded bg-paper-dim" />
            <div className="mx-auto h-2 w-1/2 animate-pulse rounded bg-paper-dim" />
            <div className="mx-auto h-2 w-3/5 animate-pulse rounded bg-paper-dim" />
          </div>
        </Card>
      )}

      {error && (
        <Card>
          <p className="py-4 text-center text-sm text-clay-700">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {ayahs.map((a, i) => {
            const newSurah = i === 0 || ayahs[i - 1].surahNum !== a.surahNum
            return (
              <Fragment key={a.global}>
                {newSurah && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="h-px flex-1 bg-line" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Surah {a.surahName} ({a.surahNum})
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                )}
                <Card>
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex-1 font-arabic text-2xl leading-loose text-ink" dir="rtl">
                        {a.ar} <span className="text-gold-800">﴿{a.numInSurah}﴾</span>
                      </p>
                    </div>
                    {showTranslit && a.translit && (
                      <p className="text-xs italic text-ink/55">{a.translit}</p>
                    )}
                    {showTranslation && a.en && (
                      <p className="border-t border-line pt-2 text-sm text-ink/70">{a.en}</p>
                    )}
                  </div>
                </Card>
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------- Content category: searchable lesson/dua/hadith cards ----------

function CategoryView({ track, onBack, onOpenItem }: {
  track: CategoryTrack
  onBack: () => void
  onOpenItem: (item: CurriculumItem) => void
}) {
  const [query, setQuery] = useState('')
  const cat = CATEGORIES.find((c) => c.key === track)!

  const items = useMemo(() => CURRICULUM_ITEMS.filter((i) => i.track === track), [track])
  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (!q) return true
        return `${item.title} ${item.description}`.toLowerCase().includes(q)
      }),
    [items, q],
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink/65 hover:bg-paper-dim"
        >
          <ArrowLeft className="h-4 w-4" />
          Curriculum
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{cat.title}</h1>
          <p className="text-sm text-ink/55">{cat.subtitle}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${cat.title.toLowerCase()}…`}
          className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-8 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink/40 hover:bg-paper-dim"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <p className="text-sm text-ink/55">
        {filtered.length} of {items.length} {items.length === 1 ? 'unit' : 'units'}
      </p>

      {filtered.length === 0 ? (
        <Card>
          <div className="py-8 text-center">
            <BookOpenText className="mx-auto h-8 w-8 text-ink/25" />
            <p className="mt-2 text-sm text-ink/55">No units match this search. Try different words.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <CurriculumCard key={item.id} item={item} onOpen={() => onOpenItem(item)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Static content item (lesson / dua / hadith) full view ----------

function ContentItemView({ item, onBack, onAssign }: {
  item: CurriculumItem
  onBack: () => void
  onAssign: (item: CurriculumItem, mode: 'class' | 'student') => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink/65 hover:bg-paper-dim"
          >
            <ArrowLeft className="h-4 w-4" />
            {TRACK_FILTER_LABELS[item.track]}
          </button>
          <div>
            <div className="mb-1 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                {LEVEL_LABELS[item.difficulty]}
              </span>
              <span className="rounded-full bg-paper-dim px-2.5 py-0.5 text-xs font-medium text-ink/55">
                ~{item.durationMinutes} min
              </span>
              {item.qaidaLesson && (
                <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-gold-800">
                  Qaida Lesson {item.qaidaLesson}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink">{item.title}</h1>
            <p className="text-sm text-ink/55">{item.description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onAssign(item, 'class')}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Assign to Class
          </Button>
          <Button variant="outline" onClick={() => onAssign(item, 'student')}>
            Assign to Student
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5">
        {/* Arabic content */}
        <div className="rounded-lg border border-gold-200 bg-paper p-6">
          <p className="text-center font-arabic text-2xl leading-loose text-ink" dir="rtl">
            {item.contentAr}
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">Transliteration</h3>
          <p className="text-sm italic text-ink/70">{item.contentTranslit}</p>
        </div>

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">Translation & Explanation</h3>
          <p className="text-sm leading-relaxed text-ink/70">{item.contentEn}</p>
        </div>

        {item.tajweedRules.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50">Practice points</h3>
            <div className="flex flex-wrap gap-2">
              {item.tajweedRules.map((rule) => (
                <span key={rule} className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-medium text-gold-800">
                  {rule}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="flex items-start gap-2 rounded-md bg-paper-dim p-3 text-xs text-ink/55">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Curriculum content is pre-loaded and read-only. Assign this unit to a class or student — practice is then
          tracked in lessons and daily reports.
        </p>
      </div>
    </div>
  )
}
