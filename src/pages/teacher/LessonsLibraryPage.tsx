import { useMemo, useState } from 'react'
import { BookOpen, Pencil, Plus, Users } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { UNIT_LABELS } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'
import { useNavigate } from 'react-router-dom'

export function TeacherLessonsLibrary() {
  const navigate = useNavigate()
  const { classes, students, getEnrolledStudents, assignCurriculum, lessons } = useAppStore()
  const { push } = useToast()

  // Assign modal state
  const [assignLessonId, setAssignLessonId] = useState<string | null>(null)
  const [assignMode, setAssignMode] = useState<'class' | 'student'>('class')
  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')

  const lessonToAssign = lessons.find((l) => l.id === assignLessonId)

  // Students available for individual assignment
  const activeStudents = useMemo(() => students.filter((s) => s.status === 'active'), [students])

  const startAssign = (lessonId: string) => {
    setAssignLessonId(lessonId)
    setAssignMode('class')
    setClassId(classes[0]?.id ?? '')
    setSelectedStudentIds([])
    setDeadline('')
    setNotes('')
  }

  const toggleStudent = (studentId: string) =>
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )

  const submitAssign = () => {
    if (!lessonToAssign) return
    let studentIds: string[] = []
    if (assignMode === 'class') {
      if (!classId) return
      studentIds = getEnrolledStudents(classId).map((s) => s.id)
      if (studentIds.length === 0) {
        push('No students enrolled in this class', 'error')
        return
      }
    } else {
      if (selectedStudentIds.length === 0) {
        push('Select at least one student', 'error')
        return
      }
      studentIds = selectedStudentIds
    }
    assignCurriculum({
      curriculumId: lessonToAssign.id,
      curriculumTitle: lessonToAssign.title,
      assignmentName: lessonToAssign.title,
      classId: assignMode === 'class' ? classId : '',
      studentIds,
      deadline: deadline || null,
      notes: notes.trim() || 'Assigned from assignment library',
    })
    push(`Assignment sent: ${lessonToAssign.title}`)
    setAssignLessonId(null)
  }

  const list = useMemo(() => lessons, [lessons])

  if (list.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Assignments</h1>
            <p className="mt-1 text-sm text-ink/55">Create and assign lessons to your students.</p>
          </div>
          <Button onClick={() => navigate('/teacher/lessons/new')}>
            <Plus className="mr-1.5 h-4 w-4" />
            New assignment
          </Button>
        </div>
        <Card>
          <CardContent className="py-14 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-ink/30" />
            <h2 className="mt-3 text-base font-semibold text-ink">No assignments yet</h2>
            <p className="mt-1 text-sm text-ink/50">
              Build your first assignment to assign to students.
            </p>
            <Button className="mt-4" onClick={() => navigate('/teacher/lessons/new')}>
              Create assignment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Assignments</h1>
          <p className="mt-1 text-sm text-ink/55">
            Browse prepared assignments and assign them to classes or individual students.
          </p>
        </div>
        <Button onClick={() => navigate('/teacher/lessons/new')}>
          <Plus className="mr-1.5 h-4 w-4" />
          New assignment
        </Button>
      </div>

      {/* Assignment cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((lesson) => (
          <Card key={lesson.id} className="h-full">
            <CardContent className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">{lesson.title}</h2>
                  <span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    {lesson.lessonType === 'juz_range' ? 'Juz range' : lesson.lessonType}
                  </span>
                </div>
                <BookOpen className="h-5 w-5 shrink-0 text-green-700" />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-ink/60">
                <div className="flex items-center justify-between">
                  <span>Target</span>
                  <span className="font-semibold text-ink">
                    {lesson.targetQuantity}{' '}
                    {UNIT_LABELS[lesson.targetUnitType as keyof typeof UNIT_LABELS] ??
                      lesson.targetUnitType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Qari</span>
                  <span className="font-medium text-ink">{lesson.audioQari}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span>{format(new Date(lesson.createdAt + 'T00:00:00'), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {lesson.tajweedRules.slice(0, 2).map((rule) => (
                  <span
                    key={rule}
                    className="rounded-full bg-paper-dim px-2.5 py-1 text-xs text-ink/60"
                  >
                    {rule}
                  </span>
                ))}
                {lesson.tajweedRules.length > 2 && (
                  <span className="rounded-full bg-paper-dim px-2.5 py-1 text-xs text-ink/50">
                    +{lesson.tajweedRules.length - 2} more
                  </span>
                )}
              </div>

              <div className="mt-auto flex gap-2 border-t border-line pt-4">
                <Button size="sm" onClick={() => startAssign(lesson.id)}>
                  <Users className="mr-1.5 h-4 w-4" />
                  Assign
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/teacher/lessons/${lesson.id}/edit`)}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign modal */}
      <Modal
        open={!!lessonToAssign}
        onClose={() => setAssignLessonId(null)}
        title="Assign to students"
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignLessonId(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitAssign}
              disabled={
                assignMode === 'class' ? !classId : selectedStudentIds.length === 0
              }
            >
              Assign
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <p className="text-sm text-ink/70">
            Assigning{' '}
            <span className="font-semibold text-ink">{lessonToAssign?.title}</span>
          </p>

          {/* Mode toggle */}
          <div className="inline-flex rounded-xl border border-line bg-paper-dim p-1">
            {(['class', 'student'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setAssignMode(mode)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  assignMode === mode
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-ink/55 hover:text-ink'
                }`}
              >
                {mode === 'class' ? 'Whole class' : 'Individual students'}
              </button>
            ))}
          </div>

          {/* Class selector */}
          {assignMode === 'class' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink"
              >
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {classId && (
                <p className="mt-1.5 text-xs text-ink/50">
                  {getEnrolledStudents(classId).length} student
                  {getEnrolledStudents(classId).length !== 1 ? 's' : ''} enrolled
                </p>
              )}
            </div>
          )}

          {/* Individual student selector */}
          {assignMode === 'student' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Students</label>
              <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-line bg-white p-2">
                {activeStudents.length === 0 ? (
                  <p className="py-4 text-center text-sm text-ink/50">No active students</p>
                ) : (
                  activeStudents.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-paper-dim"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                        className="accent-green-700"
                      />
                      <span className="text-sm text-ink">{s.name}</span>
                      {s.classId && (
                        <span className="ml-auto text-xs text-ink/40">
                          {classes.find((c) => c.id === s.classId)?.name ?? ''}
                        </span>
                      )}
                    </label>
                  ))
                )}
              </div>
              {selectedStudentIds.length > 0 && (
                <p className="mt-1.5 text-xs text-ink/50">
                  {selectedStudentIds.length} student
                  {selectedStudentIds.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Deadline{' '}
              <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Notes for student{' '}
              <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any specific instructions…"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-green-600/30"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
