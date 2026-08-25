import { useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import type { TeacherSettingsState } from '@/types'

// GET/PUT /api/teachers/me/settings
export function useTeacherSettings() {
  const { teacherSettings, updateTeacherSettings } = useAppStore()

  const saveSettings = useCallback(
    async (patch: Partial<TeacherSettingsState>) => {
      // Simulated API latency
      await new Promise((r) => setTimeout(r, 350))
      updateTeacherSettings(patch)
    },
    [updateTeacherSettings]
  )

  return { settings: teacherSettings, saveSettings }
}
