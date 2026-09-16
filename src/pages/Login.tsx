import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowRight, BookOpenText } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'teacher' | 'student'>('teacher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(userType === 'teacher' ? '/teacher' : '/student')
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel ────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-green-900 px-10 py-12 lg:flex lg:w-[42%]">
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-10 top-1/3 h-40 w-40 rounded-full border border-white/10" />

        {/* Logo */}
        <button onClick={() => navigate('/')} className="relative flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-paper">
            <BookOpenText className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold text-paper">TILP</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/50">
              Quran learning
            </span>
          </span>
        </button>

        {/* Arabic verse */}
        <div className="relative">
          <p className="font-arabic text-4xl leading-relaxed text-paper/90">
            اِقْرَأْ بِاسْمِ رَبِّكَ
          </p>
          <p className="mt-3 text-sm leading-6 text-paper/55">
            "Recite in the name of your Lord." — Al-Alaq 96:1
          </p>
          <div className="mt-8 space-y-3 text-sm text-paper/60">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              Lesson planning and scheduling
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              Daily progress tracking
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              Student reports and insights
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="relative text-xs text-paper/35">
          © {new Date().getFullYear()} TILP. Making Quran learning achievable.
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
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink/55">
            Sign in to continue your learning journey.
          </p>

          {/* Role toggle */}
          <div className="mt-6 flex rounded-xl border border-line bg-paper-dim p-1">
            {(['teacher', 'student'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setUserType(role)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-150 ${
                  userType === role
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-ink/55 hover:text-ink'
                }`}
              >
                {role === 'teacher' ? 'Teacher' : 'Student'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="mt-1.5 text-right">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-green-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <Button type="submit" className="group w-full">
              Sign in
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/55">
            Don't have an account?{' '}
            <button
              className="font-medium text-green-700 hover:underline"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </p>
          <p className="mt-2 text-center text-sm text-ink/55">
            Joining as a student?{' '}
            <button
              className="font-medium text-green-700 hover:underline"
              onClick={() => navigate('/enroll')}
            >
              Use an enrollment code
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
