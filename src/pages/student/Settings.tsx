import { useState } from 'react'
import { Bell, Globe, Lock, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'
import { initialsOf } from '@/lib/utils'
import { CURRENT_STUDENT } from '@/lib/mockData'

export function StudentSettings() {
  const { push } = useToast()
  const [language, setLanguage] = useState('English')
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/55">Manage your preferences and account security.</p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <CardTitle>Profile</CardTitle>
            <p className="mt-1 text-sm text-ink/50">Your account information.</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <User className="h-4 w-4" />
          </span>
        </div>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-paper/60 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 font-display text-lg font-semibold text-green-800">
              {initialsOf(CURRENT_STUDENT.name)}
            </div>
            <div>
              <div className="text-base font-semibold text-ink">{CURRENT_STUDENT.name}</div>
              <div className="mt-0.5 text-sm text-ink/50">{CURRENT_STUDENT.email}</div>
              <div className="mt-0.5 text-xs text-ink/40">{CURRENT_STUDENT.className} · {CURRENT_STUDENT.teacherName}</div>
            </div>
          </div>
          <p className="text-xs text-ink/45">
            Contact your teacher to update your display name or class information.
          </p>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <CardTitle>Preferences</CardTitle>
            <p className="mt-1 text-sm text-ink/50">Customise your learning experience.</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <Globe className="h-4 w-4" />
          </span>
        </div>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="language-select">
              Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-600/30"
            >
              <option>English</option>
              <option>Arabic</option>
              <option>Urdu</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-line bg-paper/60 p-4">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-ink/50" />
                <span className="text-sm font-medium text-ink">Notifications</span>
              </div>
              <p className="mt-0.5 text-xs text-ink/45">Receive reminders and lesson updates.</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-line after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
            </label>
          </div>

          <Button onClick={() => push('Preferences saved')}>Save preferences</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <CardTitle>Security</CardTitle>
            <p className="mt-1 text-sm text-ink/50">Update your account password.</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay-100 text-clay-600">
            <Lock className="h-4 w-4" />
          </span>
        </div>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      {/* Account info */}
      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <CardTitle>Account information</CardTitle>
            <p className="mt-1 text-sm text-ink/50">Read-only details about your account.</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper-dim text-ink/50">
            <Settings className="h-4 w-4" />
          </span>
        </div>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Class', value: CURRENT_STUDENT.className },
              { label: 'Teacher', value: CURRENT_STUDENT.teacherName },
              { label: 'Current rank', value: `#${CURRENT_STUDENT.rank} of ${CURRENT_STUDENT.totalStudents}` },
              { label: 'Total points', value: String(CURRENT_STUDENT.points) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <span className="text-sm text-ink/55">{item.label}</span>
                <span className="text-sm font-medium text-ink">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PasswordForm() {
  const { push } = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')

  return (
    <div className="space-y-3">
      <Input
        type="password"
        label="Current password"
        placeholder="Enter current password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <Input
        type="password"
        label="New password"
        placeholder="At least 8 characters"
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />
      <Button
        variant="outline"
        onClick={() => {
          if (!current || next.length < 8) {
            push('Complete the fields and use at least 8 characters')
            return
          }
          push('Password changed successfully')
        }}
      >
        Change password
      </Button>
    </div>
  )
}
