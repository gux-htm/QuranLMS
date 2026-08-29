import { useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/common/Skeleton'

type AssignmentStatus = 'pending' | 'in_progress' | 'completed'
type Assignment = { id: string; title: string; assigned: string; deadline: string; status: AssignmentStatus; score?: number }
const assignments: Assignment[] = [
  { id: '1', title: 'Juz 1 · Pages 7–9', assigned: 'Today', deadline: 'Tomorrow', status: 'pending' },
  { id: '2', title: 'Juz 1 · Pages 4–6', assigned: 'Aug 20', deadline: 'Aug 27', status: 'completed', score: 92 },
  { id: '3', title: 'Noorani Qaida · Lesson 12', assigned: 'Aug 12', deadline: 'Aug 19', status: 'in_progress' },
]

export function StudentAssignments() {
  const [tab, setTab] = useState<'Pending' | 'Completed' | 'All'>('Pending')
  const navigate = useNavigate()
  const list = useMemo(() => tab === 'All' ? assignments : assignments.filter((a) => tab === 'Pending' ? a.status !== 'completed' : a.status === 'completed'), [tab])
  const actionLabel = (status: AssignmentStatus) => status === 'pending' ? 'Start lesson' : status === 'in_progress' ? 'Continue' : 'Review'

  return <div>
    <h1 className="font-display text-2xl font-semibold text-ink">Assignments</h1>
    <p className="mt-1 text-sm text-ink/55">Keep track of lessons your teacher has assigned.</p>
    <div className="mt-6 inline-flex rounded-md bg-paper-dim p-1">
      {(['Pending', 'Completed', 'All'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded px-4 py-2 text-sm ${tab === t ? 'bg-white text-green-700 shadow-sm' : 'text-ink/55'}`}>{t}</button>)}
    </div>
    <div className="mt-5 space-y-3">
      {list.length === 0 ? <EmptyState icon={<BookOpen />} title="Nothing here yet" description="Your assignments will appear here when your teacher sends them." /> : list.map((a) => <Card key={a.id}><CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>{a.title}</CardTitle><p className="mt-1 text-xs text-ink/55">Assigned {a.assigned} · Due {a.deadline}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs ${a.status === 'completed' ? 'bg-green-50 text-green-700' : a.status === 'in_progress' ? 'bg-sky-100 text-sky-700' : 'bg-gold-100 text-gold-800'}`}>{a.status === 'in_progress' ? 'In progress' : a.status === 'completed' ? 'Completed' : 'Pending'}{a.score ? ` · ${a.score}/100` : ''}</span><Button size="sm" variant={a.status === 'completed' ? 'outline' : 'default'} onClick={() => navigate(`/student/lesson/${a.id}`)}>{actionLabel(a.status)}</Button></div></CardContent></Card>)}
    </div>
  </div>
}
