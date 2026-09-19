import { addDays, format } from 'date-fns'
import type { PaceUnit } from './mockData'

export interface DailyLesson {
  id: string
  date: string
  dateObj: Date
  startUnit: number // e.g., page 15, verse 500
  endUnit: number // e.g., page 16, verse 550
  targetQuantity: number // how much the student should cover
  actualQuantity: number // how much they actually covered (0 if not completed)
  status: 'completed' | 'pending'
  label: string // e.g., "Pages 15-16", "Verses 500-550"
}

export interface LessonCalculationInput {
  studentId: string
  currentDate: Date
  pace: { quantity: number; unit: PaceUnit }
  unitsCompleted: number // where student is now (e.g., 15 pages done)
  totalUnits: number // total curriculum (e.g., 604 pages)
  completedLessons: Record<string, number> // lessonId -> actualQuantity completed
  paceChangeDate?: string // RULE 3: date when pace was last changed (triggers recalculation)
}

export interface LessonCalculationResult {
  lessons: DailyLesson[]
  lastCompletedDate: string | null
  nextPendingDate: string | null
}

/**
 * Core lesson calculation engine.
 * Distributes curriculum content into daily lessons based on pace.
 * 
 * Algorithm with recalculation rules:
 * 1. Start from student's current progress (unitsCompleted)
 * 2. Distribute remaining units (totalUnits - unitsCompleted) into daily chunks
 * 3. Each day gets pace.quantity units
 * 4. Mark lessons as completed if they exist in completedLessons record
 * 5. Apply recalculation rules when actual != target:
 *    - RULE 1 (over-completion): If actual > target, next lesson starts from actual endpoint
 *    - RULE 2 (under-completion): If actual < target, next lesson absorbs remainder
 *    - RULE 3 (pace change): When pace changes, recalculate all pending lessons from last completed
 * 
 * RULE 3 Implementation:
 * - When paceChangeDate is provided, find the last completed lesson
 * - All lessons after the last completed are recalculated with the new pace
 * - Completed lessons before the pace change remain unchanged
 */
export function calculateLessonLibrary(input: LessonCalculationInput): LessonCalculationResult {
  const {
    currentDate,
    pace,
    unitsCompleted,
    totalUnits,
    completedLessons,
    paceChangeDate,
  } = input

  const lessons: DailyLesson[] = []
  const remainingUnits = totalUnits - unitsCompleted
  
  if (remainingUnits <= 0) {
    // Student has completed entire curriculum
    return {
      lessons: [],
      lastCompletedDate: null,
      nextPendingDate: null,
    }
  }

  // Calculate number of days needed to complete remaining curriculum
  const dailyPace = Math.max(pace.quantity, 0.1) // prevent division by zero
  const daysNeeded = Math.ceil(remainingUnits / dailyPace)

  // RULE 3: Determine recalculation starting point
  // Find the last completed lesson to know where recalculation should begin
  const completedLessonDates = Object.keys(completedLessons)
    .filter(id => completedLessons[id] > 0)
    .sort()
  
  const lastCompletedLessonDate = completedLessonDates.length > 0 
    ? completedLessonDates[completedLessonDates.length - 1].replace('lesson-', '')
    : null

  // Determine where recalculation starts:
  // - If pace changed, start from day after last completed lesson
  // - Otherwise, use normal flow
  const shouldRecalculate = paceChangeDate && lastCompletedLessonDate
  let recalculationStartUnit = unitsCompleted

  if (shouldRecalculate && lastCompletedLessonDate) {
    // Find actual endpoint of last completed lesson
    const lastLessonId = `lesson-${lastCompletedLessonDate}`
    const lastActual = completedLessons[lastLessonId] || 0
    
    // Recalculation starts from where the last completed lesson actually ended
    // This will be used to redistribute all pending lessons
    recalculationStartUnit = unitsCompleted + lastActual
  }

  // Generate lessons starting from today (not tomorrow) so current sessions have content
  let currentUnit = shouldRecalculate ? recalculationStartUnit : unitsCompleted
  let lastCompletedDate: string | null = null
  let nextPendingDate: string | null = null
  let previousLessonActual: number | null = null
  let carryOverDeficit = 0 // RULE 2: tracks under-completion remainder

  for (let dayOffset = 0; dayOffset <= Math.min(daysNeeded, 365); dayOffset++) {
    const lessonDate = addDays(currentDate, dayOffset)
    const dateStr = format(lessonDate, 'yyyy-MM-dd')
    const lessonId = `lesson-${dateStr}`

    // Check if this lesson was completed
    const actualQuantity = completedLessons[lessonId] || 0
    const hasCompletion = actualQuantity > 0

    // RULE 3: Skip recalculation for completed lessons before pace change
    const lessonIsBeforePaceChange = paceChangeDate && lastCompletedLessonDate 
      && dateStr <= lastCompletedLessonDate
    
    if (hasCompletion && lessonIsBeforePaceChange) {
      // This lesson was completed before pace change - keep its original values
      // Just track it and continue to next iteration
      const targetQuantity = actualQuantity // Use actual as target since it's historical
      
      const lesson: DailyLesson = {
        id: lessonId,
        date: dateStr,
        dateObj: lessonDate,
        startUnit: Math.round(currentUnit * 10) / 10,
        endUnit: Math.round((currentUnit + actualQuantity) * 10) / 10,
        targetQuantity: Math.round(targetQuantity * 10) / 10,
        actualQuantity: Math.round(actualQuantity * 10) / 10,
        status: 'completed',
        label: formatLessonLabel(currentUnit, currentUnit + actualQuantity, pace.unit),
      }
      
      lessons.push(lesson)
      lastCompletedDate = dateStr
      currentUnit += actualQuantity
      previousLessonActual = currentUnit
      continue
    }

    // Calculate start point for this lesson
    let startUnit = currentUnit
    
    // RULE 1: Over-completion adjustment
    // If previous lesson was completed with MORE than target, this lesson starts from actual endpoint
    if (previousLessonActual !== null && previousLessonActual > currentUnit) {
      startUnit = previousLessonActual
      currentUnit = previousLessonActual // Update currentUnit for subsequent lessons
      carryOverDeficit = 0 // Clear any deficit when student over-completes
    }

    // Calculate how much content this lesson should cover
    let targetQuantity = Math.min(dailyPace, totalUnits - startUnit)
    
    // RULE 2: Under-completion adjustment
    // If previous lesson was under-completed, this lesson absorbs the deficit
    if (carryOverDeficit > 0) {
      targetQuantity = Math.min(targetQuantity + carryOverDeficit, totalUnits - startUnit)
    }
    
    const endUnit = Math.min(startUnit + targetQuantity, totalUnits)

    // Determine completion status
    const isCompleted = hasCompletion && actualQuantity >= targetQuantity * 0.95 // 95% threshold

    // Create lesson object
    const lesson: DailyLesson = {
      id: lessonId,
      date: dateStr,
      dateObj: lessonDate,
      startUnit: Math.round(startUnit * 10) / 10,
      endUnit: Math.round(endUnit * 10) / 10,
      targetQuantity: Math.round(targetQuantity * 10) / 10,
      actualQuantity: Math.round(actualQuantity * 10) / 10,
      status: isCompleted ? 'completed' : 'pending',
      label: formatLessonLabel(startUnit, endUnit, pace.unit),
    }

    lessons.push(lesson)

    // Track completion status
    if (isCompleted) {
      lastCompletedDate = dateStr
      // Store actual endpoint for next iteration's over-completion check
      previousLessonActual = startUnit + actualQuantity
      
      // RULE 2: Calculate deficit for under-completion
      if (actualQuantity < targetQuantity) {
        carryOverDeficit = targetQuantity - actualQuantity
      } else {
        carryOverDeficit = 0 // Reset deficit if target was met or exceeded
      }
    } else if (!nextPendingDate) {
      nextPendingDate = dateStr
      previousLessonActual = null // Reset for pending lessons
      carryOverDeficit = 0 // Don't carry deficit into future pending lessons
    }

    // Advance to next lesson's starting point (will be adjusted by Rule 1 if needed)
    currentUnit = endUnit

    // Stop if we've distributed all content
    if (currentUnit >= totalUnits) {
      break
    }
  }

  return {
    lessons,
    lastCompletedDate,
    nextPendingDate,
  }
}

/**
 * Format lesson label based on unit type.
 * Examples:
 * - Pages: "Pages 15-16"
 * - Verses: "Verses 500-550"
 * - Juz: "Juz 2"
 */
function formatLessonLabel(startUnit: number, endUnit: number, unit: PaceUnit): string {
  const start = Math.ceil(startUnit)
  const end = Math.ceil(endUnit)

  switch (unit) {
    case 'pages':
      return start === end ? `Page ${start}` : `Pages ${start}–${end}`
    case 'verses':
      return start === end ? `Verse ${start}` : `Verses ${start}–${end}`
    case 'juz':
      return start === end ? `Juz ${start}` : `Juz ${start}–${end}`
    default:
      return `${start}–${end}`
  }
}

/**
 * Helper: Get the last completed lesson from a list
 */
export function getLastCompletedLesson(lessons: DailyLesson[]): DailyLesson | null {
  const completed = lessons.filter(l => l.status === 'completed')
  return completed.length > 0 ? completed[completed.length - 1] : null
}

/**
 * Helper: Get the next pending lesson from a list
 */
export function getNextPendingLesson(lessons: DailyLesson[]): DailyLesson | null {
  return lessons.find(l => l.status === 'pending') || null
}
