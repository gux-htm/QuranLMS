import { ReactNode, createContext, useContext, useState } from 'react'
import { addDays, format } from 'date-fns'
import { CLASSES, ENROLL_REQUESTS, STUDENTS, UNIT_TOTALS, today } from '@/lib/mockData'
import type { ClassLevel, ClassRoom, EnrollRequest, LearningTrack, PaceUnit, SessionEndpoint, SessionMistake, SessionScore, StartTrack, Student } from '@/lib/mockData'

function estimateCompletion(unitsRemaining: number, quantity: number): string {
  const daily = Math.max(quantity, 0.1)
  const days = Math.max(1, Math.ceil(unitsRemaining / daily))
  return format(addDays(today, days), 'yyyy-MM-dd')
}

interface NewClassInput {
  name: string
  description: string
  level: ClassLevel
  learningTrack: LearningTrack
}

interface NewEnrollRequestInput {
  name: string
  email: string
  preferredTime: string
  startTrack: StartTrack
  startJuz: number | null
  experience: string
}

export interface AttendanceRecord {
  status: 'present' | 'absent'
  markedAt: number
}

interface AppStoreValue {
  students: Student[]
  classes: ClassRoom[]
  enrollRequests: EnrollRequest[]
  getStudent: (id: string) => Student | undefined
  getClass: (id: string) => ClassRoom | undefined
  getEnrolledStudents: (classId: string) => Student[]
  updateStudentPace: (studentId: string, quantity: number, unit: PaceUnit) => void
  createClass: (data: NewClassInput) => void
  enrollStudent: (studentId: string, classId: string | null) => void
  submitEnrollRequest: (data: NewEnrollRequestInput) => void
  approveEnrollRequest: (requestId: string) => void
  rejectEnrollRequest: (requestId: string) => void
  sessionStarts: Record<string, number>
  startSessionTimer: (sessionId: string) => void
  sessionEnds: Record<string, number>
  endSession: (sessionId: string) => void
  sessionAttendance: Record<string, AttendanceRecord>
  markAttendance: (sessionId: string, status: 'present' | 'absent') => void
  sessionMistakes: Record<string, SessionMistake[]>
  addMistake: (sessionId: string, mistake: Omit<SessionMistake, 'id' | 'markedAt'>) => void
  removeMistake: (sessionId: string, mistakeId: string) => void
  sessionEndpoints: Record<string, SessionEndpoint>
  saveEndpoint: (sessionId: string, endpoint: Omit<SessionEndpoint, 'markedAt'>) => void
  sessionScores: Record<string, SessionScore>
  submitScore: (sessionId: string, score: Omit<SessionScore, 'submittedAt'>) => void
}

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(STUDENTS)
  const [classes, setClasses] = useState<ClassRoom[]>(CLASSES)
  const [enrollRequests, setEnrollRequests] = useState<EnrollRequest[]>(ENROLL_REQUESTS)
  const [sessionStarts, setSessionStarts] = useState<Record<string, number>>({})
  const [sessionEnds, setSessionEnds] = useState<Record<string, number>>({})
  const [sessionAttendance, setSessionAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [sessionMistakes, setSessionMistakes] = useState<Record<string, SessionMistake[]>>({})
  const [sessionEndpoints, setSessionEndpoints] = useState<Record<string, SessionEndpoint>>({})
  const [sessionScores, setSessionScores] = useState<Record<string, SessionScore>>({})

  const getStudent = (id: string) => students.find((s) => s.id === id)
  const getClass = (id: string) => classes.find((c) => c.id === id)
  const getEnrolledStudents = (classId: string) => students.filter((s) => s.classId === classId)

  const updateStudentPace = (studentId: string, quantity: number, unit: PaceUnit) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const totalUnits = UNIT_TOTALS[unit]
        const progress = s.totalUnits > 0 ? s.unitsCompleted / s.totalUnits : 0
        const unitsCompleted = Math.min(Math.round(progress * totalUnits), totalUnits)
        return {
          ...s,
          pace: { quantity, unit },
          totalUnits,
          unitsCompleted,
          estimatedCompletion: estimateCompletion(totalUnits - unitsCompleted, quantity),
        }
      })
    )
  }

  const createClass = (data: NewClassInput) => {
    setClasses((prev) => [
      ...prev,
      {
        id: `class-${Date.now()}`,
        status: 'active' as const,
        leaderboardEnabled: true,
        ...data,
      },
    ])
  }

  const enrollStudent = (studentId: string, classId: string | null) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, classId } : s)))
  }

  const submitEnrollRequest = (data: NewEnrollRequestInput) => {
    setEnrollRequests((prev) => [
      {
        id: `req-${Date.now()}`,
        submittedAt: format(today, 'yyyy-MM-dd'),
        status: 'pending' as const,
        ...data,
      },
      ...prev,
    ])
  }

  const approveEnrollRequest = (requestId: string) => {
    const request = enrollRequests.find((r) => r.id === requestId)
    if (!request || request.status !== 'pending') return

    setEnrollRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' as const } : r)))

    // Approved students join as active students, starting where they asked to
    const pagesPerJuz = Math.round(UNIT_TOTALS.pages / 30)
    const unitsCompleted =
      request.startTrack === 'juz' && request.startJuz ? (request.startJuz - 1) * pagesPerJuz : 0
    setStudents((prev) => [
      ...prev,
      {
        id: `student-${Date.now()}`,
        name: request.name,
        email: request.email,
        classId: null,
        pace: { quantity: 1, unit: 'pages' as const },
        unitsCompleted,
        totalUnits: UNIT_TOTALS.pages,
        startDate: format(today, 'yyyy-MM-dd'),
        estimatedCompletion: estimateCompletion(UNIT_TOTALS.pages - unitsCompleted, 1),
        status: 'active' as const,
        streak: 0,
        points: 0,
        avgScore: 0,
        rank: 0,
      },
    ])
  }

  const rejectEnrollRequest = (requestId: string) => {
    setEnrollRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const } : r)))
  }

  // Starts the class timer on first join; keeps counting even if the teacher navigates away
  const startSessionTimer = (sessionId: string) => {
    setSessionStarts((prev) => (prev[sessionId] ? prev : { ...prev, [sessionId]: Date.now() }))
  }

  // Freezes the timer and marks the session as finished
  const endSession = (sessionId: string) => {
    setSessionEnds((prev) => (prev[sessionId] ? prev : { ...prev, [sessionId]: Date.now() }))
  }

  const markAttendance = (sessionId: string, status: 'present' | 'absent') => {
    setSessionAttendance((prev) => ({ ...prev, [sessionId]: { status, markedAt: Date.now() } }))
  }

  // PRD 7.1: word-level mistakes marked during class are stored per session and feed the report
  const addMistake = (sessionId: string, mistake: Omit<SessionMistake, 'id' | 'markedAt'>) => {
    setSessionMistakes((prev) => {
      const list = prev[sessionId] ?? []
      // Re-marking the same word replaces the previous note
      const filtered = list.filter((m) => !(m.verseKey === mistake.verseKey && m.wordPosition === mistake.wordPosition))
      return { ...prev, [sessionId]: [...filtered, { ...mistake, id: `mst-${Date.now()}`, markedAt: Date.now() }] }
    })
  }

  const removeMistake = (sessionId: string, mistakeId: string) => {
    setSessionMistakes((prev) => {
      const list = prev[sessionId] ?? []
      return { ...prev, [sessionId]: list.filter((m) => m.id !== mistakeId) }
    })
  }

  // Saves where today's lesson ended — the next session starts from this point
  const saveEndpoint = (sessionId: string, endpoint: Omit<SessionEndpoint, 'markedAt'>) => {
    setSessionEndpoints((prev) => ({ ...prev, [sessionId]: { ...endpoint, markedAt: Date.now() } }))
  }

  // PRD 6.2: submits the rubric score for this session (overwrites on re-submit)
  const submitScore = (sessionId: string, score: Omit<SessionScore, 'submittedAt'>) => {
    setSessionScores((prev) => ({ ...prev, [sessionId]: { ...score, submittedAt: Date.now() } }))
  }

  return (
    <AppStoreContext.Provider
      value={{
        students,
        classes,
        enrollRequests,
        getStudent,
        getClass,
        getEnrolledStudents,
        updateStudentPace,
        createClass,
        enrollStudent,
        submitEnrollRequest,
        approveEnrollRequest,
        rejectEnrollRequest,
        sessionStarts,
        startSessionTimer,
        sessionEnds,
        endSession,
        sessionAttendance,
        markAttendance,
        sessionMistakes,
        addMistake,
        removeMistake,
        sessionEndpoints,
        saveEndpoint,
        sessionScores,
        submitScore,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  )
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
