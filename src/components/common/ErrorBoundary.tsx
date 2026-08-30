import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props { children: ReactNode; fallbackTitle?: string }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(): State { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { if (import.meta.env.DEV) console.error('Page section error', error, info) }
  render() {
    if (this.state.hasError) return <div className="rounded-2xl border border-line bg-paper p-8 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-clay-700" /><h2 className="mt-3 font-display text-xl font-semibold text-ink">{this.props.fallbackTitle ?? 'Something went wrong'}</h2><p className="mt-1 text-sm text-ink/55">Please reload the page and try again.</p><Button className="mt-5" onClick={() => window.location.reload()}>Reload page</Button></div>
    return this.props.children
  }
}
