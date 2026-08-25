import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  GHUNNAH_TYPES,
  LESSON_MISTAKE_TYPE_LABELS,
  MAKHRAJ_POINTS,
} from '@/types'
import type { LessonMistakeType } from '@/types'

export interface MistakeDraft {
  verseKey: string
  ayah: number
  wordText: string
  wordPosition: number
  transliteration?: string
  type: LessonMistakeType
  subtype: string
  deduction: number
  note: string
}

interface MistakeLoggerProps {
  word: {
    verseKey: string
    ayah: number
    wordText: string
    wordPosition: number
    transliteration?: string
  } | null
  existing: MistakeDraft | null
  onClose: () => void
  onAdd: (draft: MistakeDraft) => void
}

const DEFAULT_DEDUCTION: Record<LessonMistakeType, number> = {
  makhraj: 3,
  ghunnah: 1,
  tafkheem: 2,
  tajweed_rule: 2,
  other: 1,
}

// Word-click popup: log a mistake against the selected word (3d)
export function MistakeLogger({ word, existing, onClose, onAdd }: MistakeLoggerProps) {
  const [type, setType] = useState<LessonMistakeType>('makhraj')
  const [subtype, setSubtype] = useState('')
  const [deduction, setDeduction] = useState(DEFAULT_DEDUCTION.makhraj)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (word) {
      setType(existing?.type ?? 'makhraj')
      setSubtype(existing?.subtype ?? '')
      setDeduction(existing?.deduction ?? DEFAULT_DEDUCTION.makhraj)
      setNote(existing?.note ?? '')
    }
  }, [word, existing])

  if (!word) return null

  const subtypeOptions =
    type === 'makhraj' ? MAKHRAJ_POINTS : type === 'ghunnah' ? GHUNNAH_TYPES : []

  const changeType = (t: LessonMistakeType) => {
    setType(t)
    setSubtype('')
    setDeduction(DEFAULT_DEDUCTION[t])
  }

  const handleAdd = () => {
    onAdd({
      verseKey: word.verseKey,
      ayah: word.ayah,
      wordText: word.wordText,
      wordPosition: word.wordPosition,
      transliteration: word.transliteration,
      type,
      subtype: subtypeOptions.length ? subtype : '',
      deduction,
      note: note.trim(),
    })
  }

  return (
    <Modal
      open={!!word}
      onClose={onClose}
      title="Log a mistake"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={subtypeOptions.length > 0 && !subtype}>
            Add mistake
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-gold-200 bg-paper p-3">
          <span className="font-arabic text-3xl text-ink" dir="rtl">
            {word.wordText}
          </span>
          <div className="text-xs text-ink/55">
            <div className="font-medium text-ink/75">Ayah {word.verseKey}</div>
            {word.transliteration && <div className="italic">{word.transliteration}</div>}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Mistake type</span>
          <select
            value={type}
            onChange={(e) => changeType(e.target.value as LessonMistakeType)}
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
          >
            {(Object.keys(LESSON_MISTAKE_TYPE_LABELS) as LessonMistakeType[]).map((t) => (
              <option key={t} value={t}>
                {LESSON_MISTAKE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        {subtypeOptions.length > 0 && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              {type === 'makhraj' ? 'Makhraj point' : 'Ghunnah letter'}
            </span>
            <select
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
            >
              <option value="">Select…</option>
              {subtypeOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Points deducted</span>
            <input
              type="number"
              min={0}
              max={25}
              value={deduction}
              onChange={(e) => setDeduction(Math.max(0, Math.min(25, Number(e.target.value) || 0)))}
              className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm tabular-nums text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Teacher notes</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder='e.g. "Repeat after 2:15 in the audio"'
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
          />
        </label>
      </div>
    </Modal>
  )
}
