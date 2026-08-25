import { useEffect, useMemo, useState } from 'react'
import { generateClassAnalytics } from '@/lib/analyticsData'
import { useAppStore } from '@/lib/store'
import type { ClassAnalyticsData } from '@/types'

export type AnalyticsRange = '7d' | '30d' | 'all'

const RANGE_WEEKS: Record<AnalyticsRange, number> = { '7d': 4, '30d': 8, all: 16 }

// GET /api/teachers/me/classes/:classId/analytics
export function useClassAnalytics(classId: string | undefined, range: AnalyticsRange) {
  const { getClass, getEnrolledStudents } = useAppStore()
  const [loading, setLoading] = useState(true)

  const klass = classId ? getClass(classId) : undefined
  const students = classId ? getEnrolledStudents(classId) : []

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [classId, range])

  const data: ClassAnalyticsData | null = useMemo(() => {
    if (!klass) return null
    return generateClassAnalytics(klass, students, RANGE_WEEKS[range])
  }, [klass, students, range])

  return { data, loading, klass }
}
