import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { BookOpenText } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'teacher' | 'student'>('teacher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login
    if (userType === 'teacher') {
      navigate('/teacher')
    } else {
      navigate('/student')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <BookOpenText className="h-6 w-6 text-green-700" />
          <span className="font-display text-xl font-semibold text-green-900">TILP</span>
        </div>

        <CardTitle className="text-center">Sign in as</CardTitle>
        <p className="mt-1 text-center text-sm text-ink/55">New teacher? <button className="text-green-700 hover:underline" onClick={() => navigate('/signup')}>Create an account</button></p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-md bg-paper-dim p-1">
          <button
            onClick={() => setUserType('teacher')}
            className={`rounded py-2.5 font-medium transition-colors ${
              userType === 'teacher' ? 'bg-white text-green-700 shadow-sm' : 'text-ink/60'
            }`}
          >
            Teacher
          </button>
          <button
            onClick={() => setUserType('student')}
            className={`rounded py-2.5 font-medium transition-colors ${
              userType === 'student' ? 'bg-white text-green-700 shadow-sm' : 'text-ink/60'
            }`}
          >
            Student
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="ustaz@example.com"
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
            required
          />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/55">Don't have an account? <button className="text-green-700 hover:underline" onClick={() => navigate('/signup')}>Sign up</button></p>
      </Card>
    </div>
  )
}
