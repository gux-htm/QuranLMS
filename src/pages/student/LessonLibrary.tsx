import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CURRENT_STUDENT, today } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { calculateLessonLibrary, type DailyLesson } from '@/lib/lessonCalculator'
import { format, isSameMonth, isToday, isTomorrow, parseISO } from 'date-fns'

export function StudentLessonLibrary() {
  const navigate = useNavigate()
  const { lessonProgress } = useAppStore()

  // Calculate lesson library based on student's pace and progress
  const { lessons, lastCompletedDate, nextPendingDate } = useMemo(() => {
    return calculateLessonLibrary({
      studentId: CURRENT_STUDENT.id,
      currentDate: today,
      pace: CURRENT_STUDENT.pace,
      unitsCompleted: CURRENT_STUDENT.unitsCompleted,
      totalUnits: CURRENT_STUDENT.totalUnits,
      completedLessons: lessonProgress,
      // paceChangeDate: undefined, // Would be set if pace recently changed
    })
  }, [lessonProgress])

  // Group lessons by month for better organization
  const lessonsByMonth = useMemo(() => {
    const groups: Record<string, DailyLesson[]> = {}
    
    lessons.forEach(lesson => {
      const monthKey = format(lesson.dateObj, 'MMMM yyyy')
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(lesson)
    })
    
    return groups
  }, [lessons])

  const monthKeys = Object.keys(lessonsByMonth)

  const completedCount = lessons.filter(l => l.status === 'completed').length
  const pendingCount = lessons.filter(l => l.status === 'pending').length
  const totalLessons = lessons.length

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Lesson Library</h1>
        <p className="mt-1 text-sm text-ink/55">
          All your lessons distributed by pace · {CURRENT_STUDENT.pace.quantity} {CURRENT_STUDENT.pace.unit} per day
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <div className="text-xl font-bold text-ink">{completedCount}</div>
              <div className="text-xs text-ink/50">Completed</div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
              <Clock className="h-5 w-5 text-sky-700" />
            </div>
            <div>
              <div className="text-xl font-bold text-ink">{pendingCount}</div>
              <div className="text-xs text-ink/50">Pending</div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50">
              <BookOpen className="h-5 w-5 text-gold-700" />
            </div>
            <div>
              <div className="text-xl font-bold text-ink">{totalLessons}</div>
              <div className="text-xs text-ink/50">Total Lessons</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {lessons.length === 0 && (
        <Card className="p-12">
          <CardContent className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-700" />
            </div>
            <h3 className="mt-4 font-semibold text-ink">All lessons completed!</h3>
            <p className="mt-1 text-sm text-ink/50">
              You've finished your entire curriculum. Congratulations!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lesson groups by month */}
      {monthKeys.map((monthKey) => {
        const monthLessons = lessonsByMonth[monthKey]
        
        return (
          <div key={monthKey} className="space-y-3">
            {/* Month header */}
            <div className="flex items-center gap-2 text-sm font-semibold text-ink/70">
              <Calendar className="h-4 w-4" />
              <span>{monthKey}</span>
              <span className="text-ink/40">
                · {monthLessons.filter(l => l.status === 'completed').length} / {monthLessons.length} completed
              </span>
            </div>

            {/* Lessons in this month */}
            <div className="space-y-2">
              {monthLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isNext={nextPendingDate === lesson.date}
                  onPractice={() => navigate(`/student/lesson/${lesson.id}`)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Quick actions */}
      {nextPendingDate && (
        <Card className="border-green-200 bg-green-50/30 p-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="mb-1">Ready for your next lesson?</CardTitle>
              <p className="text-sm text-ink/60">
                {format(parseISO(nextPendingDate), 'EEEE, MMMM d')} · Continue your learning journey
              </p>
            </div>
            <Button onClick={() => navigate(`/student/lesson/${nextPendingDate}`)}>
              <PlayCircle className="mr-1.5 h-4 w-4" />
              Start practicing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface LessonCardProps {
  lesson: DailyLesson
  isNext: boolean
  onPractice: () => void
}

function LessonCard({ lesson, isNext, onPractice }: LessonCardProps) {
  const dateObj = parseISO(lesson.date)
  const isCompletedLesson = lesson.status === 'completed'
  
  // Date label with special formatting
  const dateLabel = isToday(dateObj)
    ? 'Today'
    : isTomorrow(dateObj)
    ? 'Tomorrow'
    : format(dateObj, 'EEE, MMM d')

  const statusClass = isCompletedLesson
    ? 'bg-green-50 text-green-700 border-green-200'
    : isNext
    ? 'bg-sky-50 text-sky-700 border-sky-200'
    : 'bg-gray-50 text-gray-600 border-gray-200'

  const statusLabel = isCompletedLesson ? 'Completed' : isNext ? 'Next' : 'Pending'

  return (
    <Card className={`p-4 transition-all hover:shadow-sm ${isNext ? 'border-sky-200 bg-sky-50/20' : ''}`}>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Date indicator */}
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-paper-dim">
            <div className="text-xs font-medium text-ink/50">
              {format(dateObj, 'MMM')}
            </div>
            <div className="text-lg font-bold text-ink">
              {format(dateObj, 'd')}
            </div>
          </div>

          {/* Lesson info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-ink">{lesson.label}</h3>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/50">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dateLabel}
              </span>
              
              {isCompletedLesson && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {lesson.actualQuantity} {CURRENT_STUDENT.pace.unit} completed
                </span>
              )}
              
              {!isCompletedLesson && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Target: {lesson.targetQuantity} {CURRENT_STUDENT.pace.unit}
                </span>
              )}
            </div>

            {/* Progress indicator for under/over completion */}
            {isCompletedLesson && lesson.actualQuantity !== lesson.targetQuantity && (
              <div className="mt-2 text-xs">
                {lesson.actualQuantity > lesson.targetQuantity ? (
                  <span className="text-green-700">
                    +{Math.round((lesson.actualQuantity - lesson.targetQuantity) * 10) / 10} extra {CURRENT_STUDENT.pace.unit}
                  </span>
                ) : (
                  <span className="text-amber-700">
                    {Math.round((lesson.targetQuantity - lesson.actualQuantity) * 10) / 10} {CURRENT_STUDENT.pace.unit} short
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <Button
          variant={isNext ? 'default' : 'outline'}
          size="sm"
          onClick={onPractice}
        >
          {isCompletedLesson ? (
            <>
              <BookOpen className="mr-1.5 h-4 w-4" />
              Review
            </>
          ) : (
            <>
              <PlayCircle className="mr-1.5 h-4 w-4" />
              Practice
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
