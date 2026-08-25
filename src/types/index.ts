// Shared TypeScript interfaces for the teacher portal features
// (Curriculum, Settings, Lesson view, Daily reports, Class analytics)

import type { ClassLevel, LearningTrack } from '@/lib/mockData'

// ---------- Curriculum ----------

// Quran tracks come from the shared class-level LearningTrack; the remaining
// categories are curriculum-library sections (lessons, references, collections)
export type CurriculumTrack =
  | LearningTrack
  | 'tajweed'
  | 'makharij'
  | 'waqf'
  | 'duas'
  | 'hadith'
  | 'custom'
export type Difficulty = ClassLevel

export interface CurriculumItem {
  id: string
  title: string
  description: string
  track: CurriculumTrack
  difficulty: Difficulty
  durationMinutes: number
  contentAr: string
  contentTranslit: string
  contentEn: string
  tajweedRules: string[]
  juzNum: number | null
  pageFrom: number | null
  pageTo: number | null
  surahNum: number | null
  surahName: string | null
  ayahFrom: number | null
  ayahTo: number | null
  qaidaLesson: number | null
  defaultQari: string
}

export interface LessonAssignment {
  id: string
  curriculumId: string
  curriculumTitle: string
  classId: string
  studentIds: string[]
  deadline: string | null // yyyy-MM-dd
  notes: string
  assignedAt: number
}

// ---------- Teacher settings ----------

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export interface TeacherSettingsState {
  institutionName: string
  bio: string
  phone: string
  timezone: string
  avatarUrl: string | null
  verificationStatus: VerificationStatus
  verifiedDate: string | null
  dailyReportTime: string
  reportsEnabled: boolean
  weeklySummaries: boolean
  alertPerformanceDrop: boolean
  alertLowAttendance: boolean
  reminderBeforeSession: boolean
  achievementNotifications: boolean
  language: 'en' | 'ar' | 'ur'
  theme: 'light' | 'dark'
  enabledTracks: CurriculumTrack[]
  leaderboardEnabled: boolean
  leaderboardVisibleToStudents: boolean
  mfaEnabled: boolean
}

export interface AvailabilitySlot {
  id: string
  date: string // yyyy-MM-dd
  start: string // HH:mm
  end: string // HH:mm
  maxStudents: number
  enrolledCount: number
  status: 'open' | 'full' | 'closed'
}

export interface SlotBooking {
  id: string
  slotId: string
  studentId: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
}

export interface SlotGenerationConfig {
  startTime: string // HH:mm
  endTime: string // HH:mm
  slotDuration: number // minutes
  days: number[] // 0=Sun … 6=Sat
}

export interface LoginHistoryEntry {
  id: string
  date: string
  time: string
  ip: string
  device: string
  location: string
}

// ---------- Lesson view / scoring ----------

export interface LessonRubric {
  makhraj: number // /25
  tajweed: number // /25
  fluency: number // /20
  consistency: number // /15
  memory: number // /15
}

export interface LessonRubricScore {
  criteria: LessonRubric
  total: number
  grade: string
  feedback: string
  savedAt: number
}

export const RUBRIC_MAX: LessonRubric = { makhraj: 25, tajweed: 25, fluency: 20, consistency: 15, memory: 15 }

export const RUBRIC_LABELS: Record<keyof LessonRubric, string> = {
  makhraj: 'Makhraj',
  tajweed: 'Tajweed',
  fluency: 'Fluency',
  consistency: 'Consistency',
  memory: 'Memory',
}

// Mistake types for the word-click popup
export type LessonMistakeType = 'makhraj' | 'ghunnah' | 'tafkheem' | 'tajweed_rule' | 'other'

export const LESSON_MISTAKE_TYPE_LABELS: Record<LessonMistakeType, string> = {
  makhraj: 'Makhraj Error',
  ghunnah: 'Ghunnah Error',
  tafkheem: 'Tafkheem Error',
  tajweed_rule: 'Tajweed Rule',
  other: 'Other',
}

export const MAKHRAJ_POINTS = ['Ghar (deep throat)', 'Ayn', 'Ha', 'Kha', 'Qaf', 'Jim', 'Lam', 'Noon']
export const GHUNNAH_TYPES = ['Noon', 'Meem']

// ---------- Daily reports ----------

export type ReportStatus = 'sent' | 'failed' | 'pending'

export interface DailyReport {
  id: string
  studentId: string
  dateFor: string // yyyy-MM-dd
  score: number | null
  grade: string | null
  status: ReportStatus
  sentAt: string | null
  recipient: string
  mistakesCount: number
  teacherMessage: string
  nextLesson: string
}

// ---------- Class analytics ----------

export interface AnalyticsWeekPoint {
  week: string
  score: number
  completion: number
  attendance: number
  prevScore: number
}

export interface GradeBucket {
  grade: string
  students: number
}

export interface CommonError {
  rank: number
  type: string
  frequency: number
  affectedStudents: number
  trend: 'up' | 'down' | 'stable'
}

export interface PerformerRow {
  studentId: string
  name: string
  avgScore: number
  completion: number
  streak: number
  lastActive: string
}

export interface ClassAnalyticsData {
  metrics: {
    avgScore: number
    avgScoreChange: number
    completionRate: number
    completionChange: number
    attendanceRate: number
    attendanceChange: number
    activeStudents: number
    totalStudents: number
  }
  weeks: AnalyticsWeekPoint[]
  distribution: GradeBucket[]
  errors: CommonError[]
  topPerformers: PerformerRow[]
  needsSupport: PerformerRow[]
}

export const ERROR_DRILLDOWN: Record<string, string> = {
  'Makhraj: Ghar clarity': 'Deep-throat letters (Ghar/Ghayn) are not articulated from far enough back.',
  'Ghunnah: Noon': 'The nasal sound on Noon is being dropped or shortened.',
  'Tafkheem / Tarqeeq': 'Heavy and light letters are being swapped, mostly on Lam and Ra.',
  'Madd length': 'Elongations are stretched too short or too long.',
  'Qalqala weakness': 'The echoing bounce on Qalqala letters is missing when stopping.',
}
