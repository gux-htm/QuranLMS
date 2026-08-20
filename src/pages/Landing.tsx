import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { BookOpenText } from 'lucide-react'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-paper text-ink">
      <nav className="flex items-center justify-between border-b border-line px-6 py-4">
        <div className="flex items-center gap-2 font-display text-lg font-semibold text-green-900">
          <BookOpenText className="h-6 w-6 text-green-700" />
          TILP
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
          <Button onClick={() => navigate('/signup')}>Get started</Button>
        </div>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-3 font-arabic text-2xl text-green-700">وَزِيل الْقُرْآن تَدْرِيجًا</div>
        <h1 className="mb-5 font-display text-4xl font-semibold leading-tight text-ink">
          Know exactly where your recitation stands, and when you'll finish.
        </h1>
        <p className="mt-4 max-w-lg text-ink/60">
          TILP gives Tajweed teachers a calendar-driven way to assign lessons, mark attendance, and score recitation — and gives
          students a clear, honest countdown to completing the Quran.
        </p>

        <div className="mt-8 flex gap-3">
          <Button size="lg" onClick={() => navigate('/signup')}>I'm a teacher</Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/enroll')}>I'm a student</Button>
        </div>

        <footer className="mt-auto border-t border-line px-6 py-6 text-center text-xs text-ink/40">
          TILP makes Quranic learning collaborative, transparent, and achievable.
        </footer>
      </div>
    </div>
  )
}
