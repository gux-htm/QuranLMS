import { BookOpenText, Clock } from 'lucide-react'
import { LEVEL_LABELS } from '@/lib/mockData'
import type { CurriculumItem } from '@/types'

export const TRACK_FILTER_LABELS: Record<CurriculumItem['track'], string> = {
  juz_based: 'Para-Based',
  qaida: 'Noorani Qaida',
  surah_based: 'Surah-Based',
  tajweed: 'Tajweed Guide',
  makharij: 'Makharij Guide',
  waqf: 'Stopping Rules',
  duas: 'Duas',
  hadith: 'Hadiths',
  custom: 'Custom',
}

const difficultyStyles: Record<CurriculumItem['difficulty'], string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-gold-100 text-gold-800',
  advanced: 'bg-clay-100 text-clay-700',
}

interface CurriculumCardProps {
  item: CurriculumItem
  onOpen: () => void
}

export function CurriculumCard({ item, onOpen }: CurriculumCardProps) {
  return (
    <button
      onClick={onOpen}
      className="group flex w-full flex-col rounded-lg border border-line bg-white p-5 text-left shadow-card transition hover:border-green-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyStyles[item.difficulty]}`}>
          {LEVEL_LABELS[item.difficulty]}
        </span>
        <span className="rounded-full bg-paper-dim px-2.5 py-0.5 text-xs font-medium text-ink/55">
          {TRACK_FILTER_LABELS[item.track]}
        </span>
      </div>

      <h3 className="font-display text-base font-semibold text-ink group-hover:text-green-800">{item.title}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink/55">{item.description}</p>

      <div className="mt-3 flex items-center gap-4 text-xs text-ink/50">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {item.durationMinutes} min
        </span>
        <span className="inline-flex items-center gap-1">
          <BookOpenText className="h-3.5 w-3.5" />
          {item.tajweedRules.length} tajweed rule{item.tajweedRules.length === 1 ? '' : 's'}
        </span>
      </div>
    </button>
  )
}
