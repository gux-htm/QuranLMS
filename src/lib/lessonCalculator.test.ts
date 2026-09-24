import { calculateLessonLibrary } from './lessonCalculator'
import { format, addDays, parseISO } from 'date-fns'

// Test data
const baseInput = {
  studentId: 'student-1',
  currentDate: new Date(),
  pace: { quantity: 1, unit: 'pages' as const },
  unitsCompleted: 10,
  totalUnits: 604, // Full Quran pages
  completedLessons: {},
}

describe('Lesson Calculator', () => {
  describe('Base Distribution', () => {
    it('should distribute remaining content into daily lessons based on pace', () => {
      const result = calculateLessonLibrary(baseInput)
      
      // Should create lessons for remaining 594 pages (604 - 10)
      expect(result.lessons.length).toBeGreaterThan(0)
      
      // First lesson should start from page 11
      const firstLesson = result.lessons[0]
      expect(firstLesson.startUnit).toBe(11)
      expect(firstLesson.endUnit).toBe(11) // 1 page
      expect(firstLesson.targetQuantity).toBe(1)
      expect(firstLesson.status).toBe('pending')
      
      // Second lesson should start where first ended
      const secondLesson = result.lessons[1]
      expect(secondLesson.startUnit).toBe(12)
      expect(secondLesson.endUnit).toBe(12)
    })

    it('should generate lesson IDs in YYYY-MM-DD format', () => {
      const result = calculateLessonLibrary(baseInput)
      
      const firstLesson = result.lessons[0]
      expect(firstLesson.id).toMatch(/^lesson-\d{4}-\d{2}-\d{2}$/)
      expect(firstLesson.id).toBe('lesson-2026-01-20')
    })

    it('should create lessons starting from current date', () => {
      const result = calculateLessonLibrary(baseInput)
      
      expect(result.lessons[0].date).toBe('2026-01-20')
      expect(result.lessons[1].date).toBe('2026-01-21')
      expect(result.lessons[2].date).toBe('2026-01-22')
    })
  })

  describe('Rule 1: Over-Completion (Next Lesson Adjustment)', () => {
    it('should adjust only next lesson when student covers more than target', () => {
      // Student completes 2 pages instead of 1
      const input = {
        ...baseInput,
        completedLessons: {
          'lesson-2026-01-20': 2, // Target was 1, actual is 2
        },
      }
      
      const result = calculateLessonLibrary(input)
      
      // First lesson (completed)
      const firstLesson = result.lessons[0]
      expect(firstLesson.status).toBe('completed')
      expect(firstLesson.actualQuantity).toBe(2)
      expect(firstLesson.targetQuantity).toBe(1)
      expect(firstLesson.startUnit).toBe(11)
      expect(firstLesson.endUnit).toBe(11)
      
      // Second lesson should start from where first actually ended (page 13, not 12)
      const secondLesson = result.lessons[1]
      expect(secondLesson.startUnit).toBe(13) // 11 + 2 = 13
      expect(secondLesson.endUnit).toBe(13)
      expect(secondLesson.targetQuantity).toBe(1)
      expect(secondLesson.status).toBe('pending')
      
      // Third lesson should continue normally from second lesson's endpoint
      const thirdLesson = result.lessons[2]
      expect(thirdLesson.startUnit).toBe(14)
      expect(thirdLesson.endUnit).toBe(14)
    })

    it('should chain over-completions correctly', () => {
      // Multiple consecutive over-completions
      const input = {
        ...baseInput,
        completedLessons: {
          'lesson-2026-01-20': 2, // +1 extra
          'lesson-2026-01-21': 2, // +1 extra
        },
      }
      
      const result = calculateLessonLibrary(input)
      
      // First: 11-11, actual 11-12
      expect(result.lessons[0].startUnit).toBe(11)
      expect(result.lessons[0].actualQuantity).toBe(2)
      
      // Second: starts at 13 (adjusted), actual 13-14
      expect(result.lessons[1].startUnit).toBe(13)
      expect(result.lessons[1].actualQuantity).toBe(2)
      
      // Third: starts at 15 (adjusted from 14)
      expect(result.lessons[2].startUnit).toBe(15)
    })
  })

  describe('Rule 2: Under-Completion (Next Lesson Absorbs Deficit)', () => {
    it('should add deficit to next lesson target when student covers less', () => {
      // Student completes 0.5 pages instead of 1
      const input = {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const },
        completedLessons: {
          'lesson-2026-01-20': 1, // Target was 2, actual is 1
        },
      }
      
      const result = calculateLessonLibrary(input)
      
      // First lesson (completed with deficit)
      const firstLesson = result.lessons[0]
      expect(firstLesson.status).toBe('completed')
      expect(firstLesson.targetQuantity).toBe(2)
      expect(firstLesson.actualQuantity).toBe(1)
      
      // Second lesson should absorb the 1-page deficit
      const secondLesson = result.lessons[1]
      expect(secondLesson.targetQuantity).toBe(3) // 2 + 1 deficit
      expect(secondLesson.startUnit).toBe(12) // Continues from actual endpoint
      expect(secondLesson.endUnit).toBe(14) // 3 pages: 12, 13, 14
      
      // Third lesson should be normal if second is not completed
      const thirdLesson = result.lessons[2]
      expect(thirdLesson.targetQuantity).toBe(2)
    })

    it('should clear deficit when student meets or exceeds adjusted target', () => {
      const input = {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const },
        completedLessons: {
          'lesson-2026-01-20': 1, // Deficit of 1
          'lesson-2026-01-21': 3, // Meets adjusted target of 3
        },
      }
      
      const result = calculateLessonLibrary(input)
      
      // Second lesson met its adjusted target
      expect(result.lessons[1].targetQuantity).toBe(3)
      expect(result.lessons[1].actualQuantity).toBe(3)
      
      // Third lesson should be normal (no carry-over)
      expect(result.lessons[2].targetQuantity).toBe(2)
    })

    it('should not propagate deficit to lessons after pending', () => {
      const input = {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const },
        completedLessons: {
          'lesson-2026-01-20': 1, // Deficit of 1
          // 2026-01-21 is pending (absorbs deficit)
        },
      }
      
      const result = calculateLessonLibrary(input)
      
      // Second lesson absorbs deficit
      expect(result.lessons[1].targetQuantity).toBe(3)
      
      // All subsequent lessons are normal
      expect(result.lessons[2].targetQuantity).toBe(2)
      expect(result.lessons[3].targetQuantity).toBe(2)
    })
  })

  describe('Rule 3: Pace Change (Recalculate from Last Completed)', () => {
    it('should recalculate pending lessons when pace changes', () => {
      const input = {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const }, // Changed from 1 to 2
        completedLessons: {
          'lesson-2026-01-20': 1, // Completed at old pace
          'lesson-2026-01-21': 1, // Completed at old pace
        },
        paceChangeDate: new Date().toISOString(),
      }
      
      const result = calculateLessonLibrary(input)
      
      // Completed lessons preserve historical values
      expect(result.lessons[0].targetQuantity).toBe(1)
      expect(result.lessons[0].actualQuantity).toBe(1)
      expect(result.lessons[1].targetQuantity).toBe(1)
      expect(result.lessons[1].actualQuantity).toBe(1)
      
      // Pending lessons use new pace (2 pages)
      expect(result.lessons[2].targetQuantity).toBe(2)
      expect(result.lessons[2].startUnit).toBe(13) // Continues from last completed
      expect(result.lessons[2].endUnit).toBe(14)
      
      expect(result.lessons[3].targetQuantity).toBe(2)
      expect(result.lessons[3].startUnit).toBe(15)
      expect(result.lessons[3].endUnit).toBe(16)
    })

    it('should recalculate from actual endpoint of last completed lesson', () => {
      const input = {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const },
        completedLessons: {
          'lesson-2026-01-20': 3, // Over-completed: actual endpoint is page 13
        },
        paceChangeDate: new Date().toISOString(),
      }
      
      const result = calculateLessonLibrary(input)
      
      // First lesson completed with over-completion
      expect(result.lessons[0].actualQuantity).toBe(3)
      
      // Next pending lesson starts from actual endpoint (page 14)
      expect(result.lessons[1].startUnit).toBe(14)
      expect(result.lessons[1].targetQuantity).toBe(2) // New pace
    })

    it('should handle pace change with no completed lessons', () => {
      const input = {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const },
        completedLessons: {},
        paceChangeDate: new Date().toISOString(),
      }
      
      const result = calculateLessonLibrary(input)
      
      // All lessons use new pace from the start
      expect(result.lessons[0].targetQuantity).toBe(2)
      expect(result.lessons[1].targetQuantity).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle completion at curriculum end', () => {
      const input = {
        ...baseInput,
        unitsCompleted: 603,
        totalUnits: 604,
        pace: { quantity: 1, unit: 'pages' as const },
      }
      
      const result = calculateLessonLibrary(input)
      
      // Should create only 1 lesson for the last page
      expect(result.lessons.length).toBe(1)
      expect(result.lessons[0].startUnit).toBe(604)
      expect(result.lessons[0].endUnit).toBe(604)
    })

    it('should handle zero remaining units', () => {
      const input = {
        ...baseInput,
        unitsCompleted: 604,
        totalUnits: 604,
      }
      
      const result = calculateLessonLibrary(input)
      
      // Should create no lessons
      expect(result.lessons.length).toBe(0)
    })

    it('should track last completed and next pending dates', () => {
      const input = {
        ...baseInput,
        completedLessons: {
          'lesson-2026-01-20': 1,
          'lesson-2026-01-21': 1,
        },
      }
      
      const result = calculateLessonLibrary(input)
      
      expect(result.lastCompletedDate).toBe('2026-01-21')
      expect(result.nextPendingDate).toBe('2026-01-22')
    })

    it('should handle varying pace units (lines, pages, juz)', () => {
      const inputLines = {
        ...baseInput,
        pace: { quantity: 5, unit: 'verses' as const },
      }
      
      const result = calculateLessonLibrary(inputLines)
      
      expect(result.lessons[0].targetQuantity).toBe(5)
      expect(result.lessons[0].startUnit).toBe(11)
      expect(result.lessons[0].endUnit).toBe(15)
    })
  })

  describe('Combined Scenarios', () => {
    it('should handle over-completion + under-completion sequence', () => {
      const input = {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const },
        completedLessons: {
          'lesson-2026-01-20': 3, // Over: +1
          'lesson-2026-01-21': 1, // Under: -1 (starts at 14, target 2, actual 1)
        },
      }
      
      const result = calculateLessonLibrary(input)
      
      // First: over-completion adjusts second start
      expect(result.lessons[0].actualQuantity).toBe(3)
      expect(result.lessons[1].startUnit).toBe(14)
      
      // Second: under-completion creates deficit
      expect(result.lessons[1].actualQuantity).toBe(1)
      
      // Third: absorbs deficit
      expect(result.lessons[2].targetQuantity).toBe(3) // 2 + 1 deficit
      expect(result.lessons[2].startUnit).toBe(15)
    })

    it('should handle pace change after mixed completion', () => {
      const input = {
        ...baseInput,
        pace: { quantity: 3, unit: 'pages' as const },
        completedLessons: {
          'lesson-2026-01-20': 2, // Over at old pace (1)
          'lesson-2026-01-21': 1, // Under at old pace (1)
        },
        paceChangeDate: new Date().toISOString(),
      }
      
      const result = calculateLessonLibrary(input)
      
      // Historical lessons preserved
      expect(result.lessons[0].targetQuantity).toBe(1)
      expect(result.lessons[0].actualQuantity).toBe(2)
      
      // Pending lessons use new pace from actual endpoint
      expect(result.lessons[2].targetQuantity).toBe(3)
      expect(result.lessons[2].startUnit).toBe(14) // 11 + 2 + 1
    })
  })
})

// Manual test runner for browser console
export function runManualTests() {
  console.log('🧪 Testing Lesson Calculator...\n')
  
  const tests = [
    {
      name: 'Base Distribution',
      input: baseInput,
      verify: (result: any) => {
        console.log(`✓ Created ${result.lessons.length} lessons`)
        console.log(`✓ First lesson: ${result.lessons[0].id}, pages ${result.lessons[0].startUnit}-${result.lessons[0].endUnit}`)
      }
    },
    {
      name: 'Rule 1: Over-Completion',
      input: {
        ...baseInput,
        completedLessons: { 'lesson-2026-01-20': 2 },
      },
      verify: (result: any) => {
        const adjusted = result.lessons[1].startUnit === 13
        console.log(`${adjusted ? '✓' : '✗'} Next lesson adjusted to start at page ${result.lessons[1].startUnit}`)
      }
    },
    {
      name: 'Rule 2: Under-Completion',
      input: {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const },
        completedLessons: { 'lesson-2026-01-20': 1 },
      },
      verify: (result: any) => {
        const deficit = result.lessons[1].targetQuantity === 3
        console.log(`${deficit ? '✓' : '✗'} Next lesson absorbed deficit: target=${result.lessons[1].targetQuantity}`)
      }
    },
    {
      name: 'Rule 3: Pace Change',
      input: {
        ...baseInput,
        pace: { quantity: 2, unit: 'pages' as const },
        completedLessons: { 'lesson-2026-01-20': 1 },
        paceChangeDate: new Date().toISOString(),
      },
      verify: (result: any) => {
        const recalculated = result.lessons[1].targetQuantity === 2
        console.log(`${recalculated ? '✓' : '✗'} Pending lessons recalculated with new pace: ${result.lessons[1].targetQuantity}`)
      }
    },
  ]
  
  tests.forEach(test => {
    console.log(`\n📋 ${test.name}`)
    const result = calculateLessonLibrary(test.input)
    test.verify(result)
  })
  
  console.log('\n✅ All manual tests completed!')
  return true
}
