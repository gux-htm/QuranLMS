import type { CurriculumItem } from '@/types'
import { SURAHS, JUZ_LIST, getSurah } from '@/lib/quranData'
import { CONTENT_ITEMS } from '@/lib/curriculumContent'

// ---------- Qari options (audio reciters served by the islamic.network CDN) ----------

export const QARI_OPTIONS = [
  { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman As-Sudais' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi' },
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)' },
]

export function qariName(id: string): string {
  return QARI_OPTIONS.find((q) => q.id === id)?.name ?? 'Unknown Qari'
}

// ---------- Global ayah numbering (needed to build per-ayah audio URLs) ----------

// Ayah count of every surah (1–114), standard Kufi counting — total 6236
const SURA_AYAH_COUNTS = SURAHS.map((s) => s.ayahs)

export function globalAyah(surah: number, ayah: number): number {
  let total = 0
  for (let i = 0; i < surah - 1; i++) total += SURA_AYAH_COUNTS[i]
  return total + ayah
}

export function ayahAudioUrl(surah: number, ayah: number, qari: string): string {
  return `https://cdn.islamic.network/quran/audio/128/${qari}/${globalAyah(surah, ayah)}.mp3`
}

// Audio URL straight from a global ayah number (used when ayahs arrive
// already numbered globally from the alquran.cloud API)
export function globalAyahAudioUrl(globalNum: number, qari: string): string {
  return `https://cdn.islamic.network/quran/audio/128/${qari}/${globalNum}.mp3`
}

export interface AudioSegment {
  label: string
  url: string
}

// Builds a playable list of per-ayah segments for a curriculum item's range
export function segmentsForItem(item: CurriculumItem, qari: string): AudioSegment[] {
  if (!item.surahNum || !item.ayahFrom || !item.ayahTo) return []
  const segs: AudioSegment[] = []
  for (let a = item.ayahFrom; a <= Math.min(item.ayahTo, item.ayahFrom + 14); a++) {
    segs.push({
      label: `${item.surahNum}:${a}`,
      url: ayahAudioUrl(item.surahNum, a, qari),
    })
  }
  return segs
}

// ---------- Pre-seeded curriculum (read-only; teachers assign from it) ----------

// Full Quran coverage is generated from metadata — 30 juz (para) units and
// 114 surah units. Their text is loaded at runtime from api.alquran.cloud,
// so the stored content fields stay empty and the reading view fetches them.

const juzDifficulty = (n: number): CurriculumItem['difficulty'] =>
  n >= 26 ? 'beginner' : n >= 16 ? 'intermediate' : 'advanced'

const surahDifficulty = (ayahs: number): CurriculumItem['difficulty'] =>
  ayahs <= 20 ? 'beginner' : ayahs <= 85 ? 'intermediate' : 'advanced'

const JUZ_ITEMS: CurriculumItem[] = JUZ_LIST.map((juz) => {
  const startSurah = getSurah(juz.startSurah)
  return {
    id: `juz-${juz.n}`,
    title: `Para ${juz.n} — ${juz.name}`,
    description: `Complete Para ${juz.n} of the Quran. Begins at Surah ${startSurah?.name ?? juz.startSurah} ${juz.startSurah}:${juz.startAyah}, pages ${juz.pageFrom}\u2013${juz.pageTo}.`,
    track: 'juz_based' as const,
    difficulty: juzDifficulty(juz.n),
    durationMinutes: 60,
    contentAr: '',
    contentTranslit: '',
    contentEn: '',
    tajweedRules: [],
    juzNum: juz.n,
    pageFrom: juz.pageFrom,
    pageTo: juz.pageTo,
    surahNum: null,
    surahName: null,
    ayahFrom: null,
    ayahTo: null,
    qaidaLesson: null,
    defaultQari: 'ar.alafasy',
  }
})

const SURAH_ITEMS: CurriculumItem[] = SURAHS.map((s) => ({
  id: `surah-${s.n}`,
  title: `Surah ${s.name}`,
  description: `Complete Surah ${s.name} (${s.arabic}) — ${s.revelation}, ${s.ayahs} ayahs.`,
  track: 'surah_based' as const,
  difficulty: surahDifficulty(s.ayahs),
  durationMinutes: Math.min(90, Math.max(15, Math.round(s.ayahs / 2))),
  contentAr: '',
  contentTranslit: '',
  contentEn: '',
  tajweedRules: [],
  juzNum: null,
  pageFrom: null,
  pageTo: null,
  surahNum: s.n,
  surahName: s.name,
  ayahFrom: 1,
  ayahTo: s.ayahs,
  qaidaLesson: null,
  defaultQari: 'ar.alafasy',
}))

export const CURRICULUM_ITEMS: CurriculumItem[] = [
  ...JUZ_ITEMS,
  ...SURAH_ITEMS,
  ...CONTENT_ITEMS,
]
