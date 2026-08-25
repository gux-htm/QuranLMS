import { useEffect, useState } from 'react'
import { SESSION_DETAILS, TEACHER_SCHEDULE } from '@/lib/mockData'
import type { SessionDetail } from '@/lib/mockData'

export interface SessionLessonData {
  session: (typeof TEACHER_SCHEDULE)[number]
  detail: SessionDetail
  studentName: string
}

// GET /api/teachers/me/sessions/:sessionId/lesson
export function useSessionLesson(sessionId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SessionLessonData | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!sessionId) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    // Simulated fetch latency so loading states are visible
    const timer = window.setTimeout(() => {
      const session = TEACHER_SCHEDULE.find((s) => s.id === sessionId)
      const detail = SESSION_DETAILS[sessionId]
      if (!cancelled) {
        setData(session && detail ? { session, detail, studentName: session.studentName } : null)
        setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [sessionId])

  return { data, loading }
}
