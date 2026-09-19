// Quick test to verify lesson calculator
import { calculateLessonLibrary } from './src/lib/lessonCalculator.ts'
import { format } from 'date-fns'

const today = new Date()

const result = calculateLessonLibrary({
  studentId: 'student-1',
  currentDate: today,
  pace: { quantity: 1, unit: 'pages' },
  unitsCompleted: 15,
  totalUnits: 604,
  completedLessons: {},
})

console.log('Today:', format(today, 'yyyy-MM-dd'))
console.log('First lesson:', result.lessons[0])
console.log('Total lessons:', result.lessons.length)
