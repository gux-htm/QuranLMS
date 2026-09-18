import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { AuthBrandPanel, AuthMobileLogo } from '@/components/common/AuthBrandPanel'

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
    <div className="flex min-h-screen">
      <AuthBrandPanel
        arabic="وَعَلَّمَ آدَمَ الْأَسْمَاءَ"
        translation='"And He taught Adam all the names." — Al-Baqarah 2:31'
        features={[
          'Create and manage your classes',
          'Plan daily lessons and assign targets',
          'Track student progress automatically',
          'Send reports to students and parents',
        ]}
        footer={`© ${new Date().getFullYear()} TILP. Free during beta.`}
        featureStyle="check"
      />

      {/* ── Right form panel ────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-paper px-5 py-12 sm:px-10">
        <AuthMobileLogo />

        <div className="w-full max-w-sm">
          {step === 'signup' ? (
            <>
              <h1 className="font-display text-2xl font-semibold text-ink">
                Create your teacher account
              </h1>
              <p className="mt-1 text-sm text-ink/55">
                Free during the beta. No approval needed to get started.
              </p>

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
                <Button type="submit" className="group w-full">
                  Create account
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-ink/55">
                Already have an account?{' '}
                <button
                  className="font-medium text-green-700 hover:underline"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
                Check your email
              </h1>
              <p className="mt-2 text-sm leading-6 text-ink/55">
                We sent a confirmation link to{' '}
                <span className="font-medium text-ink">{email || 'your email'}</span>. Verify it
                to complete your account setup.
              </p>

              <Button onClick={() => navigate('/teacher')} className="group mt-7 w-full">
                Continue to dashboard
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <button
                onClick={() => setStep('signup')}
                className="mt-4 w-full text-center text-sm text-ink/50 hover:text-ink"
              >
                Back to sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
