import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { BookOpenText, Check } from 'lucide-react'

export function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'signup' | 'verify'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [institution, setInstitution] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('verify')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <BookOpenText className="h-6 w-6 text-green-700" />
          <span className="font-display text-xl font-semibold text-green-900">TILP</span>
        </div>

        {step === 'signup' ? (
          <>
            <CardTitle className="text-center">Create your teacher account</CardTitle>
            <p className="mt-1 text-center text-sm text-ink/55">Free during the beta. No approval needed to get started.</p>

            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <Input
                label="Full name"
                placeholder="Ustaz Ahmed Rahman"
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
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helper="At least 12 characters"
                required
              />
              <Input
                label="Institution (optional)"
                placeholder="Al-Noor Quranic Academy"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
              <Button type="submit" className="w-full">Create account</Button>
            </form>

            <p className="mt-4 text-center text-sm text-ink/55">Already have an account? <button className="text-green-700 hover:underline" onClick={() => navigate('/login')}>Sign in</button></p>
          </>
        ) : (
          <>
            <div className="flex justify-center py-6">
              <div className="mx-auto h-10 w-10 text-green-600">
                <Check className="h-10 w-10" />
              </div>
            </div>

            <CardTitle className="text-center">Check your email</CardTitle>
            <p className="mt-3 font-display text-xl font-semibold text-ink">We sent a confirmation link to {email}</p>
            <p className="mt-1 text-sm text-ink/55">Verify your email to complete your account setup.</p>

            <Button onClick={() => navigate('/teacher')} className="mt-6 w-full">
              Continue to dashboard
            </Button>

            <p className="mt-4 text-center text-sm text-ink/55">Already have an account? <button className="text-green-700 hover:underline" onClick={() => navigate('/login')}>Sign in</button></p>
          </>
        )}
      </Card>
    </div>
  )
}
