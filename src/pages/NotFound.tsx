import { useNavigate } from 'react-router-dom'
import { BookOpenText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/60 blur-3xl" />

      <div className="relative">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-800 text-paper shadow-card">
            <BookOpenText className="h-6 w-6" />
          </span>
          <span className="font-display text-2xl font-semibold text-green-900">TILP</span>
        </div>

        {/* 404 number */}
        <div className="font-display text-[7rem] font-semibold leading-none tracking-tight text-ink/10 sm:text-[10rem]">
          404
        </div>

        <h1 className="-mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink/55">
          The page you're looking for doesn't exist or may have been moved. Head back and continue
          your learning journey.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate(-1 as never)} variant="outline">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Go back
          </Button>
          <Button onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}
