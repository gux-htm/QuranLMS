import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MISTAKE_TYPE_LABELS, SCORE_CRITERIA_LABELS, SCORE_WEIGHTS, SESSION_DETAILS } from '@/lib/mockData'
import type { MistakeType, SessionMistake } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'

const DEFAULT_DEDUCTION: Record<MistakeType, number> = { makhraj: 3, tajweed: 2, fluency: 2, other: 1 }

export function ScoringMistakesPanel({ sessionId }: { sessionId: string }) {
  const { sessionMistakes, addMistake, removeMistake, sessionScores } = useAppStore()
  const [open, setOpen] = useState(false)
  const [wordText, setWordText] = useState('')
  const [ayah, setAyah] = useState('1')
  const [type, setType] = useState<MistakeType>('makhraj')
  const [subtype, setSubtype] = useState('')
  const [deduction, setDeduction] = useState('3')
  const [note, setNote] = useState('')

  const mistakes = sessionMistakes[sessionId] ?? []
  const totalDeduction = useMemo(() => mistakes.reduce((sum, mistake) => sum + (mistake.deduction ?? DEFAULT_DEDUCTION[mistake.type]), 0), [mistakes])
  const score = sessionScores[sessionId]
  const detail = SESSION_DETAILS[sessionId]
  const surahNumber = detail?.resumeFrom.surahNumber ?? 1
  const surahName = detail?.resumeFrom.surahName ?? 'Quran'

  const reset = () => {
    setWordText('')
    setAyah('1')
    setType('makhraj')
    setSubtype('')
    setDeduction('3')
    setNote('')
  }

  const save = () => {
    if (!wordText.trim()) return
    const safeAyah = Math.max(1, Number(ayah) || 1)
    const safeDeduction = Math.max(0, Number(deduction) || DEFAULT_DEDUCTION[type])
    addMistake(sessionId, {
      verseKey: `${surahNumber}:${safeAyah}`,
      surahName,
      ayah: safeAyah,
      wordText: wordText.trim(),
      wordPosition: mistakes.length + 1,
      type,
      note: note.trim(),
      subtype: subtype.trim() || undefined,
      deduction: safeDeduction,
    })
    setOpen(false)
    reset()
  }

  const handleTypeChange = (next: MistakeType) => {
    setType(next)
    setDeduction(String(DEFAULT_DEDUCTION[next]))
  }

  return (
    <Card className="border-gold-200">
      <CardTitle className="mb-3">Mistakes logged</CardTitle>
      <CardContent className="space-y-3">
        {mistakes.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-paper-dim/40 p-4 text-sm text-ink/55">No mistakes logged for this session yet.</p>
        ) : (
          <div className="space-y-2">
            {mistakes.map((mistake: SessionMistake) => (
              <div key={mistake.id} className="flex flex-wrap items-start gap-3 rounded-md border border-line bg-white p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-arabic text-2xl text-ink" dir="rtl">{mistake.wordText}</span>
                    <span className="rounded-full bg-clay-100 px-2 py-0.5 text-xs font-medium text-clay-700">{MISTAKE_TYPE_LABELS[mistake.type]}</span>
                    <span className="text-xs text-ink/50">Ayah {mistake.ayah}</span>
                  </div>
                  {mistake.subtype && <div className="mt-1 text-xs text-ink/50">{mistake.subtype}</div>}
                  {mistake.note && <div className="mt-1 text-xs text-ink/60">{mistake.note}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-clay-700">−{mistake.deduction ?? DEFAULT_DEDUCTION[mistake.type]} pts</span>
                  <button onClick={() => removeMistake(sessionId, mistake.id)} className="rounded-md p-1.5 text-ink/40 hover:bg-clay-100 hover:text-clay-700" title="Remove mistake" aria-label="Remove mistake">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <div className="text-xs text-ink/50">
            Auto-calculated from mistakes: <span className="font-semibold text-clay-700">−{totalDeduction} pts</span>
            {score && <span className="ml-2">Current submitted score: {score.total}/100.</span>}
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>Log a mistake</Button>
        </div>
      </CardContent>

      <Modal
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Log a mistake"
        footer={
          <>
            <Button variant="outline" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button onClick={save} disabled={!wordText.trim()}>Save mistake</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Arabic word</label>
              <input value={wordText} onChange={(event) => setWordText(event.target.value)} dir="rtl" placeholder="كلمة" className="h-10 w-full rounded-md border border-line bg-white px-3 text-right font-arabic text-lg text-ink" />
            </div>
            <Input label="Ayah" type="number" min="1" value={ayah} onChange={(event) => setAyah(event.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Mistake type</label>
              <select value={type} onChange={(event) => handleTypeChange(event.target.value as MistakeType)} className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink">{(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map((key) => <option key={key} value={key}>{MISTAKE_TYPE_LABELS[key]}</option>)}</select>
            </div>
            <Input label="Subtype" value={subtype} onChange={(event) => setSubtype(event.target.value)} placeholder="e.g. Ghunnah length" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Deduction" type="number" min="0" step="1" value={deduction} onChange={(event) => setDeduction(event.target.value)} />
            <Input label="Teacher note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional correction note" />
          </div>
          <p className="text-xs text-ink/45">Use the deduction to keep the scoring impact visible. The existing rubric remains the source of the submitted criterion scores.</p>
        </div>
      </Modal>
    </Card>
  )
}
