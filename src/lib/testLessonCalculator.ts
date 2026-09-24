/**
 * Manual testing utilities for lesson calculator
 * Run these in browser console to verify calculation logic
 */

import { calculateLessonLibrary } from './lessonCalculator'

// Test scenarios
export const testScenarios = {
  // Base case: fresh student with no progress
  baseDistribution: () => {
    console.log('\n📋 Test 1: Base Distribution')
    const result = calculateLessonLibrary({
      studentId: 'student-1',
      currentDate: new Date(),
      pace: { quantity: 1, unit: 'pages' },
      unitsCompleted: 10,
      totalUnits: 604,
      completedLessons: {},
    })
    
    console.log(`Created ${result.lessons.length} lessons`)
    console.log('First 3 lessons:')
    result.lessons.slice(0, 3).forEach(lesson => {
      console.log(`  ${lesson.id}: pages ${lesson.startUnit}-${lesson.endUnit}, target=${lesson.targetQuantity}`)
    })
    
    const allSequential = result.lessons.every((lesson, i) => {
      if (i === 0) return true
      return lesson.startUnit === result.lessons[i-1].endUnit + 1
    })
    console.log(allSequential ? '✅ All lessons sequential' : '❌ Lessons not sequential')
    return result
  },

  // Rule 1: Student completes more than expected
  overCompletion: () => {
    console.log('\n📋 Test 2: Over-Completion (Rule 1)')
    const result = calculateLessonLibrary({
      studentId: 'student-1',
      currentDate: new Date(),
      pace: { quantity: 1, unit: 'pages' },
      unitsCompleted: 10,
      totalUnits: 604,
      completedLessons: {
        'lesson-2026-01-20': 2, // Target was 1, actual is 2
      },
    })
    
    console.log('Lesson 1 (completed):')
    console.log(`  Target: ${result.lessons[0].targetQuantity}, Actual: ${result.lessons[0].actualQuantity}`)
    console.log(`  Range: pages ${result.lessons[0].startUnit}-${result.lessons[0].endUnit}`)
    
    console.log('Lesson 2 (next):')
    console.log(`  Should start at page 13 (11 + 2 actual from lesson 1)`)
    console.log(`  Actual start: page ${result.lessons[1].startUnit}`)
    
    const correct = result.lessons[1].startUnit === 13
    console.log(correct ? '✅ Next lesson adjusted correctly' : '❌ Next lesson not adjusted')
    return result
  },

  // Rule 2: Student completes less than expected
  underCompletion: () => {
    console.log('\n📋 Test 3: Under-Completion (Rule 2)')
    const result = calculateLessonLibrary({
      studentId: 'student-1',
      currentDate: new Date(),
      pace: { quantity: 2, unit: 'pages' },
      unitsCompleted: 10,
      totalUnits: 604,
      completedLessons: {
        'lesson-2026-01-20': 1, // Target was 2, actual is 1
      },
    })
    
    console.log('Lesson 1 (completed):')
    console.log(`  Target: ${result.lessons[0].targetQuantity}, Actual: ${result.lessons[0].actualQuantity}`)
    console.log(`  Deficit: ${result.lessons[0].targetQuantity - result.lessons[0].actualQuantity}`)
    
    console.log('Lesson 2 (next):')
    console.log(`  Should have target of 3 (2 normal + 1 deficit)`)
    console.log(`  Actual target: ${result.lessons[1].targetQuantity}`)
    
    const correct = result.lessons[1].targetQuantity === 3
    console.log(correct ? '✅ Deficit absorbed correctly' : '❌ Deficit not absorbed')
    return result
  },

  // Rule 3: Teacher changes pace
  paceChange: () => {
    console.log('\n📋 Test 4: Pace Change (Rule 3)')
    const result = calculateLessonLibrary({
      studentId: 'student-1',
      currentDate: new Date(),
      pace: { quantity: 2, unit: 'pages' }, // New pace: 2 pages
      unitsCompleted: 10,
      totalUnits: 604,
      completedLessons: {
        'lesson-2026-01-20': 1, // Completed at old pace (1 page)
        'lesson-2026-01-21': 1, // Completed at old pace (1 page)
      },
      paceChangeDate: new Date().toISOString(),
    })
    
    console.log('Completed lessons (preserved):')
    result.lessons.slice(0, 2).forEach((lesson, i) => {
      console.log(`  Lesson ${i+1}: target=${lesson.targetQuantity}, actual=${lesson.actualQuantity}`)
    })
    
    console.log('Pending lessons (recalculated):')
    result.lessons.slice(2, 4).forEach((lesson, i) => {
      console.log(`  Lesson ${i+3}: target=${lesson.targetQuantity}, pages ${lesson.startUnit}-${lesson.endUnit}`)
    })
    
    const correct = result.lessons[2].targetQuantity === 2 && result.lessons[3].targetQuantity === 2
    console.log(correct ? '✅ Pending lessons recalculated with new pace' : '❌ Pace change not applied')
    return result
  },

  // Complex scenario: all rules combined
  combined: () => {
    console.log('\n📋 Test 5: Combined Scenario')
    const result = calculateLessonLibrary({
      studentId: 'student-1',
      currentDate: new Date(),
      pace: { quantity: 3, unit: 'pages' }, // New pace
      unitsCompleted: 10,
      totalUnits: 604,
      completedLessons: {
        'lesson-2026-01-20': 2, // Over-completed at old pace (target was 1)
        'lesson-2026-01-21': 1, // Under-completed at old pace (target was 1)
      },
      paceChangeDate: new Date().toISOString(),
    })
    
    console.log('Day 1 (over): pages 11-11, actual 11-12')
    console.log(`  Actual: pages ${result.lessons[0].startUnit}-${result.lessons[0].startUnit + result.lessons[0].actualQuantity - 1}`)
    
    console.log('Day 2 (under, adjusted start): pages 13-13, actual 13')
    console.log(`  Actual: start=${result.lessons[1].startUnit}, actual=${result.lessons[1].actualQuantity}`)
    
    console.log('Day 3 (new pace, from actual endpoint): pages 14-16 (3 pages)')
    console.log(`  Actual: pages ${result.lessons[2].startUnit}-${result.lessons[2].endUnit}, target=${result.lessons[2].targetQuantity}`)
    
    const correct = result.lessons[2].startUnit === 14 && result.lessons[2].targetQuantity === 3
    console.log(correct ? '✅ Complex scenario handled correctly' : '❌ Complex scenario failed')
    return result
  },

  // Edge case: near completion
  nearEnd: () => {
    console.log('\n📋 Test 6: Near Completion')
    const result = calculateLessonLibrary({
      studentId: 'student-1',
      currentDate: new Date(),
      pace: { quantity: 1, unit: 'pages' },
      unitsCompleted: 603,
      totalUnits: 604,
      completedLessons: {},
    })
    
    console.log(`Remaining pages: ${604 - 603}`)
    console.log(`Lessons created: ${result.lessons.length}`)
    console.log(`Last lesson: pages ${result.lessons[0].startUnit}-${result.lessons[0].endUnit}`)
    
    const correct = result.lessons.length === 1 && result.lessons[0].startUnit === 604
    console.log(correct ? '✅ Near-end handled correctly' : '❌ Near-end failed')
    return result
  },
}

// Run all tests
export function runAllTests() {
  console.log('🧪 Running Lesson Calculator Tests...')
  console.log('=' . repeat(50))
  
  Object.entries(testScenarios).forEach(([name, test]) => {
    try {
      test()
    } catch (error) {
      console.error(`❌ ${name} failed:`, error)
    }
  })
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ All tests completed!')
  console.log('\nTo run individual tests:')
  console.log('  import { testScenarios } from "./lib/testLessonCalculator"')
  console.log('  testScenarios.baseDistribution()')
}

// Quick verification with actual store data
export function verifyWithStoreData(store: any) {
  console.log('\n📊 Verifying with actual store data...')
  
  const student = store.students.find((s: any) => s.id === store.currentStudentId)
  if (!student) {
    console.error('❌ No current student found')
    return
  }
  
  console.log('Student:', student.name)
  console.log('Pace:', student.pace.quantity, student.pace.unit + 's per day')
  console.log('Progress:', student.unitsCompleted, '/', student.totalUnits)
  
  const result = calculateLessonLibrary({
    studentId: student.id,
    currentDate: new Date(),
    pace: student.pace,
    unitsCompleted: student.unitsCompleted,
    totalUnits: student.totalUnits,
    completedLessons: store.lessonProgress,
  })
  
  console.log('\nCalculated lessons:', result.lessons.length)
  console.log('Next pending:', result.nextPendingDate)
  console.log('Last completed:', result.lastCompletedDate || 'none')
  
  console.log('\nFirst 5 lessons:')
  result.lessons.slice(0, 5).forEach(lesson => {
    console.log(`  ${lesson.date}: ${lesson.label}, status=${lesson.status}`)
  })
  
  return result
}
