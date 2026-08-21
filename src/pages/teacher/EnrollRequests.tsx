import { useNavigate } from 'react-router-dom'
import { BookOpen, CalendarClock, Check, Inbox, X } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { initialsOf } from '@/pages/teacher/Students'

function startPointLabel(startTrack: 'qaida' | 'juz', startJuz: number | null) {
  return startTrack === 'qaida' ? 'Noorani Qaida' : `Start from Juz ${startJuz ?? 1}`
}

export function TeacherEnrollRequests() {
  const navigate = useNavigate()
  const { enrollRequests, approveEnrollRequest, rejectEnrollRequest } = useAppStore()

  const pending = enrollRequests.filter((r) => r.status === 'pending')
  const decided = enrollRequests.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Enroll requests</h1>
        <p className="mt-1 text-sm text-ink/55">
          {pending.length} pending • New student registrations appear here for your review
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <div className="flex items-center gap-3 text-sm text-ink/55">
            <Inbox className="h-5 w-5" />
            No pending requests. New registrations will show up here.
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((request) => (
            <Card key={request.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 font-display text-sm font-semibold text-sky-700">
                    {initialsOf(request.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{request.name}</div>
                    <div className="truncate text-xs text-ink/55">
                      {request.email} • Submitted {format(new Date(request.submittedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => rejectEnrollRequest(request.id)}>
                    <X className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => approveEnrollRequest(request.id)}>
                    <Check className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-md border border-line p-3">
                  <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                  <div>
                    <div className="text-xs text-ink/50">Requested time</div>
                    <div className="text-sm font-medium text-ink">{request.preferredTime}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border border-line p-3">
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
                  <div>
                    <div className="text-xs text-ink/50">Starting point</div>
                    <div className="text-sm font-medium text-ink">
                      {startPointLabel(request.startTrack, request.startJuz)}
                    </div>
                    <div className="text-xs text-ink/50">
                      {request.startTrack === 'qaida' ? 'Beginner track' : 'Skips ahead to the selected Juz'}
                    </div>
                  </div>
                </div>
              </div>

              {request.experience && (
                <p className="mt-3 rounded-md bg-paper-dim p-3 text-sm text-ink/70">
                  <span className="font-medium text-ink">Student's note: </span>
                  {request.experience}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div className="space-y-3">
          <CardTitle>Recently reviewed</CardTitle>
          {decided.map((request) => (
            <Card key={request.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">{request.name}</div>
                  <div className="truncate text-xs text-ink/55">
                    {request.preferredTime} • {startPointLabel(request.startTrack, request.startJuz)}
                  </div>
                </div>
                {request.status === 'approved' ? (
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    Approved — now in Students
                  </span>
                ) : (
                  <span className="rounded-full bg-clay-100 px-2.5 py-1 text-xs font-medium text-clay-700">
                    Rejected
                  </span>
                )}
              </div>
            </Card>
          ))}
          <button
            onClick={() => navigate('/teacher/students')}
            className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
          >
            Assign approved students to a class
          </button>
        </div>
      )}
    </div>
  )
}
