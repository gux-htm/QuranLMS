import { useCallback, useState } from 'react'
import { useAppStore } from '@/lib/store'

export interface AssignCurriculumInput {
  curriculumId: string
  curriculumTitle: string
  classId: string
  studentIds: string[]
  deadline: string | null
  notes: string
}

// POST /api/teachers/me/curriculum/:id/assign
export function useAssignCurriculum() {
  const { assignCurriculum } = useAppStore()
  const [loading, setLoading] = useState(false)

  const assign = useCallback(
    async (input: AssignCurriculumInput): Promise<number> => {
      setLoading(true)
      // Simulated API latency
      await new Promise((r) => setTimeout(r, 450))
      assignCurriculum(input)
      setLoading(false)
      return input.studentIds.length
    },
    [assignCurriculum]
  )

  return { assign, loading }
}
