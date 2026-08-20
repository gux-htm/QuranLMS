import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardTitle } from '@/components/ui/Card'
import { BookOpenText } from 'lucide-react'

export function Enroll() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'details' | 'invited' | 'complete'>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [teacherName, setTeacherName] = useState('Ustaz Ahmed Rahman')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode) {
      setTeacherName('Ustaz Ahmed Rahman')
      setStep('invited')
    }
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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

            <form onSubmit={handleInviteSubmit} className="mt-6 space-y-4">
              <div className="rounded-lg border border-line bg-white shadow-card">
                <div className="flex items-start justify-between gap-3 p-5 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{teacherName}</h3>
                    <p className="mt-1 text-sm text-ink/55">Tajweed specialist</p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">Confirm enrollment</Button>
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

            <CardTitle className="text-center">Welcome to TILP!</CardTitle>
            <p className="mt-3 text-center text-sm text-ink/55">You're now enrolled in {teacherName}'s class. Start your Quranic journey today.</p>

            <Button onClick={() => navigate('/student')} className="mt-6 w-full">
              Go to my dashboard
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
