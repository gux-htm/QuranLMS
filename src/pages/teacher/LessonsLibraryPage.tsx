import { useMemo, useState } from 'react'
import { BookOpen, Pencil, Plus, Users } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LESSONS, UNIT_LABELS } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'

export function TeacherLessonsLibrary() {
  const { classes, getEnrolledStudents, assignCurriculum } = useAppStore()
  const { push } = useToast()
  const [assignLessonId, setAssignLessonId] = useState<string | null>(null)
  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [deadline, setDeadline] = useState('')

  const lessons = useMemo(() => LESSONS, [])
  const lessonToAssign = lessons.find((lesson) => lesson.id === assignLessonId)

  const startAssign = (lessonId: string) => {
    setAssignLessonId(lessonId)
    setClassId(classes[0]?.id ?? '')
    setDeadline('')
  }

  const submitAssign = () => {
    if (!lessonToAssign || !classId) return
    const students = getEnrolledStudents(classId).map((student) => student.id)
    assignCurriculum({
      curriculumId: lessonToAssign.id,
      curriculumTitle: lessonToAssign.title,
      classId,
      studentIds: students,
      deadline: deadline || null,
      notes: 'Assigned from lesson library',
    })
    push(`Assigned ${lessonToAssign.title}`)
    setAssignLessonId(null)
  }

  if (lessons.length === 0) {
    return <div className="space-y-6"><div className="flex items-center justify-between gap-4"><div><h1 className="font-display text-2xl font-semibold text-ink">Lesson library</h1><p className="mt-1 text-sm text-ink/55">Reuse lessons you have already prepared.</p></div><Button onClick={() => window.location.assign('/teacher/lessons/new')}><Plus className="mr-1.5 h-4 w-4" />New lesson</Button></div><Card><CardContent className="py-14 text-center"><BookOpen className="mx-auto h-10 w-10 text-ink/30" /><h2 className="mt-3 text-base font-semibold text-ink">No lessons yet</h2><p className="mt-1 text-sm text-ink/50">Build your first lesson to assign to students.</p><Button className="mt-4" onClick={() => window.location.assign('/teacher/lessons/new')}>Create lesson</Button></CardContent></Card></div>
  }

  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-semibold text-ink">Lesson library</h1><p className="mt-1 text-sm text-ink/55">Browse prepared lessons and reuse them across classes.</p></div><Button onClick={() => window.location.assign('/teacher/lessons/new')}><Plus className="mr-1.5 h-4 w-4" />New lesson</Button></div><div className="grid gap-4 md:grid-cols-2">{lessons.map((lesson) => <Card key={lesson.id} className="h-full"><CardContent className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-semibold text-ink">{lesson.title}</h2><span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{lesson.lessonType === 'juz_range' ? 'Juz range' : lesson.lessonType}</span></div><BookOpen className="h-5 w-5 text-green-700" /></div><div className="mt-4 grid gap-2 text-sm text-ink/60"><div className="flex items-center justify-between"><span>Target</span><span className="font-semibold text-ink">{lesson.targetQuantity} {UNIT_LABELS[lesson.targetUnitType as keyof typeof UNIT_LABELS] ?? lesson.targetUnitType}</span></div><div className="flex items-center justify-between"><span>Qari</span><span className="font-medium text-ink">{lesson.audioQari}</span></div><div className="flex items-center justify-between"><span>Created</span><span>{format(new Date(lesson.createdAt + 'T00:00:00'), 'MMM d, yyyy')}</span></div></div><div className="mt-4 flex flex-wrap gap-1.5">{lesson.tajweedRules.slice(0, 2).map((rule) => <span key={rule} className="rounded-full bg-paper-dim px-2.5 py-1 text-xs text-ink/60">{rule}</span>)}{lesson.tajweedRules.length > 2 && <span className="rounded-full bg-paper-dim px-2.5 py-1 text-xs text-ink/50">+{lesson.tajweedRules.length - 2} more</span>}</div><div className="mt-auto flex gap-2 border-t border-line pt-4"><Button size="sm" onClick={() => startAssign(lesson.id)}><Users className="mr-1.5 h-4 w-4" />Assign</Button><Button size="sm" variant="outline" onClick={() => push(`Edit form for ${lesson.title} is ready for the next lesson-library pass`)}><Pencil className="mr-1.5 h-4 w-4" />Edit</Button></div></CardContent></Card>)}</div><Modal open={!!lessonToAssign} onClose={() => setAssignLessonId(null)} title="Assign lesson" footer={<><Button variant="outline" onClick={() => setAssignLessonId(null)}>Cancel</Button><Button onClick={submitAssign} disabled={!classId}>Assign lesson</Button></>}><div className="space-y-4"><p className="text-sm text-ink/70">Assign <span className="font-semibold text-ink">{lessonToAssign?.title}</span> to a class.</p><div><label className="mb-1.5 block text-sm font-medium text-ink">Class</label><select value={classId} onChange={(event) => setClassId(event.target.value)} className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"><option value="">Select a class</option>{classes.map((klass) => <option key={klass.id} value={klass.id}>{klass.name}</option>)}</select></div><div><label className="mb-1.5 block text-sm font-medium text-ink">Deadline</label><input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink" /></div></div></Modal></div>
}
