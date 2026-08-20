import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 text-center">
      <div>
        <h1 className="font-display text-4xl font-semibold text-ink">404</h1>
        <p className="mt-2 text-lg text-ink/60">Page not found</p>
        <Button onClick={() => navigate('/')} className="mt-6">Go home</Button>
      </div>
    </div>
  )
}
