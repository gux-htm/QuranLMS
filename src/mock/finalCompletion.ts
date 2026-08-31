export interface PointEvent { id: string; date: string; label: string; points: number }
export const POINT_EVENTS: PointEvent[] = [
  { id: 'points-1', date: '2025-01-15', label: 'Lesson complete', points: 5 },
  { id: 'points-2', date: '2025-01-14', label: 'Weekly streak (7d)', points: 25 },
  { id: 'points-3', date: '2025-01-13', label: 'Missed session', points: -5 },
  { id: 'points-4', date: '2025-01-12', label: 'Incomplete lesson', points: -10 },
  { id: 'points-5', date: '2025-01-11', label: 'Lesson complete', points: 5 },
]

export const TEACHER_NOTES: Record<string, string> = {
  'student-1': 'Ahmed is progressing well on Makhraj.\nNeeds consistent practice on Ghunnah.\nParents are responsive to WhatsApp updates.',
  'student-2': 'Fatima has a steady pace and responds well to short revision targets.',
}

export interface ShareableReport { studentId: string; studentName: string; date: string }
export const buildReportShareUrl = (studentId: string, date: string) => `https://tilp.app/report/share/${btoa(`${studentId}-${date}`)}`
