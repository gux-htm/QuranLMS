import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Button, Card, CardContent, CardTitle } from '@/components/ui'
import { useToast } from '@/components/ui/Toaster'

export function VerifyEmail() {
  const { search } = useLocation(); const navigate = useNavigate(); const { push } = useToast();
  const [resending, setResending] = useState(false); const verifying = new URLSearchParams(search).has('token')
  const [verified, setVerified] = useState(false)
  useEffect(() => { if (!verifying) return; const timer = window.setTimeout(() => setVerified(true), 700); const redirect = window.setTimeout(() => navigate('/teacher'), 2700); return () => { clearTimeout(timer); clearTimeout(redirect) } }, [verifying, navigate])
  const resend = async () => { setResending(true); await new Promise(r => setTimeout(r, 500)); push('Verification email sent'); setResending(false) }
  return <main className="min-h-screen bg-paper px-4 py-16"><Card className="mx-auto max-w-md text-center"><CardContent className="space-y-6 py-10">{verifying && !verified ? <><Loader2 className="mx-auto h-12 w-12 animate-spin text-green-700" /><CardTitle>Verifying…</CardTitle><p className="text-sm text-ink/55">Please wait while we verify your email.</p></> : verified ? <><CheckCircle2 className="mx-auto h-12 w-12 text-green-700" /><CardTitle>Email verified!</CardTitle><p className="text-sm text-ink/55">Redirecting to your dashboard…</p></> : <><Mail className="mx-auto h-12 w-12 text-green-700" /><CardTitle>Check your email</CardTitle><p className="text-sm text-ink/55">A verification link has been sent to your email address.</p><Button onClick={resend} disabled={resending}>{resending ? 'Sending…' : 'Resend email'}</Button><Link className="block text-sm text-green-700" to="/signup">Change email</Link></>}</CardContent></Card></main>
}
