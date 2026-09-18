import { useNavigate } from 'react-router-dom'
import { BookOpen, CalendarClock, Check, Inbox, X } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { initialsOf } from '@/lib/utils'

function startPointLabel(startTrack: 'qaida' | 'juz', startJuz: number | null) {
  return startTrack === 'qaida' ? 'Noorani Qaida' : `Start from Juz ${startJuz ?? 1}`
}

export function TeacherEnrollRequests() {
  const navigate = useNavigate()
  const { enrollRequests, approveEnrollRequest, rejectEnrollRequest } = useAppStore()

  const pending = enrollRequests.filter((r) => r.status === 'pending')
  const decided = enrollRequests.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Enroll requests</h1>
        <p className="mt-1 text-sm text-ink/55">
          {pending.length} pending · New student registrations appear here for your review
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-12 text-center">
          <Inbox className="mx-auto h-7 w-7 text-ink/25" />
          <p className="mt-3 font-medium text-ink">No pending requests</p>
          <p className="mt-1 text-sm text-ink/50">New student registrations will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((request) => (
            <Card key={request.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 font-display text-sm font-semibold text-sky-700">
                    {initialsOf(request.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{request.name}</div>
                    <div className="mt-0.5 truncate text-xs text-ink/50">
                      {request.email} · Submitted {format(new Date(request.submittedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => rejectEnrollRequest(request.id)}>
                    <X className="mr-1 h-4 w-4" />Reject
                  </Button>
                  <Button size="sm" onClick={() => approveEnrollRequest(request.id)}>
                    <Check className="mr-1 h-4 w-4" />Approve
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-line p-3.5">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Requested time</div>
                    <div className="mt-0.5 text-sm font-medium text-ink">{request.preferredTime}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-line p-3.5">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Starting point</div>
                    <div className="mt-0.5 text-sm font-medium text-ink">{startPointLabel(request.startTrack, request.startJuz)}</div>
                    <div className="text-xs text-ink/45">{request.startTrack === 'qaida' ? 'Beginner track' : 'Skips ahead to the selected Juz'}</div>
                  </div>
                </div>
              </div>

              {request.experience && (
                <p className="mt-3 rounded-2xl bg-paper-dim p-3.5 text-sm text-ink/70">
                  <span className="font-semibold text-ink">Student's note: </span>
                  {request.experience}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">Recently reviewed</h2>
          {decided.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink">{request.name}</div>
                  <div className="mt-0.5 truncate text-xs text-ink/50">
                    {request.preferredTime} · {startPointLabel(request.startTrack, request.startJuz)}
                  </div>
                </div>
                {request.status === 'approved' ? (
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Approved — now in Students</span>
                ) : (
                  <span className="rounded-full bg-clay-100 px-2.5 py-1 text-xs font-semibold text-clay-700">Rejected</span>
                )}
              </div>
            </Card>
          ))}
          <button onClick={() => navigate('/teacher/students')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900">
            Assign approved students to a class
          </button>
        </div>
      )}
    </div>
  )
}
