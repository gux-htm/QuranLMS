import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface SkeletonProps { width?: string; height?: string; borderRadius?: string }
export function Skeleton({ width = '100%', height = '1rem', borderRadius = '0.375rem' }: SkeletonProps) {
  return <div className="animate-pulse bg-paper-dim" style={{ width, height, borderRadius }} aria-hidden="true" />
}

interface EmptyStateProps { icon: ReactNode; title: string; description: string; action?: ReactNode }
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return <div className="rounded-lg border border-line bg-white px-6 py-12 text-center shadow-sm"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">{icon}</div><h2 className="font-display text-xl font-semibold text-ink">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-ink/55">{description}</p>{action && <div className="mt-5">{action}</div>}</div>
}

export function PageLoader() { return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-paper-dim border-t-green-600" aria-label="Loading" /></div> }

export function ErrorFallback() { return <EmptyState icon={<span>!</span>} title="Something went wrong" description="Please try again. If the problem continues, return to your dashboard." action={<Button onClick={() => window.location.reload()}>Try again</Button>} /> }
