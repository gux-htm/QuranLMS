import { useMemo, useState } from 'react'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, CardContent, CardTitle } from '@/components/ui'

type AssignmentStatus = 'Pending' | 'Completed'
type Assignment = { id: string; title: string; assigned: string; deadline: string; status: AssignmentStatus; completed?: string; score?: number }

// TODO: replace with API call
const assignments: Assignment[] = [
  { id: 'a1', title: 'Juz 1 · Pages 7–9', assigned: 'Aug 28, 2026', deadline: 'Sep 2, 2026', status: 'Pending' },
  { id: 'a2', title: 'Al-Fatiha · Revision', assigned: 'Aug 22, 2026', deadline: 'Aug 27, 2026', status: 'Pending' },
  { id: 'a3', title: 'Juz 1 · Pages 4–6', assigned: 'Aug 18, 2026', deadline: 'Aug 25, 2026', status: 'Completed', completed: 'Aug 24, 2026', score: 92 },
]

export function StudentAssignments() {
  const [tab, setTab] = useState<'Pending' | 'Completed' | 'All'>('Pending')
  const visible = useMemo(() => tab === 'All' ? assignments : assignments.filter(a => a.status === tab), [tab])
  return <div className="space-y-6">
    <div><h1 className="font-display text-2xl font-semibold text-ink">Assignments</h1><p className="mt-1 text-sm text-ink/55">Keep track of lessons assigned by your teacher.</p></div>
    <div className="inline-flex rounded-lg border border-line bg-paper-dim p-1">{(['Pending','Completed','All'] as const).map(item => <button key={item} onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-sm ${tab === item ? 'bg-paper text-ink shadow-sm' : 'text-ink/55'}`}>{item}</button>)}</div>
    {visible.length === 0 ? <Card><CardContent className="py-12 text-center"><BookOpen className="mx-auto mb-3 text-green-700" /><p className="font-medium text-ink">No {tab.toLowerCase()} assignments</p><p className="mt-1 text-sm text-ink/55">Your teacher will add lessons when they are ready.</p></CardContent></Card> : <div className="space-y-3">{visible.map(item => <Card key={item.id}><CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>{item.title}</CardTitle><p className="mt-1 text-sm text-ink/55">Assigned {item.assigned} · {item.status === 'Completed' ? `Completed ${item.completed}` : <>Due <span className={item.deadline === 'Aug 27, 2026' ? 'text-clay-700' : ''}>{item.deadline}</span></>}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-gold-100 text-gold-800'}`}>{item.status}{item.score ? ` · ${item.score}/100` : ''}</span>{item.status === 'Completed' ? <CheckCircle2 className="text-green-700" size={18} /> : <Link to="/student/lesson"><Button size="sm">Open lesson</Button></Link>}</div></CardContent></Card>)}</div>}
  </div>
}
