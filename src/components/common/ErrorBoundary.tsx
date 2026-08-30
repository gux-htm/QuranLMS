import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { hasError: boolean }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const isLocalDevelopment = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    if (isLocalDevelopment) console.error('TILP page section error', error, info)
  }

  private reload = () => window.location.reload()

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <section className="rounded-lg border border-line bg-paper p-8 text-center" role="alert">
        <AlertTriangle className="mx-auto h-7 w-7 text-clay-600" />
        <h2 className="mt-3 font-display text-xl font-semibold text-ink">Something went wrong</h2>
        <p className="mt-1 text-sm text-ink/55">This section could not be loaded. Try reloading the page.</p>
        <Button className="mt-4" onClick={this.reload}>Reload page</Button>
      </section>
    )
  }
}
