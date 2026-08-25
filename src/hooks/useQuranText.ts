import { useEffect, useState } from 'react'
import { surahOfGlobalAyah } from '@/lib/quranData'

// Fetches the complete text of one surah or one para (juz) from the
// alquran.cloud API in three editions: Uthmani Arabic, Sahih English
// translation and English transliteration.

export interface AyahText {
  global: number // global ayah number (1–6236), usable for audio URLs
  numInSurah: number
  surahNum: number
  surahName: string
  ar: string
  translit: string
  en: string
}

interface EditionAyah {
  number: number
  numberInSurah: number
  text: string
}

interface Edition {
  ayahs: EditionAyah[]
}

export function useQuranText(kind: 'surah' | 'juz', num: number | null) {
  const [ayahs, setAyahs] = useState<AyahText[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!num) {
      setAyahs([])
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setAyahs([])

    fetch(`https://api.alquran.cloud/v1/${kind}/${num}/editions/quran-uthmani,en.sahih,en.transliteration`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => {
        if (cancelled) return
        const [ar, en, tr] = (json?.data ?? []) as Edition[]
        if (!ar?.ayahs?.length) throw new Error('Empty response')
        // The editions response carries no per-ayah surah info, so the surah
        // is resolved locally from the global ayah number
        const merged: AyahText[] = ar.ayahs.map((a, i) => {
          const meta = surahOfGlobalAyah(a.number)
          return {
            global: a.number,
            numInSurah: a.numberInSurah,
            surahNum: meta.n,
            surahName: meta.name,
            ar: a.text,
            translit: tr?.ayahs?.[i]?.text ?? '',
            en: en?.ayahs?.[i]?.text ?? '',
          }
        })
        setAyahs(merged)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the Quran text. Check your internet connection and try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [kind, num])

  return { ayahs, loading, error }
}
