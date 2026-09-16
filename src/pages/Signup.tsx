import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowRight, BookOpenText, CheckCircle2 } from 'lucide-react'

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
      {/* ── Left brand panel ────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-green-900 px-10 py-12 lg:flex lg:w-[42%]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-10 top-1/3 h-40 w-40 rounded-full border border-white/10" />

        <button onClick={() => navigate('/')} className="relative flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-paper">
            <BookOpenText className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold text-paper">TILP</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/50">
              Teacher workspace
            </span>
          </span>
        </button>

        <div className="relative">
          <p className="font-arabic text-4xl leading-relaxed text-paper/90">
            وَعَلَّمَ آدَمَ الْأَسْمَاءَ
          </p>
          <p className="mt-3 text-sm leading-6 text-paper/55">
            "And He taught Adam all the names." — Al-Baqarah 2:31
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Create and manage your classes',
              'Plan daily lessons and assign targets',
              'Track student progress automatically',
              'Send reports to students and parents',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-paper/60">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-300" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-paper/35">
          © {new Date().getFullYear()} TILP. Free during beta.
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-paper px-5 py-12 sm:px-10">
        {/* Mobile logo */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 lg:hidden"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-800 text-paper">
            <BookOpenText className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold text-green-900">TILP</span>
        </button>

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
              {/* Verify step */}
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

              <Button
                onClick={() => navigate('/teacher')}
                className="group mt-7 w-full"
              >
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
