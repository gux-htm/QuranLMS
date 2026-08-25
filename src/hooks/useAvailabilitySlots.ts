import { useCallback, useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { SlotGenerationConfig } from '@/types'

// POST /api/teachers/me/settings/slots/generate + GET/PUT availability-slots
export function useAvailabilitySlots() {
  const {
    availabilitySlots,
    generateSlots,
    updateSlot,
    setAllSlotsStatus,
    slotBookings,
    updateBookingStatus,
    getStudent,
  } = useAppStore()
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(
    async (config: SlotGenerationConfig): Promise<number> => {
      setGenerating(true)
      await new Promise((r) => setTimeout(r, 500))
      const count = generateSlots(config)
      setGenerating(false)
      return count
    },
    [generateSlots]
  )

  return {
    slots: availabilitySlots,
    bookings: slotBookings,
    generating,
    generate,
    updateSlot,
    setAllSlotsStatus,
    updateBookingStatus,
    getStudent,
  }
}
