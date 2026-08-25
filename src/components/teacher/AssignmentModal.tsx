import { useEffect, useMemo, useState } from 'react'
import { format, addDays } from 'date-fns'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAssignCurriculum } from '@/hooks/useAssignCurriculum'
import { useAppStore } from '@/lib/store'
import { today } from '@/lib/mockData'
import type { CurriculumItem } from '@/types'

interface AssignmentModalProps {
  item: CurriculumItem | null
  mode: 'class' | 'student'
  onClose: () => void
  onAssigned: (studentCount: number, className: string) => void
}

// Assignment flow: pick class -> pick students -> deadline -> notes -> assign
export function AssignmentModal({ item, mode, onClose, onAssigned }: AssignmentModalProps) {
  const { classes, getEnrolledStudents, students } = useAppStore()
  const { assign, loading } = useAssignCurriculum()

  const [classId, setClassId] = useState('')
  const [specificOnly, setSpecificOnly] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')

  const classStudents = useMemo(() => (classId ? getEnrolledStudents(classId) : []), [classId, getEnrolledStudents])
  // "Assign to Student" mode lets the teacher pick any active student
  const pool = mode === 'student' ? students.filter((s) => s.status === 'active') : classStudents

  useEffect(() => {
    if (item) {
      setClassId(mode === 'class' ? classes[0]?.id ?? '' : '')
      setSpecificOnly(false)
      setSelected([])
      // Auto-filled deadline: one week out, teacher can adjust based on pace
      setDeadline(format(addDays(today, 7), 'yyyy-MM-dd'))
      setNotes('')
    }
  }, [item, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) return null

  const targetIds = specificOnly ? selected : pool.map((s) => s.id)
  const canAssign = targetIds.length > 0 && (mode === 'student' ? true : classId !== '')

  const toggleStudent = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleAssign = async () => {
    const klass = classes.find((c) => c.id === classId)
    await assign({
      curriculumId: item.id,
      curriculumTitle: item.title,
      classId: mode === 'student' ? '' : classId,
      studentIds: targetIds,
      deadline: deadline || null,
      notes: notes.trim(),
    })
    onAssigned(targetIds.length, mode === 'student' ? 'selected students' : klass?.name ?? 'the class')
  }

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={`Assign “${item.title}”`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!canAssign || loading}>
            {loading ? 'Assigning…' : `Assign${targetIds.length ? ` to ${targetIds.length} student${targetIds.length === 1 ? '' : 's'}` : ''}`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {mode === 'class' && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Class</span>
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value)
                setSelected([])
              }}
              className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({getEnrolledStudents(c.id).length} students)
                </option>
              ))}
            </select>
          </label>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">
              {mode === 'student' ? 'Select students' : 'Who gets this assignment?'}
            </span>
          </div>

          {mode === 'class' && (
            <div className="mb-2 flex gap-2" role="radiogroup" aria-label="Student selection mode">
              <button
                onClick={() => setSpecificOnly(false)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  !specificOnly ? 'bg-green-600 text-paper' : 'bg-paper-dim text-ink/60 hover:bg-line'
                }`}
              >
                All students in class ({pool.length})
              </button>
              <button
                onClick={() => setSpecificOnly(true)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  specificOnly ? 'bg-green-600 text-paper' : 'bg-paper-dim text-ink/60 hover:bg-line'
                }`}
              >
                Specific students
              </button>
            </div>
          )}

          {(mode === 'student' || specificOnly) && (
            <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-md border border-line p-2">
              {pool.length === 0 ? (
                <p className="p-2 text-sm text-ink/50">No students available.</p>
              ) : (
                pool.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-paper-dim">
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      className="h-4 w-4 accent-green-600"
                    />
                    <span className="flex-1 text-sm text-ink">{s.name}</span>
                    <span className="text-xs text-ink/45">
                      {s.pace.quantity} {s.pace.unit}/day
                    </span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Deadline (optional)</span>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Notes for students (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder='e.g. "Practice Makhraj on page 2 before Thursday"'
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-green-600/40"
          />
        </label>
      </div>
    </Modal>
  )
}
