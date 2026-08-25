import { addDays, subDays, format } from 'date-fns'

export const TEACHER = {
  id: 'teacher-1',
  name: 'Ustaz Ahmed Rahman',
  email: 'ahmed.rahman@example.com',
  institution: 'Al-Noor Quranic Academy',
  specialization: 'Tajweed Expert',
  timezone: 'Asia/Karachi',
  bio: 'Tajweed specialist with 12 years of teaching experience. Certified by Al-Azhar University.',
  avatarInitials: 'AR',
}

export type PaceUnit = 'pages' | 'verses' | 'juz'
export type ClassLevel = 'beginner' | 'intermediate' | 'advanced'
export type LearningTrack = 'juz_based' | 'qaida' | 'surah_based'

export interface ClassRoom {
  id: string
  name: string
  description: string
  level: ClassLevel
  learningTrack: LearningTrack
  status: 'active' | 'archived'
  leaderboardEnabled: boolean
}

export interface Student {
  id: string
  name: string
  email: string
  classId: string | null
  pace: { quantity: number; unit: PaceUnit }
  unitsCompleted: number
  totalUnits: number
  startDate: string
  estimatedCompletion: string
  status: 'active' | 'paused'
  streak: number
  points: number
  avgScore: number
  rank: number
}

export const UNIT_TOTALS: Record<PaceUnit, number> = { pages: 604, verses: 6236, juz: 30 }
export const UNIT_LABELS: Record<PaceUnit, string> = { pages: 'Pages', verses: 'Verses', juz: 'Juz' }
export const LEVEL_LABELS: Record<ClassLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}
export const TRACK_LABELS: Record<LearningTrack, string> = {
  juz_based: 'Juz-based',
  qaida: 'Noorani Qaida',
  surah_based: 'Surah-based',
}

export const CLASSES: ClassRoom[] = [
  {
    id: 'class-1',
    name: 'Beginner Juz Reading',
    description: 'Foundational Juz-based recitation',
    level: 'beginner',
    learningTrack: 'juz_based',
    status: 'active',
    leaderboardEnabled: true,
  },
  {
    id: 'class-2',
    name: 'Advanced Qaida',
    description: 'Noorani Qaida for older beginners',
    level: 'advanced',
    learningTrack: 'qaida',
    status: 'active',
    leaderboardEnabled: false,
  },
  {
    id: 'class-3',
    name: 'Weekend Batch',
    description: 'Surah-based track for weekend learners',
    level: 'intermediate',
    learningTrack: 'surah_based',
    status: 'active',
    leaderboardEnabled: true,
  },
]

export const STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Ahmed Malik',
    email: 'ahmed.malik@example.com',
    classId: 'class-1',
    pace: { quantity: 1, unit: 'pages' as const },
    unitsCompleted: 15,
    totalUnits: 604,
    startDate: '2025-01-01',
    estimatedCompletion: '2025-12-15',
    status: 'active' as const,
    streak: 5,
    points: 640,
    avgScore: 92,
    rank: 2,
  },
  {
    id: 'student-2',
    name: 'Fatima Hassan',
    email: 'fatima.hassan@example.com',
    classId: 'class-1',
    pace: { quantity: 1.5, unit: 'pages' as const },
    unitsCompleted: 22,
    totalUnits: 604,
    startDate: '2025-01-01',
    estimatedCompletion: '2025-11-01',
    status: 'active' as const,
    streak: 15,
    points: 780,
    avgScore: 95,
    rank: 1,
  },
  {
    id: 'student-3',
    name: 'Mariam Khan',
    email: 'mariam.khan@example.com',
    classId: 'class-1',
    pace: { quantity: 1, unit: 'pages' as const },
    unitsCompleted: 10,
    totalUnits: 604,
    startDate: '2025-01-01',
    estimatedCompletion: '2025-12-20',
    status: 'active' as const,
    streak: 4,
    points: 520,
    avgScore: 87,
    rank: 3,
  },
  {
    id: 'student-4',
    name: 'Hassan Ali',
    email: 'hassan.ali@example.com',
    classId: 'class-2',
    pace: { quantity: 0.5, unit: 'pages' as const },
    unitsCompleted: 6,
    totalUnits: 604,
    startDate: '2025-01-01',
    estimatedCompletion: '2026-04-10',
    status: 'active' as const,
    streak: 1,
    points: 380,
    avgScore: 74,
    rank: 4,
  },
  {
    id: 'student-5',
    name: 'Zainab Qureshi',
    email: 'zainab.q@example.com',
    classId: 'class-3',
    pace: { quantity: 1, unit: 'pages' as const },
    unitsCompleted: 8,
    totalUnits: 604,
    startDate: '2025-01-10',
    estimatedCompletion: '2026-01-05',
    status: 'active' as const,
    streak: 3,
    points: 290,
    avgScore: 81,
    rank: 5,
  },
  {
    id: 'student-6',
    name: 'Bilal Ahmed',
    email: 'bilal.ahmed@example.com',
    classId: null,
    pace: { quantity: 1, unit: 'pages' },
    unitsCompleted: 4,
    totalUnits: 604,
    startDate: '2025-03-01',
    estimatedCompletion: '2026-11-01',
    status: 'active',
    streak: 2,
    points: 120,
    avgScore: 76,
    rank: 6,
  },
  {
    id: 'student-7',
    name: 'Ayesha Siddiqui',
    email: 'ayesha.s@example.com',
    classId: null,
    pace: { quantity: 0.5, unit: 'pages' },
    unitsCompleted: 2,
    totalUnits: 604,
    startDate: '2025-03-10',
    estimatedCompletion: '2027-03-10',
    status: 'active',
    streak: 1,
    points: 60,
    avgScore: 72,
    rank: 7,
  },
]

export const CURRENT_STUDENT = {
  id: 'student-1',
  name: 'Ahmed Malik',
  email: 'ahmed.malik@example.com',
  classId: 'class-1',
  className: 'Beginner Juz Reading',
  teacherName: 'Ustaz Ahmed Rahman',
  pace: { quantity: 1, unit: 'pages' as const },
  unitsCompleted: 15,
  totalUnits: 604,
  startDate: '2025-01-01',
  estimatedCompletion: '2025-12-15',
  status: 'active' as const,
  streak: 5,
  points: 640,
  avgScore: 92,
  rank: 2,
  totalStudents: 9,
}

export const today = new Date()

export function generateCalendarData() {
  const data: Record<string, {
    date: Date
    status: 'completed' | 'incomplete' | 'absent' | 'pending'
    target: string
    actual: string
    score: number | null
    attendance: 'present' | 'absent' | 'late' | 'excused' | null
    durationMinutes: number | null
    streak: number
    estimatedCompletion: string
    mistakes: number
  }> = {}

  for (let i = 30; i >= 0; i--) {
    const date = subDays(today, i)
    const key = format(date, 'yyyy-MM-dd')
    const isToday = i === 0

    if (i === 0) {
      data[key] = {
        date,
        status: 'pending',
        target: 'Juz 1, Pages 16–17',
        actual: '',
        score: null,
        attendance: null,
        durationMinutes: null,
        streak: 5,
        estimatedCompletion: '2025-12-15',
        mistakes: 0,
      }
    } else if (i % 7 === 0) {
      data[key] = {
        date,
        status: 'absent',
        target: `Juz 1, Pages ${16 - i}–${17 - i}`,
        actual: '',
        score: null,
        attendance: 'absent',
        durationMinutes: null,
        streak: 0,
        estimatedCompletion: '2025-12-15',
        mistakes: 0,
      }
    } else if (i <= 5) {
      const scores = [92, 88, 95, 79, 91]
      const score = scores[5 - i] ?? 85
      data[key] = {
        date,
        status: 'completed',
        target: `Juz 1, Pages ${16 - i}–${17 - i}`,
        actual: `Juz 1, Pages ${16 - i}–${isToday ? 17 : 17 - i + 1}`,
        score,
        attendance: 'present',
        durationMinutes: 45,
        streak: i,
        estimatedCompletion: '2025-12-15',
        mistakes: score < 85 ? 3 : score < 92 ? 2 : 1,
      }
    } else {
      const score = Math.floor(Math.random() * 20) + 78
      data[key] = {
        date,
        status: 'completed',
        target: `Juz 1, Pages ${i}-${i + 1}`,
        actual: `Juz 1, Pages ${i}-${i + 1}`,
        score,
        attendance: 'present',
        durationMinutes: 45,
        streak: Math.max(0, 5 - i),
        estimatedCompletion: '2025-12-15',
        mistakes: score < 85 ? 3 : 1,
      }
    }
  }

  // Add future dates
  for (let i = 1; i <= 30; i++) {
    const date = addDays(today, i)
    const key = format(date, 'yyyy-MM-dd')
    data[key] = {
      date,
      status: 'pending',
      target: `Juz 1, Pages ${16 + i}–${17 + i}`,
      actual: '',
      score: null,
      attendance: null,
      durationMinutes: null,
      streak: 0,
      estimatedCompletion: '2025-12-15',
      mistakes: 0,
    }
  }

  return data
}

export interface StudentCalendarEntry {
  date: Date
  status: 'completed' | 'absent' | 'pending'
  isToday: boolean
  target: string
  actual: string
  score: number | null
  attendance: 'present' | 'absent' | null
  durationMinutes: number | null
  mistakes: number
}

export function generateStudentCalendar(student: Student): Record<string, StudentCalendarEntry> {
  const data: Record<string, StudentCalendarEntry> = {}
  const { quantity, unit } = student.pace
  const step = Math.max(quantity, 0.5)
  const rangeLabel = (from: number, to: number) =>
    `${UNIT_LABELS[unit]} ${Math.max(1, Math.round(from))}\u2013${Math.round(to)}`

  // Past 30 days of history derived from the student's completed units
  for (let i = 30; i >= 1; i--) {
    const date = subDays(today, i)
    const key = format(date, 'yyyy-MM-dd')
    const from = Math.max(1, student.unitsCompleted - step * i + 1)
    const to = from + step

    if (i % 7 === 0) {
      data[key] = {
        date,
        status: 'absent',
        isToday: false,
        target: rangeLabel(from, to),
        actual: '',
        score: null,
        attendance: 'absent',
        durationMinutes: null,
        mistakes: 0,
      }
    } else {
      const score = 78 + ((i * 13) % 20)
      data[key] = {
        date,
        status: 'completed',
        isToday: false,
        target: rangeLabel(from, to),
        actual: rangeLabel(from, to),
        score,
        attendance: 'present',
        durationMinutes: 45,
        mistakes: score < 85 ? 3 : score < 92 ? 2 : 1,
      }
    }
  }

  // Today + next 30 days of estimated schedule based on current pace
  for (let i = 0; i <= 30; i++) {
    const date = addDays(today, i)
    const key = format(date, 'yyyy-MM-dd')
    const from = student.unitsCompleted + step * i + 1
    const to = from + step
    data[key] = {
      date,
      status: 'pending',
      isToday: i === 0,
      target: rangeLabel(from, to),
      actual: '',
      score: null,
      attendance: null,
      durationMinutes: null,
      mistakes: 0,
    }
  }

  return data
}

export type StartTrack = 'qaida' | 'juz'

export interface EnrollRequest {
  id: string
  name: string
  email: string
  preferredTime: string
  startTrack: StartTrack
  startJuz: number | null
  experience: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export const ENROLL_REQUESTS: EnrollRequest[] = [
  {
    id: 'req-1',
    name: 'Yusuf Ibrahim',
    email: 'yusuf.ibrahim@example.com',
    preferredTime: 'Weekdays after Asr (4:00\u20135:00 PM)',
    startTrack: 'qaida',
    startJuz: null,
    experience: 'Complete beginner. Knows the Arabic alphabet but has not started Noorani Qaida yet.',
    submittedAt: format(subDays(today, 1), 'yyyy-MM-dd'),
    status: 'pending',
  },
  {
    id: 'req-2',
    name: 'Hana Farooq',
    email: 'hana.farooq@example.com',
    preferredTime: 'Weekend mornings (10:00\u201311:00 AM)',
    startTrack: 'juz',
    startJuz: 3,
    experience: 'Finished Noorani Qaida last year and has been revising Juz 1\u20132 at home.',
    submittedAt: format(subDays(today, 2), 'yyyy-MM-dd'),
    status: 'pending',
  },
  {
    id: 'req-3',
    name: 'Omar Siddiq',
    email: 'omar.siddiq@example.com',
    preferredTime: 'Weekdays after Maghrib (6:30\u20137:30 PM)',
    startTrack: 'juz',
    startJuz: 1,
    experience: 'Reads fluently on his own but wants tajweed correction from the start.',
    submittedAt: format(subDays(today, 3), 'yyyy-MM-dd'),
    status: 'pending',
  },
]

export const SESSIONS = [
  {
    id: 'session-1',
    classId: 'class-1',
    teacherId: 'teacher-1',
    date: format(today, 'yyyy-MM-dd'),
    time: '15:00',
    duration: 45,
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    lessonTitle: 'Juz 1, Pages 16–17',
    status: 'scheduled' as const,
  },
  {
    id: 'session-2',
    classId: 'class-1',
    teacherId: 'teacher-1',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    time: '15:00',
    duration: 45,
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    lessonTitle: 'Juz 1, Pages 14–15',
    status: 'completed' as const,
  },
]

export const TEACHER_SCHEDULE = [
  {
    id: 'sched-1',
    date: format(today, 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    studentName: 'Fatima Hassan',
    className: 'Beginner Juz Reading',
    lessonTitle: 'Juz 1, Pages 18–19',
    meetUrl: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'sched-2',
    date: format(today, 'yyyy-MM-dd'),
    time: '11:00',
    duration: 45,
    studentName: 'Ahmed Malik',
    className: 'Beginner Juz Reading',
    lessonTitle: 'Juz 1, Pages 16–17',
    meetUrl: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'sched-3',
    date: format(today, 'yyyy-MM-dd'),
    time: '13:30',
    duration: 30,
    studentName: 'Mariam Khan',
    className: 'Beginner Juz Reading',
    lessonTitle: 'Juz 1, Pages 12–13',
    meetUrl: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'sched-4',
    date: format(today, 'yyyy-MM-dd'),
    time: '15:00',
    duration: 45,
    studentName: 'Hassan Ali',
    className: 'Advanced Qaida',
    lessonTitle: 'Noorani Qaida, Lesson 8',
    meetUrl: 'https://meet.google.com/klm-nopq-rst',
  },
  {
    id: 'sched-5',
    date: format(today, 'yyyy-MM-dd'),
    time: '17:00',
    duration: 30,
    studentName: 'Zainab Qureshi',
    className: 'Weekend Batch',
    lessonTitle: 'Surah Al-Fatiha revision',
    meetUrl: 'https://meet.google.com/uvw-xyza-bcd',
  },
]

export interface LessonPoint {
  juz: number | null
  surahName: string | null
  surahNumber: number | null
  ayah: number | null
  page: number | null
  qaidaLesson: number | null
}

export interface SessionDetail {
  resumeFrom: LessonPoint
  targetEnd: LessonPoint
  contentAr: string
  contentEn: string
  contentTranslit: string
  tajweedRules: string[]
  notes: string
  // PRD 4.2: audio playback (pre-recorded Qari). Null for Qaida lessons (teacher uploads).
  audioRange: { surah: number; surahName: string; startAyah: number; endAyah: number } | null
}

export const SESSION_DETAILS: Record<string, SessionDetail> = {
  'sched-1': {
    resumeFrom: { juz: 1, surahName: 'Al-Baqarah', surahNumber: 2, ayah: 130, page: 18, qaidaLesson: null },
    targetEnd: { juz: 1, surahName: 'Al-Baqarah', surahNumber: 2, ayah: 152, page: 19, qaidaLesson: null },
    contentAr:
      'وَمَن يَرْغَبُ عَن مِّلَّةِ إِبْرَاهِيمَ إِلَّا مَن سَفِهَ نَفْسَهُ ۚ وَلَقَدِ اصْطَفَيْنَاهُ فِي الدُّنْيَا ۖ وَإِنَّهُ فِي الْآخِرَةِ لَمِنَ الصَّالِحِينَ ﴿١٣٠﴾',
    contentEn:
      'And who would be averse to the religion of Abraham except one who makes himself foolish? And We had surely chosen him in this world, and in the Hereafter he will be among the righteous.',
    contentTranslit:
      'Wa man yarghabu ʿan millati Ibrāhīma illā man safiha nafsah, wa laqadiṣṭafaynāhu fid-dunyā wa innahū fil-ākhirati laminaṣ-ṣāliḥīn.',
    tajweedRules: ['Idgham with Ghunnah', 'Madd Jaiz Munfasil'],
    notes: 'Yesterday she stopped at 2:129 after the Madd correction. Begin reading from 2:130.',
    audioRange: { surah: 2, surahName: 'Al-Baqarah', startAyah: 130, endAyah: 152 },
  },
  'sched-2': {
    resumeFrom: { juz: 1, surahName: 'Al-Baqarah', surahNumber: 2, ayah: 102, page: 16, qaidaLesson: null },
    targetEnd: { juz: 1, surahName: 'Al-Baqarah', surahNumber: 2, ayah: 126, page: 17, qaidaLesson: null },
    contentAr:
      'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَقُولُوا رَاعِنَا وَقُولُوا انظُرْنَا وَاسْمَعُوا ۗ وَلِلْكَافِرِينَ عَذَابٌ أَلِيمٌ ﴿١٠٤﴾',
    contentEn:
      'O you who have believed, do not say (to the Prophet), "Raʿina," but say, "Unẓurna," and listen. And for the disbelievers is a painful punishment.',
    contentTranslit:
      'Yā ayyuhal-ladhīna āmanū lā taqūlū rāʿinā wa qūlunẓurnā wasmaʿū, wa lil-kāfirīna ʿadhābun alīm.',
    tajweedRules: ['Madd Tabii', 'Qalqala Sughra'],
    notes: 'He stopped at 2:101 yesterday while practising Madd. Start from 2:102 and re-check his Qalqala.',
    audioRange: { surah: 2, surahName: 'Al-Baqarah', startAyah: 102, endAyah: 126 },
  },
  'sched-3': {
    resumeFrom: { juz: 1, surahName: 'Al-Baqarah', surahNumber: 2, ayah: 71, page: 12, qaidaLesson: null },
    targetEnd: { juz: 1, surahName: 'Al-Baqarah', surahNumber: 2, ayah: 84, page: 13, qaidaLesson: null },
    contentAr:
      'وَإِذْ قَتَلْتُمْ نَفْسًا فَادَّارَأْتُمْ فِيهَا ۖ وَاللَّهُ مُخْرِجٌ مَّا كُنتُمْ تَكْتُمُونَ ﴿٧٢﴾',
    contentEn: 'And when you killed a soul and quarreled about it, but Allah was to bring out what you were concealing.',
    contentTranslit: 'Wa idh qataltum nafsan faddāraʼtum fīhā, wallāhu mukhrijun mā kuntum taktumūn.',
    tajweedRules: ['Ikhfa Haqiqi', 'Madd Sila Qasira'],
    notes: 'Her last session ended mid-page at 2:70. Open from 2:71 and revise Ikhfa first.',
    audioRange: { surah: 2, surahName: 'Al-Baqarah', startAyah: 71, endAyah: 84 },
  },
  'sched-4': {
    resumeFrom: { juz: null, surahName: null, surahNumber: null, ayah: null, page: null, qaidaLesson: 8 },
    targetEnd: { juz: null, surahName: null, surahNumber: null, ayah: null, page: null, qaidaLesson: 8 },
    contentAr: 'أَبْ  أَتْ  أَثْ  |  أَجْ  أَحْ  أَخْ',
    contentEn:
      'Noorani Qaida, Lesson 8 drill: letters carrying sukoon read after a fatha. Practise joining each letter smoothly without adding any extra vowel sound.',
    contentTranslit: 'ab, at, ath | aj, aḥ, akh',
    tajweedRules: ['Sukoon', 'Letter joining'],
    notes: 'He finished Lesson 7 yesterday. Start Lesson 8 from the top and slow down the sukoon drill.',
    audioRange: null,
  },
  'sched-5': {
    resumeFrom: { juz: 1, surahName: 'Al-Fatiha', surahNumber: 1, ayah: 1, page: 1, qaidaLesson: null },
    targetEnd: { juz: 1, surahName: 'Al-Fatiha', surahNumber: 1, ayah: 7, page: 1, qaidaLesson: null },
    contentAr: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾',
    contentEn: 'In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of all the worlds.',
    contentTranslit: 'Bismillāhir raḥmānir raḥīm. Al-ḥamdu lillāhi rabbil-ʿālamīn.',
    tajweedRules: ['Madd Tabii', 'Lam Shamsiyyah'],
    notes: 'Full Surah Al-Fatiha revision — start from Bismillah and focus on Lam Shamsiyyah.',
    audioRange: { surah: 1, surahName: 'Al-Fatiha', startAyah: 1, endAyah: 7 },
  },
}

// PRD 6.2 / 7.1: mistakes marked during a live class (word-level) flow into the daily report
export type MistakeType = 'makhraj' | 'tajweed' | 'fluency' | 'other'

export const MISTAKE_TYPE_LABELS: Record<MistakeType, string> = {
  makhraj: 'Makhraj (pronunciation)',
  tajweed: 'Tajweed rule',
  fluency: 'Fluency',
  other: 'Other',
}

export interface SessionMistake {
  id: string
  verseKey: string // e.g. "2:104"
  surahName: string
  ayah: number
  wordText: string
  wordPosition: number
  type: MistakeType
  note: string
  markedAt: number
  // Optional enrichment from the integrated lesson view (3d mistake popup)
  subtype?: string
  deduction?: number
}

// PRD 6.2: session scoring rubric — weights are teacher-configurable; these are the PRD example defaults
export interface ScoreCriteria {
  makhraj: number
  tajweed: number
  fluency: number
  consistency: number
}

export const SCORE_WEIGHTS: ScoreCriteria = { makhraj: 40, tajweed: 30, fluency: 20, consistency: 10 }

export const SCORE_CRITERIA_LABELS: Record<keyof ScoreCriteria, string> = {
  makhraj: 'Makhraj (pronunciation)',
  tajweed: 'Tajweed rules',
  fluency: 'Fluency',
  consistency: 'Consistency',
}

export const PASS_THRESHOLD = 70

export function gradeFor(total: number): string {
  if (total >= 90) return 'A'
  if (total >= 80) return 'B'
  if (total >= 70) return 'C'
  if (total >= 60) return 'D'
  return 'F'
}

export interface SessionScore {
  criteria: ScoreCriteria
  total: number
  grade: string
  passed: boolean
  teacherMessage: string
  submittedAt: number
}

// Where the teacher marked the end of a day's lesson — becomes the next session's starting point
export interface SessionEndpoint {
  verseKey: string // e.g. "2:113"
  surahName: string
  ayah: number
  page: number
  markedAt: number
}

export const LESSONS = [
  {
    id: 'lesson-1',
    classId: 'class-1',
    title: 'Juz 1, Pages 1–3',
    lessonType: 'juz_range' as const,
    contentAr: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَـٰنِ الرَّحِيمِ ﴿٣﴾',
    contentEn: 'In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of all the worlds. The Most Gracious, the Most Merciful.',
    contentTranslit: 'Bismillāhir raḥmānir raḥīm. Al-ḥamdu lillāhi rabbil-ʿālamīn. Ar-raḥmānir raḥīm.',
    audioQari: 'Sudais',
    targetQuantity: 3,
    targetUnitType: 'pages' as const,
    tajweedRules: ['Bismillah', 'Madd Tabii'],
    isPublished: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'lesson-2',
    classId: 'class-1',
    title: 'Juz 1, Pages 4–6',
    lessonType: 'juz_range' as const,
    contentAr: 'مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾',
    contentEn: 'Master of the Day of Judgment. It is You we worship and You we ask for help. Guide us to the straight path.',
    contentTranslit: 'Māliki yawmid-dīn. Iyyāka naʿbudu wa-iyyāka nastaʿīn. Ihdinā ṣ-ṣirāṭal-mustaqīm.',
    audioQari: 'Al-Minshawi',
    targetQuantity: 3,
    targetUnitType: 'pages' as const,
    tajweedRules: ['Idgham', 'Noon Ghunnah'],
    isPublished: true,
    createdAt: '2025-01-03',
  },
  {
    id: 'lesson-3',
    classId: 'class-1',
    title: 'Juz 1, Pages 7–9',
    lessonType: 'juz_range' as const,
    contentAr: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾',
    contentEn: 'This is the Book about which there is no doubt, a guidance for those conscious of Allah.',
    contentTranslit: 'Dhālikal-kitābu lā rayba fīh, hudan lil-muttaqīn.',
    audioQari: 'Sudais',
    targetQuantity: 3,
    targetUnitType: 'pages' as const,
    tajweedRules: ['Madd Lazim', 'Qalqala'],
    isPublished: true,
    createdAt: '2025-01-06',
  },
]

export const ACHIEVEMENTS = [
  {
    id: 'ach-1',
    type: 'weekly_streak' as const,
    badgeName: 'Bronze Streak',
    badgeColor: '#CD7F32',
    points: 25,
    description: '7-day consecutive streak',
    unlockedDate: format(subDays(today, 10), 'yyyy-MM-dd'),
  },
  {
    id: 'ach-2',
    type: 'daily_completion' as const,
    badgeName: 'First Juz',
    badgeColor: '#FFD700',
    points: 100,
    description: 'Completed your first Juz',
    unlockedDate: format(subDays(today, 5), 'yyyy-MM-dd'),
  },
  {
    id: 'ach-3',
    type: 'monthly_perfect' as const,
    badgeName: 'Perfect Week',
    badgeColor: '#C0C0C0',
    points: 50,
    description: 'Perfect attendance for a full week',
    unlockedDate: format(subDays(today, 2), 'yyyy-MM-dd'),
  },
]

export const MILESTONES = [
  { name: 'Juz 5 (17%)', projectedDate: '2025-02-28', percentage: 16.7 },
  { name: 'Juz 10 (33%)', projectedDate: '2025-04-15', percentage: 33.3 },
  { name: 'Juz 15 (50%)', projectedDate: '2025-06-01', percentage: 50 },
  { name: 'Juz 20 (67%)', projectedDate: '2025-07-20', percentage: 66.7 },
  { name: 'Juz 25 (83%)', projectedDate: '2025-09-10', percentage: 83.3 },
  { name: 'Quran Complete', projectedDate: '2025-12-15', percentage: 100 },
]

export const WEEK_SCORES = [
  { day: 'Mon', score: 88 },
  { day: 'Tue', score: 92 },
  { day: 'Wed', score: 79 },
  { day: 'Thu', score: 95 },
  { day: 'Fri', score: 91 },
  { day: 'Sat', score: 85 },
  { day: 'Sun', score: 88 },
]
