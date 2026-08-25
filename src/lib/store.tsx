import { ReactNode, createContext, useContext, useState } from 'react'
import { addDays, format } from 'date-fns'
import { CLASSES, ENROLL_REQUESTS, STUDENTS, UNIT_TOTALS, today } from '@/lib/mockData'
import type { ClassLevel, ClassRoom, EnrollRequest, LearningTrack, PaceUnit, SessionEndpoint, SessionMistake, SessionScore, StartTrack, Student } from '@/lib/mockData'
import { TEACHER } from '@/lib/mockData'
import type {
  AvailabilitySlot,
  CurriculumTrack,
  LessonAssignment,
  LessonRubricScore,
  SlotBooking,
  SlotGenerationConfig,
  TeacherSettingsState,
} from '@/types'

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
  status: 'present' | 'absent' | 'late'
  markedAt: number
}

export const DEFAULT_TEACHER_SETTINGS: TeacherSettingsState = {
  institutionName: TEACHER.institution,
  bio: TEACHER.bio,
  phone: '+92 300 1234567',
  timezone: TEACHER.timezone,
  avatarUrl: null,
  verificationStatus: 'verified',
  verifiedDate: '2025-01-12',
  dailyReportTime: '18:00',
  reportsEnabled: true,
  weeklySummaries: true,
  alertPerformanceDrop: true,
  alertLowAttendance: false,
  reminderBeforeSession: true,
  achievementNotifications: true,
  language: 'en',
  theme: 'light',
  enabledTracks: ['juz_based', 'qaida', 'surah_based', 'tajweed', 'makharij', 'waqf', 'duas', 'hadith'],
  leaderboardEnabled: true,
  leaderboardVisibleToStudents: true,
  mfaEnabled: false,
}

const TIMEZONES = [
  'UTC',
  'Asia/Karachi',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
  'America/Toronto',
  'Australia/Sydney',
]
export { TIMEZONES }

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
  markAttendance: (sessionId: string, status: 'present' | 'absent' | 'late') => void
  sessionMistakes: Record<string, SessionMistake[]>
  addMistake: (sessionId: string, mistake: Omit<SessionMistake, 'id' | 'markedAt'>) => void
  removeMistake: (sessionId: string, mistakeId: string) => void
  sessionEndpoints: Record<string, SessionEndpoint>
  saveEndpoint: (sessionId: string, endpoint: Omit<SessionEndpoint, 'markedAt'>) => void
  sessionScores: Record<string, SessionScore>
  submitScore: (sessionId: string, score: Omit<SessionScore, 'submittedAt'>) => void
  // Curriculum assignments
  lessonAssignments: LessonAssignment[]
  assignCurriculum: (data: Omit<LessonAssignment, 'id' | 'assignedAt'>) => void
  // Teacher settings
  teacherSettings: TeacherSettingsState
  updateTeacherSettings: (patch: Partial<TeacherSettingsState>) => void
  // Availability slots & bookings
  availabilitySlots: AvailabilitySlot[]
  generateSlots: (config: SlotGenerationConfig) => number
  updateSlot: (slotId: string, patch: Partial<AvailabilitySlot>) => void
  setAllSlotsStatus: (status: 'open' | 'closed') => void
  slotBookings: SlotBooking[]
  updateBookingStatus: (bookingId: string, status: SlotBooking['status']) => void
  // Integrated lesson view rubric (5 criteria)
  sessionRubrics: Record<string, LessonRubricScore>
  saveRubric: (sessionId: string, score: Omit<LessonRubricScore, 'savedAt'>) => void
  // Daily report resend overrides (reportId -> resent timestamp)
  reportResends: Record<string, number>
  markReportResent: (reportId: string) => void
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
  const [lessonAssignments, setLessonAssignments] = useState<LessonAssignment[]>([])
  const [teacherSettings, setTeacherSettings] = useState<TeacherSettingsState>(DEFAULT_TEACHER_SETTINGS)
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [slotBookings, setSlotBookings] = useState<SlotBooking[]>([])
  const [sessionRubrics, setSessionRubrics] = useState<Record<string, LessonRubricScore>>({})
  const [reportResends, setReportResends] = useState<Record<string, number>>({})

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

  const markAttendance = (sessionId: string, status: 'present' | 'absent' | 'late') => {
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

  // ---------- Curriculum assignment flow ----------
  const assignCurriculum = (data: Omit<LessonAssignment, 'id' | 'assignedAt'>) => {
    setLessonAssignments((prev) => [
      { ...data, id: `assign-${Date.now()}`, assignedAt: Date.now() },
      ...prev,
    ])
  }

  // ---------- Teacher settings ----------
  const updateTeacherSettings = (patch: Partial<TeacherSettingsState>) => {
    setTeacherSettings((prev) => ({ ...prev, ...patch }))
  }

  // ---------- Availability slots ----------
  // Generates 30-min slots for the next 7 days matching the chosen weekdays,
  // then seeds a few student bookings so the enrolled view has content
  const generateSlots = (config: SlotGenerationConfig): number => {
    const slots: AvailabilitySlot[] = []
    const [sh, sm] = config.startTime.split(':').map(Number)
    const [eh, em] = config.endTime.split(':').map(Number)
    const startMin = (sh || 0) * 60 + (sm || 0)
    const endMin = (eh || 0) * 60 + (em || 0)

    for (let d = 1; d <= 7; d++) {
      const date = addDays(today, d)
      if (!config.days.includes(date.getDay())) continue
      for (let m = startMin; m + config.slotDuration <= endMin; m += config.slotDuration) {
        const fmt = (mins: number) =>
          `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
        slots.push({
          id: `slot-${format(date, 'yyyyMMdd')}-${m}`,
          date: format(date, 'yyyy-MM-dd'),
          start: fmt(m),
          end: fmt(m + config.slotDuration),
          maxStudents: 3,
          enrolledCount: 0,
          status: 'open',
        })
      }
    }

    // Seed bookings from active enrolled students into the first slots
    const bookings: SlotBooking[] = []
    const active = students.filter((s) => s.status === 'active')
    active.slice(0, Math.min(4, slots.length)).forEach((student, i) => {
      const slot = slots[i]
      if (!slot) return
      slot.enrolledCount += 1
      bookings.push({
        id: `booking-${slot.id}-${student.id}`,
        slotId: slot.id,
        studentId: student.id,
        status: i % 2 === 0 ? 'pending' : 'approved',
      })
    })
    slots.forEach((s) => {
      if (s.enrolledCount >= s.maxStudents) s.status = 'full'
    })

    setAvailabilitySlots(slots)
    setSlotBookings(bookings)
    return slots.length
  }

  const updateSlot = (slotId: string, patch: Partial<AvailabilitySlot>) => {
    setAvailabilitySlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s)))
  }

  const setAllSlotsStatus = (status: 'open' | 'closed') => {
    setAvailabilitySlots((prev) => prev.map((s) => ({ ...s, status: status === 'open' && s.enrolledCount >= s.maxStudents ? 'full' : status })))
  }

  const updateBookingStatus = (bookingId: string, status: SlotBooking['status']) => {
    setSlotBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
  }

  // ---------- Integrated lesson view rubric ----------
  const saveRubric = (sessionId: string, score: Omit<LessonRubricScore, 'savedAt'>) => {
    setSessionRubrics((prev) => ({ ...prev, [sessionId]: { ...score, savedAt: Date.now() } }))
  }

  // ---------- Daily report resends ----------
  const markReportResent = (reportId: string) => {
    setReportResends((prev) => ({ ...prev, [reportId]: Date.now() }))
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
        lessonAssignments,
        assignCurriculum,
        teacherSettings,
        updateTeacherSettings,
        availabilitySlots,
        generateSlots,
        updateSlot,
        setAllSlotsStatus,
        slotBookings,
        updateBookingStatus,
        sessionRubrics,
        saveRubric,
        reportResends,
        markReportResent,
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
