import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardTitle } from '@/components/ui/Card'
import { BookOpenText } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const TIME_SLOTS = [
  'Weekdays after Fajr (6:00\u20137:00 AM)',
  'Weekdays after Asr (4:00\u20135:00 PM)',
  'Weekdays after Maghrib (6:30\u20137:30 PM)',
  'Weekend mornings (10:00\u201311:00 AM)',
  'Weekend evenings (5:00\u20136:00 PM)',
]

export function Enroll() {
  const navigate = useNavigate()
  const { submitEnrollRequest } = useAppStore()
  const [step, setStep] = useState<'details' | 'invited' | 'complete'>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [teacherName, setTeacherName] = useState('Ustaz Ahmed Rahman')
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[1])
  const [startTrack, setStartTrack] = useState<'qaida' | 'juz'>('qaida')
  const [startJuz, setStartJuz] = useState(1)
  const [experience, setExperience] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode) {
      setTeacherName('Ustaz Ahmed Rahman')
      setStep('invited')
    }
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitEnrollRequest({
      name,
      email,
      preferredTime,
      startTrack,
      startJuz: startTrack === 'juz' ? startJuz : null,
      experience: experience.trim(),
    })
    setStep('complete')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <BookOpenText className="h-6 w-6 text-green-700" />
          <span className="font-display text-xl font-semibold text-green-900">TILP</span>
        </div>

        {step === 'details' && (
          <>
            <CardTitle className="text-center">Create your student account</CardTitle>
            <p className="mt-1 text-center text-sm text-ink/55">Sign up to start tracking your Quran progress.</p>

            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <Input
                label="Full name"
                placeholder="Ahmed Malik"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Choose a password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Teacher's enrollment code"
                placeholder="Paste code from your teacher"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={!inviteCode}>Create account</Button>
            </form>

            <p className="mt-4 text-center text-sm text-ink/55">Already have an account? <button className="text-green-700 hover:underline" onClick={() => navigate('/login')}>Sign in</button></p>
          </>
        )}

        {step === 'invited' && (
          <>
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
              You've been invited by <strong>{teacherName}</strong>
            </div>

            <CardTitle className="text-center">Confirm your enrollment</CardTitle>
            <p className="mt-1 text-center text-sm text-ink/55">
              Tell your teacher when you're available and where you want to start.
            </p>

            <form onSubmit={handleInviteSubmit} className="mt-6 space-y-4">
              <div className="rounded-lg border border-line bg-white shadow-card">
                <div className="flex items-start justify-between gap-3 p-5 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{teacherName}</h3>
                    <p className="mt-1 text-sm text-ink/55">Tajweed specialist</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Preferred class time</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-700"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Where do you want to start?</label>
                <div className="space-y-2">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                      startTrack === 'qaida' ? 'border-green-600 bg-green-50' : 'border-line bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="startTrack"
                      checked={startTrack === 'qaida'}
                      onChange={() => setStartTrack('qaida')}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium text-ink">Noorani Qaida</span>
                      <span className="block text-xs text-ink/55">I'm a beginner and want to start from the basics</span>
                    </span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                      startTrack === 'juz' ? 'border-green-600 bg-green-50' : 'border-line bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="startTrack"
                      checked={startTrack === 'juz'}
                      onChange={() => setStartTrack('juz')}
                      className="mt-0.5"
                    />
                    <span className="flex-1">
                      <span className="font-medium text-ink">A specific Juz</span>
                      <span className="block text-xs text-ink/55">I can already read and want to start from a Juz</span>
                      {startTrack === 'juz' && (
                        <select
                          value={startJuz}
                          onChange={(e) => setStartJuz(Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 h-9 w-full rounded-md border border-line bg-white px-2 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-700"
                        >
                          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                            <option key={juz} value={juz}>
                              Juz {juz}
                            </option>
                          ))}
                        </select>
                      )}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Anything your teacher should know? (optional)</label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. I finished Qaida last year and revised Juz 1\u20132 at home"
                  rows={2}
                  className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              </div>

              <Button type="submit" className="w-full">Send enrollment request</Button>
            </form>
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="py-6 text-center">
              <div className="mx-auto h-10 w-10 text-green-600">
                <BookOpenText className="h-10 w-10" />
              </div>
            </div>

            <CardTitle className="text-center">Request sent!</CardTitle>
            <p className="mt-3 text-center text-sm text-ink/55">
              Your enrollment request was sent to {teacherName}. They'll review your preferred time and starting
              point, then approve your enrollment.
            </p>

            <Button onClick={() => navigate('/student')} className="mt-6 w-full">
              Go to my dashboard
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
