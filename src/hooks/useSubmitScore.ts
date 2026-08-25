import { useCallback, useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { LessonRubricScore } from '@/types'

// POST /api/teachers/me/submissions/:submissionId/score
export function useSubmitScore() {
  const { saveRubric } = useAppStore()
  const [loading, setLoading] = useState(false)

  const submit = useCallback(
    async (sessionId: string, score: Omit<LessonRubricScore, 'savedAt'>): Promise<void> => {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 500))
      saveRubric(sessionId, score)
      setLoading(false)
    },
    [saveRubric]
  )

  return { submit, loading }
}
