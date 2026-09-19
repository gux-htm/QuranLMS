# Lesson Calculator Testing Guide

This document describes how to test the lesson calculation logic and verify all three recalculation rules work correctly.

## 🎯 What We're Testing

The lesson calculator distributes Quran curriculum across days based on:
- Student's current pace (e.g., 1 page/day)
- Units already completed
- Historical lesson progress
- Pace changes from teacher

It implements 3 recalculation rules:
1. **Over-Completion**: Student covers more than target → next lesson starts from actual endpoint
2. **Under-Completion**: Student covers less than target → next lesson absorbs the deficit
3. **Pace Change**: Teacher changes pace → all pending lessons recalculated from last completed

---

## 🧪 Testing Approaches

### Approach 1: Browser Console Tests (Quickest)

1. **Start the dev server** (already running on http://localhost:5174)

2. **Open browser console** (F12)

3. **Import and run tests**:
```javascript
// Import test utilities
import { runAllTests, testScenarios } from '/src/lib/testLessonCalculator.ts'

// Run all automated tests
runAllTests()

// Or run individual scenario tests:
testScenarios.baseDistribution()
testScenarios.overCompletion()
testScenarios.underCompletion()
testScenarios.paceChange()
testScenarios.combined()
testScenarios.nearEnd()
```

Each test will output:
- ✅ Green checkmarks for passing assertions
- ❌ Red X marks for failures
- Detailed output showing expected vs actual values

### Approach 2: Manual UI Testing

1. **Navigate to lesson library**: http://localhost:5174/student/lessons

2. **Test Base Distribution**:
   - Open browser console
   - Check the lesson list renders correctly
   - Verify lessons show sequential dates
   - Verify "Next lesson" card appears

3. **Test Over-Completion (Rule 1)**:
   - Open a pending lesson
   - Enter a quantity > target (e.g., target is 1 page, enter 2)
   - Mark complete
   - Return to library
   - Verify next lesson's start unit adjusted (check console for details)

4. **Test Under-Completion (Rule 2)**:
   - Open a pending lesson
   - Enter a quantity < target (e.g., target is 2 pages, enter 1)
   - Mark complete
   - Return to library
   - Verify next lesson absorbed deficit (target increased)

5. **Test Pace Change (Rule 3)**:
   - Modify `CURRENT_STUDENT.pace.quantity` in `src/lib/mockData.ts`
   - Add `paceChangeDate` parameter when needed
   - Verify pending lessons recalculated
   - Verify completed lessons preserved

### Approach 3: Unit Tests (Most Thorough)

We've created comprehensive unit tests in `src/lib/lessonCalculator.test.ts` that can be run with a test runner like Jest or Vitest.

**To run unit tests** (if test runner is configured):
```bash
npm run test src/lib/lessonCalculator.test.ts
```

The test file includes:
- **Base Distribution**: Tests basic lesson generation
- **Rule 1**: Over-completion scenarios
- **Rule 2**: Under-completion scenarios
- **Rule 3**: Pace change scenarios
- **Edge Cases**: Near completion, zero remaining, etc.
- **Combined Scenarios**: All rules working together

---

## 📋 Test Scenarios Explained

### Test 1: Base Distribution
**Goal**: Verify lessons are created correctly from starting point

**Setup**:
- Student has completed 10 pages
- Total curriculum: 604 pages
- Pace: 1 page/day

**Expected Result**:
- First lesson starts at page 11
- Each lesson covers 1 page
- Lessons are sequential (no gaps)
- Lesson IDs are in format `lesson-YYYY-MM-DD`

### Test 2: Over-Completion (Rule 1)
**Goal**: Verify next lesson adjusts when student covers more than target

**Setup**:
- Lesson 1 target: 1 page (page 11)
- Lesson 1 actual: 2 pages (pages 11-12)
- Pace: 1 page/day

**Expected Result**:
- Lesson 1: pages 11-11, actual 2 (status: completed)
- Lesson 2: starts at page 13 (not 12) ✅
- Lesson 3: continues normally from page 14
- Only immediate next lesson is adjusted

### Test 3: Under-Completion (Rule 2)
**Goal**: Verify next lesson absorbs deficit when student covers less

**Setup**:
- Lesson 1 target: 2 pages
- Lesson 1 actual: 1 page
- Pace: 2 pages/day

**Expected Result**:
- Lesson 1: target 2, actual 1 (deficit: 1 page)
- Lesson 2: target 3 (2 + 1 deficit) ✅
- Lesson 2 starts at page 12 (from actual endpoint)
- Lesson 3: target 2 (normal, if lesson 2 pending)

### Test 4: Pace Change (Rule 3)
**Goal**: Verify pending lessons recalculate when pace changes

**Setup**:
- Completed 2 lessons at old pace (1 page/day)
- Teacher changes pace to 2 pages/day
- Pace change date: 2026-01-22

**Expected Result**:
- Lessons 1-2: preserved (target: 1, actual: 1) ✅
- Lesson 3+: new pace (target: 2) ✅
- Lesson 3 starts from actual endpoint of lesson 2
- All pending lessons use new pace

### Test 5: Combined Scenario
**Goal**: Verify all rules work together

**Setup**:
- Day 1: over-completed (target 1, actual 2)
- Day 2: under-completed (target 1, actual 1, but start adjusted)
- Day 3+: pace changed to 3 pages/day

**Expected Result**:
- Day 1: pages 11-11, actual covers 11-12 ✅
- Day 2: starts at 13 (adjusted), actual 1 page ✅
- Day 3: starts at 14 (actual endpoint), target 3 (new pace) ✅
- Historical lessons preserved, pending recalculated

### Test 6: Near Completion
**Goal**: Verify edge case when few pages remain

**Setup**:
- Completed: 603 pages
- Total: 604 pages
- Remaining: 1 page

**Expected Result**:
- Only 1 lesson created
- Last lesson: page 604
- No over-allocation beyond curriculum end

---

## ✅ Success Criteria

All tests pass if:

1. **Base Distribution**:
   - Lessons are sequential with no gaps
   - Correct date progression
   - Correct lesson ID format

2. **Rule 1 (Over-Completion)**:
   - Next lesson starts from actual endpoint (not planned endpoint)
   - Only immediate next lesson adjusted
   - Subsequent lessons continue from adjusted point

3. **Rule 2 (Under-Completion)**:
   - Deficit calculated correctly (target - actual)
   - Next lesson target increased by deficit
   - Deficit clears when met or at first pending lesson

4. **Rule 3 (Pace Change)**:
   - Completed lessons preserve historical values
   - Pending lessons recalculate from last completed actual endpoint
   - All pending use new pace

5. **Combined Scenarios**:
   - All rules work together without conflicts
   - Complex sequences produce correct outcomes
   - No unexpected side effects

---

## 🐛 Known Issues to Watch For

1. **Lesson ID Format**: Must be `lesson-YYYY-MM-DD`
2. **Date Continuity**: Each lesson should be exactly 1 day after previous
3. **Unit Gaps**: No missing pages between lessons
4. **Over-Allocation**: Never create lessons beyond totalUnits
5. **Deficit Propagation**: Deficit should not carry beyond first pending lesson
6. **Pace Change Date**: Must only affect lessons after the change date

---

## 📊 Manual Verification Checklist

When testing in UI:

- [ ] Lesson library shows all lessons
- [ ] Lessons are grouped by month
- [ ] Status badges are correct (Completed/Next/Pending)
- [ ] "Next lesson" quick action appears
- [ ] Individual lesson page loads correctly
- [ ] Progress tracking works (save/complete)
- [ ] Over-completion adjusts next lesson
- [ ] Under-completion increases next target
- [ ] Pace change recalculates pending lessons
- [ ] Navigation flows correctly
- [ ] No console errors
- [ ] Responsive on mobile

---

## 🚀 Running the Tests

### Quick Start (Browser Console)
```javascript
// In browser console at http://localhost:5174
import { runAllTests } from '/src/lib/testLessonCalculator.ts'
runAllTests()
```

### Individual Test
```javascript
import { testScenarios } from '/src/lib/testLessonCalculator.ts'
testScenarios.overCompletion()
```

### Verify with Real Store Data
```javascript
import { verifyWithStoreData } from '/src/lib/testLessonCalculator.ts'
import { useAppStore } from '/src/lib/store.tsx'

const store = useAppStore.getState()
verifyWithStoreData(store)
```

---

## 📝 Test Results Log

### Run Date: [Add date when testing]

**Test 1: Base Distribution**
- Status: [ ] Pass / [ ] Fail
- Notes: 

**Test 2: Over-Completion**
- Status: [ ] Pass / [ ] Fail
- Notes:

**Test 3: Under-Completion**
- Status: [ ] Pass / [ ] Fail
- Notes:

**Test 4: Pace Change**
- Status: [ ] Pass / [ ] Fail
- Notes:

**Test 5: Combined Scenario**
- Status: [ ] Pass / [ ] Fail
- Notes:

**Test 6: Near Completion**
- Status: [ ] Pass / [ ] Fail
- Notes:

**Overall Result**: [ ] All Pass / [ ] Some Failed

---

## 🎓 Next Steps

After testing:
1. Review any failed tests
2. Fix calculation logic if needed
3. Document any edge cases discovered
4. Update tests for new scenarios
5. Consider adding E2E tests for full user flows
