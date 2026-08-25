import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, Plus, UserMinus, Users } from 'lucide-react'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LEVEL_LABELS, TRACK_LABELS } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { initialsOf } from '@/pages/teacher/Students'

export function TeacherClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { getClass, getEnrolledStudents, students, enrollStudent } = useAppStore()
  const [showAddModal, setShowAddModal] = useState(false)

  const klass = classId ? getClass(classId) : undefined

  if (!klass) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Class not found</h1>
        <Button variant="outline" onClick={() => navigate('/teacher/classes')}>
          Back to classes
        </Button>
      </div>
    )
  }

  const enrolled = getEnrolledStudents(klass.id)
  const avgScore = enrolled.length
    ? Math.round(enrolled.reduce((sum, s) => sum + s.avgScore, 0) / enrolled.length)
    : 0
  const available = students.filter((s) => s.classId !== klass.id)

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/teacher/classes')}
        className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
      >
        <ArrowLeft className="h-4 w-4" />
        All classes
      </button>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-ink">{klass.name}</h1>
            <p className="mt-1 text-sm text-ink/60">{klass.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                {LEVEL_LABELS[klass.level]}
              </span>
              <span className="rounded-full bg-paper-dim px-2 py-0.5 text-xs font-medium text-ink/60">
                {TRACK_LABELS[klass.learningTrack]}
              </span>
              <span className="rounded-full bg-paper-dim px-2 py-0.5 text-xs font-medium text-ink/60">
                Leaderboard {klass.leaderboardEnabled ? 'on' : 'off'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/teacher/classes/${klass.id}/analytics`)}>
              <BarChart3 className="mr-1.5 h-4 w-4" />
              View analytics
            </Button>
            <div className="flex gap-6 text-center">
            <div>
              <div className="font-display text-2xl font-semibold text-ink">{enrolled.length}</div>
              <div className="text-xs text-ink/50">Students</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold text-ink">{enrolled.length ? `${avgScore}%` : '—'}</div>
              <div className="text-xs text-ink/50">Avg score</div>
            </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-700" />
            Enrolled students
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add student
          </Button>
        </div>

        {enrolled.length === 0 ? (
          <p className="rounded-md border border-line p-4 text-sm text-ink/55">
            No students in this class yet. Use "Add student" to enroll students.
          </p>
        ) : (
          <CardContent className="space-y-3">
            {enrolled.map((student) => {
              const progress =
                student.totalUnits > 0 ? Math.round((student.unitsCompleted / student.totalUnits) * 100) : 0
              return (
                <div key={student.id} className="flex items-center gap-3 rounded-md border border-line p-4">
                  <div
                    onClick={() => navigate(`/teacher/students/${student.id}`)}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-100 font-display text-sm font-semibold text-green-800"
                  >
                    {initialsOf(student.name)}
                  </div>
                  <div
                    onClick={() => navigate(`/teacher/students/${student.id}`)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="text-sm font-medium text-ink">{student.name}</div>
                    <div className="truncate text-xs text-ink/55">
                      {student.pace.quantity} {student.pace.unit}/day • {progress}% complete • Avg {student.avgScore}%
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/students/${student.id}`)}>
                    View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => enrollStudent(student.id, null)}>
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Add students to {klass.name}</h2>
              <p className="mt-1 text-xs text-ink/55">
                Enrolling moves the student into this class. Students already in another class will be transferred.
              </p>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {available.length === 0 ? (
                <p className="rounded-md border border-line p-4 text-sm text-ink/55">
                  Every student is already enrolled in this class.
                </p>
              ) : (
                available.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 rounded-md border border-line p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-dim font-display text-xs font-semibold text-ink/70">
                      {initialsOf(student.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink">{student.name}</div>
                      <div className="truncate text-xs text-ink/55">
                        {student.classId === null
                          ? 'Not enrolled in any class'
                          : `Currently in ${getClass(student.classId)?.name ?? 'another class'}`}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => enrollStudent(student.id, klass.id)}>
                      Enroll
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
