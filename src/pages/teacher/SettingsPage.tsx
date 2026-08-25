import { useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import { BadgeCheck, Camera, Clock, KeyRound, ShieldCheck, User as UserIcon } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toaster'
import { useTeacherSettings } from '@/hooks/useTeacherSettings'
import { useAvailabilitySlots } from '@/hooks/useAvailabilitySlots'
import { TIMEZONES } from '@/lib/store'
import { TEACHER, today } from '@/lib/mockData'
import type { CurriculumTrack, LoginHistoryEntry } from '@/types'

type TabId = 'profile' | 'availability' | 'notifications' | 'platform' | 'security'

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'availability', label: 'Availability & Slots' },
  { id: 'notifications', label: 'Notifications & Reports' },
  { id: 'platform', label: 'Platform' },
  { id: 'security', label: 'Account & Security' },
]

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const LOGIN_HISTORY: LoginHistoryEntry[] = Array.from({ length: 10 }, (_, i) => {
  const date = subDays(today, i * 1.5)
  return {
    id: `login-${i}`,
    date: format(date, 'MMM d, yyyy'),
    time: format(new Date(date.getTime() - i * 3600_000 * 2), 'h:mm a'),
    ip: `182.176.${40 + i}.${12 + i * 3}`,
    device: i % 3 === 0 ? 'Chrome — Windows' : i % 3 === 1 ? 'Safari — iPhone' : 'Chrome — Android',
    location: i % 4 === 0 ? 'Multan, PK' : 'Lahore, PK',
  }
})

// Deterministic QR-like pattern for the MFA setup visual (mock)
function QrPattern() {
  const cells = useMemo(() => {
    const out: boolean[] = []
    let t = 42
    for (let i = 0; i < 21 * 21; i++) {
      t = (t * 9301 + 49297) % 233280
      out.push(t / 233280 > 0.5)
    }
    return out
  }, [])
  return (
    <svg viewBox="0 0 21 21" className="h-40 w-40 rounded-md border border-line bg-white p-1.5" role="img" aria-label="MFA QR code">
      {cells.map((on, i) =>
        on ? <rect key={i} x={i % 21} y={Math.floor(i / 21)} width={0.92} height={0.92} fill="#1C2620" /> : null
      )}
    </svg>
  )
}

const MFA_BACKUP_CODES = ['XK4M-92LD', 'PV7Q-58TN', 'RC2F-71WB', 'HJ9S-36MY', 'BD5V-84GZ', 'NW1T-47KL']

const TRACK_OPTIONS: { id: CurriculumTrack; label: string }[] = [
  { id: 'juz_based', label: 'Para-Based' },
  { id: 'qaida', label: 'Noorani Qaida' },
  { id: 'surah_based', label: 'Surah-Based' },
  { id: 'tajweed', label: 'Tajweed Guide' },
  { id: 'makharij', label: 'Makharij Guide' },
  { id: 'waqf', label: 'Stopping Rules' },
  { id: 'duas', label: 'Duas' },
  { id: 'hadith', label: 'Hadiths' },
  { id: 'custom', label: 'Custom' },
]

export function TeacherSettings() {
  const { push } = useToast()
  const { settings, saveSettings } = useTeacherSettings()
  const slotsApi = useAvailabilitySlots()

  const [tab, setTab] = useState<TabId>('profile')
  const [saving, setSaving] = useState(false)

  // --- Profile form state ---
  const [profile, setProfile] = useState({
    institutionName: settings.institutionName,
    bio: settings.bio,
    phone: settings.phone,
    timezone: settings.timezone,
  })

  // --- Availability form state ---
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])

  // --- Notifications form state ---
  const [notif, setNotif] = useState({
    dailyReportTime: settings.dailyReportTime,
    reportsEnabled: settings.reportsEnabled,
    weeklySummaries: settings.weeklySummaries,
    alertPerformanceDrop: settings.alertPerformanceDrop,
    alertLowAttendance: settings.alertLowAttendance,
    reminderBeforeSession: settings.reminderBeforeSession,
    achievementNotifications: settings.achievementNotifications,
  })

  // --- Platform form state ---
  const [platform, setPlatform] = useState({
    language: settings.language,
    theme: settings.theme,
    enabledTracks: settings.enabledTracks,
    leaderboardEnabled: settings.leaderboardEnabled,
    leaderboardVisibleToStudents: settings.leaderboardVisibleToStudents,
  })

  // --- Security state ---
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [mfaModal, setMfaModal] = useState(false)

  const saveProfile = async () => {
    setSaving(true)
    await saveSettings(profile)
    setSaving(false)
    push('Profile settings saved')
  }

  const saveNotifications = async () => {
    setSaving(true)
    await saveSettings(notif)
    setSaving(false)
    push('Notification preferences saved')
  }

  const savePlatform = async () => {
    setSaving(true)
    await saveSettings(platform)
    setSaving(false)
    push('Platform settings saved')
  }

  const handleGenerate = async () => {
    if (days.length === 0) {
      push('Pick at least one day of the week', 'error')
      return
    }
    const count = await slotsApi.generate({ startTime, endTime, slotDuration: 30, days })
    push(`Generated ${count} slots for the next 7 days`)
  }

  const handlePassword = () => {
    if (!passwords.current) {
      push('Enter your current password', 'error')
      return
    }
    if (passwords.next.length < 8) {
      push('New password must be at least 8 characters', 'error')
      return
    }
    if (passwords.next !== passwords.confirm) {
      push('Passwords do not match', 'error')
      return
    }
    setPasswords({ current: '', next: '', confirm: '' })
    push('Password changed successfully')
  }

  const toggleTrack = (t: CurriculumTrack) =>
    setPlatform((p) => ({
      ...p,
      enabledTracks: p.enabledTracks.includes(t) ? p.enabledTracks.filter((x) => x !== t) : [...p.enabledTracks, t],
    }))

  const toggleDay = (d: number) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const verificationBadge = () => {
    if (settings.verificationStatus === 'verified')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
          <BadgeCheck className="h-4 w-4" />
          Verified{settings.verifiedDate ? ` — since ${format(new Date(settings.verifiedDate), 'MMM d, yyyy')}` : ''}
        </span>
      )
    if (settings.verificationStatus === 'pending')
      return <span className="rounded-full bg-gold-100 px-3 py-1 text-sm font-medium text-gold-800">Pending Verification</span>
    return <span className="rounded-full bg-clay-100 px-3 py-1 text-sm font-medium text-clay-700">Rejected</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/55">Your profile, availability, notifications and platform preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-md px-3.5 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-b-2 border-green-600 bg-green-50 text-green-700' : 'text-ink/55 hover:bg-paper-dim'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ==================== Profile ==================== */}
      {tab === 'profile' && (
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-green-700" />
            Profile settings
          </CardTitle>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {settings.avatarUrl ? (
                  <img src={settings.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 font-display text-lg font-semibold text-green-800">
                    {TEACHER.avatarInitials}
                  </div>
                )}
                <label
                  className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-green-600 p-1.5 text-paper hover:bg-green-700"
                  title="Upload avatar"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = URL.createObjectURL(file)
                        saveSettings({ avatarUrl: url })
                        push('Avatar uploaded')
                      }
                    }}
                  />
                </label>
              </div>
              <div>
                <div className="text-sm font-medium text-ink">{TEACHER.name}</div>
                <div className="text-xs text-ink/50">{TEACHER.email}</div>
                <div className="mt-1.5">{verificationBadge()}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Institution name</span>
                <input
                  value={profile.institutionName}
                  onChange={(e) => setProfile({ ...profile, institutionName: e.target.value })}
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Phone number</span>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Bio / specialization</span>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
              />
            </label>

            <label className="block sm:w-64">
              <span className="mb-1.5 block text-sm font-medium text-ink">Timezone</span>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>

            <Button onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </Card>
      )}

      {/* ==================== Availability & Slots ==================== */}
      {tab === 'availability' && (
        <div className="space-y-5">
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-700" />
              Working hours & slot generation
            </CardTitle>
            <div className="flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">End time</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Slot duration</span>
                <input
                  value="30 minutes (fixed)"
                  readOnly
                  className="h-10 w-40 rounded-md border border-line bg-paper-dim px-3 text-sm text-ink/60"
                />
              </label>
              <Button onClick={handleGenerate} disabled={slotsApi.generating}>
                {slotsApi.generating ? 'Generating…' : 'Generate slots'}
              </Button>
            </div>

            <div className="mt-4">
              <span className="mb-2 block text-sm font-medium text-ink">Days of week</span>
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_NAMES.map((name, i) => (
                  <label
                    key={name}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                      days.includes(i) ? 'border-green-300 bg-green-50 text-green-700' : 'border-line text-ink/60 hover:bg-paper-dim'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={days.includes(i)}
                      onChange={() => toggleDay(i)}
                      className="h-4 w-4 accent-green-600"
                    />
                    {name}
                  </label>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Generated slots ({slotsApi.slots.length})</CardTitle>
              {slotsApi.slots.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => slotsApi.setAllSlotsStatus('open')}>
                    Open all slots
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => slotsApi.setAllSlotsStatus('closed')}>
                    Close all slots
                  </Button>
                </div>
              )}
            </div>
            {slotsApi.slots.length === 0 ? (
              <p className="rounded-md border border-line p-4 text-sm text-ink/55">
                No slots yet. Set your working hours and press "Generate slots".
              </p>
            ) : (
              <div className="max-h-80 overflow-auto rounded-md border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-paper-dim text-xs uppercase tracking-wide text-ink/50">
                    <tr>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Slot time</th>
                      <th className="px-3 py-2 font-medium">Enrolled</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slotsApi.slots.slice(0, 24).map((slot) => (
                      <tr key={slot.id} className="border-t border-line">
                        <td className="px-3 py-2 text-ink">{format(new Date(slot.date + 'T00:00:00'), 'EEE, MMM d')}</td>
                        <td className="px-3 py-2 tabular-nums text-ink">
                          {slot.start} – {slot.end}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-ink/60">
                          {slot.enrolledCount}/{slot.maxStudents}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              slot.status === 'open'
                                ? 'bg-green-50 text-green-700'
                                : slot.status === 'full'
                                  ? 'bg-gold-100 text-gold-800'
                                  : 'bg-clay-100 text-clay-700'
                            }`}
                          >
                            {slot.status === 'open' ? 'Open' : slot.status === 'full' ? 'Full' : 'Closed'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {slot.status === 'closed' ? (
                            <Button size="sm" variant="ghost" onClick={() => slotsApi.updateSlot(slot.id, { status: slot.enrolledCount >= slot.maxStudents ? 'full' : 'open' })}>
                              Reopen
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => slotsApi.updateSlot(slot.id, { status: 'closed' })}>
                              Close
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardTitle className="mb-3">Enrolled slots ({slotsApi.bookings.length})</CardTitle>
            {slotsApi.bookings.length === 0 ? (
              <p className="rounded-md border border-line p-4 text-sm text-ink/55">No student bookings yet.</p>
            ) : (
              <div className="space-y-2">
                {slotsApi.bookings.map((b) => {
                  const slot = slotsApi.slots.find((s) => s.id === b.slotId)
                  const student = slotsApi.getStudent(b.studentId)
                  return (
                    <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-md border border-line p-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-ink">{student?.name ?? 'Unknown student'}</div>
                        <div className="text-xs text-ink/55">
                          {slot ? `${format(new Date(slot.date + 'T00:00:00'), 'EEE, MMM d')} • ${slot.start} – ${slot.end}` : 'Slot removed'}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          b.status === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : b.status === 'pending'
                              ? 'bg-gold-100 text-gold-800'
                              : b.status === 'completed'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-clay-100 text-clay-700'
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => slotsApi.updateBookingStatus(b.id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => slotsApi.updateBookingStatus(b.id, 'rejected')}>
                            Reject
                          </Button>
                        </>
                      )}
                      {b.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => slotsApi.updateBookingStatus(b.id, 'completed')}>
                          Mark complete
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================== Notifications & Reports ==================== */}
      {tab === 'notifications' && (
        <Card>
          <CardTitle className="mb-4">Notifications & reports</CardTitle>
          <div className="space-y-5">
            <div className="flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Daily report time</span>
                <input
                  type="time"
                  value={notif.dailyReportTime}
                  onChange={(e) => setNotif({ ...notif, dailyReportTime: e.target.value })}
                  className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                />
              </label>
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">Email settings</legend>
              {(
                [
                  ['reportsEnabled', 'Enable daily reports'],
                  ['weeklySummaries', 'Email class summaries (weekly)'],
                  ['alertPerformanceDrop', 'Alert on student performance drop'],
                  ['alertLowAttendance', 'Alert on low attendance'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={notif[key]}
                    onChange={(e) => setNotif({ ...notif, [key]: e.target.checked })}
                    className="h-4 w-4 accent-green-600"
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                In-app notifications
              </legend>
              {(
                [
                  ['reminderBeforeSession', 'Show reminders 1 hour before session'],
                  ['achievementNotifications', 'Show achievement notifications'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={notif[key]}
                    onChange={(e) => setNotif({ ...notif, [key]: e.target.checked })}
                    className="h-4 w-4 accent-green-600"
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            <Button onClick={saveNotifications} disabled={saving}>
              {saving ? 'Saving…' : 'Save preferences'}
            </Button>
          </div>
        </Card>
      )}

      {/* ==================== Platform ==================== */}
      {tab === 'platform' && (
        <Card>
          <CardTitle className="mb-4">Platform settings</CardTitle>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Language</span>
                <select
                  value={platform.language}
                  onChange={(e) => setPlatform({ ...platform, language: e.target.value as 'en' | 'ar' | 'ur' })}
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="ur">Urdu</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Theme</span>
                <select
                  value={platform.theme}
                  onChange={(e) => setPlatform({ ...platform, theme: e.target.value as 'light' | 'dark' })}
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                >
                  <option value="light">Light</option>
                  <option value="dark" disabled>
                    Dark (coming soon)
                  </option>
                </select>
              </label>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink">Learning tracks available in your classes</legend>
              <div className="flex flex-wrap gap-2">
                {TRACK_OPTIONS.map((t) => (
                  <label
                    key={t.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                      platform.enabledTracks.includes(t.id)
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-line text-ink/60 hover:bg-paper-dim'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={platform.enabledTracks.includes(t.id)}
                      onChange={() => toggleTrack(t.id)}
                      className="h-4 w-4 accent-green-600"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-medium text-ink">Leaderboard</legend>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={platform.leaderboardEnabled}
                  onChange={(e) => setPlatform({ ...platform, leaderboardEnabled: e.target.checked })}
                  className="h-4 w-4 accent-green-600"
                />
                Enable leaderboard in my classes
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={platform.leaderboardVisibleToStudents}
                  onChange={(e) => setPlatform({ ...platform, leaderboardVisibleToStudents: e.target.checked })}
                  className="h-4 w-4 accent-green-600"
                />
                Show leaderboard to students
              </label>
            </fieldset>

            {/* MFA setup */}
            <div className="rounded-md border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-700" />
                  <div>
                    <div className="text-sm font-medium text-ink">Two-factor authentication (MFA)</div>
                    <div className="text-xs text-ink/50">
                      Status: {settings.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
                {settings.mfaEnabled ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setMfaModal(true)}>
                      View backup codes
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        await saveSettings({ mfaEnabled: false })
                        push('MFA disabled')
                      }}
                    >
                      Disable MFA
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={async () => {
                      await saveSettings({ mfaEnabled: true })
                      setMfaModal(true)
                      push('MFA enabled')
                    }}
                  >
                    Enable MFA
                  </Button>
                )}
              </div>
            </div>

            <Button onClick={savePlatform} disabled={saving}>
              {saving ? 'Saving…' : 'Save platform settings'}
            </Button>
          </div>
        </Card>
      )}

      {/* ==================== Account & Security ==================== */}
      {tab === 'security' && (
        <div className="space-y-5">
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-green-700" />
              Change password
            </CardTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ['current', 'Current password'],
                  ['next', 'New password'],
                  ['confirm', 'Confirm new password'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
                  <input
                    type="password"
                    value={passwords[key]}
                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                    className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={handlePassword}>Change password</Button>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-3">Login history (last 10)</CardTitle>
            <div className="overflow-x-auto rounded-md border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper-dim text-xs uppercase tracking-wide text-ink/50">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Time</th>
                    <th className="px-3 py-2 font-medium">IP address</th>
                    <th className="px-3 py-2 font-medium">Device</th>
                    <th className="px-3 py-2 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {LOGIN_HISTORY.map((entry) => (
                    <tr key={entry.id} className="border-t border-line">
                      <td className="px-3 py-2 text-ink">{entry.date}</td>
                      <td className="px-3 py-2 text-ink/60">{entry.time}</td>
                      <td className="px-3 py-2 tabular-nums text-ink/60">{entry.ip}</td>
                      <td className="px-3 py-2 text-ink/60">{entry.device}</td>
                      <td className="px-3 py-2 text-ink/60">{entry.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* MFA modal */}
      <Modal
        open={mfaModal}
        onClose={() => setMfaModal(false)}
        title="Two-factor authentication"
        footer={
          <Button onClick={() => setMfaModal(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-ink/60">
            Scan this QR code with your authenticator app (Google Authenticator, Authy…), then store the backup codes
            somewhere safe.
          </p>
          <div className="flex justify-center">
            <QrPattern />
          </div>
          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50">Backup codes</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {MFA_BACKUP_CODES.map((code) => (
                <code key={code} className="rounded-md bg-paper-dim px-2.5 py-1.5 text-center text-xs tabular-nums text-ink">
                  {code}
                </code>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
