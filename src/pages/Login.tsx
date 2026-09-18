import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowRight } from 'lucide-react'
import { AuthBrandPanel, AuthMobileLogo } from '@/components/common/AuthBrandPanel'

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
      <AuthBrandPanel
        arabic="اِقْرَأْ بِاسْمِ رَبِّكَ"
        translation='"Recite in the name of your Lord." — Al-Alaq 96:1'
        features={[
          'Lesson planning and scheduling',
          'Daily progress tracking',
          'Student reports and insights',
        ]}
        footer={`© ${new Date().getFullYear()} TILP. Making Quran learning achievable.`}
        extraRing
      />

      {/* ── Right form panel ────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-paper px-5 py-12 sm:px-10">
        <AuthMobileLogo />

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
