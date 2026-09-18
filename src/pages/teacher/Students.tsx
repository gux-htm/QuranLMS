import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Flame, Search, UserPlus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'
import { initialsOf } from '@/lib/utils'

export function TeacherStudents() {
  const navigate = useNavigate(); const { students, classes, getClass } = useAppStore(); const { push } = useToast()
  const [search, setSearch] = useState(''); const [classFilter, setClassFilter] = useState('all')
  const filtered = students.filter((student) => { const q = search.trim().toLowerCase(); const matchesSearch = !q || student.name.toLowerCase().includes(q) || student.email.toLowerCase().includes(q); const matchesClass = classFilter === 'all' ? true : classFilter === 'none' ? student.classId === null : student.classId === classFilter; return matchesSearch && matchesClass })
  const generateLink = async () => { const url = 'https://tilp.app/enroll?teacher=teacher-1'; await navigator.clipboard.writeText(url); push('Enrollment link copied to clipboard') }
  return <div className="space-y-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Students</h1>
        <p className="mt-1 text-sm text-ink/55">{students.length} enrolled students · Select a student to review pace and calendar</p>
      </div>
      <Button onClick={generateLink}><UserPlus className="mr-1.5 h-4 w-4" />Copy enrollment link</Button>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1"><Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} /></div>
      <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-700">
        <option value="all">All classes</option><option value="none">Not enrolled</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
    {students.length === 0
      ? <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-12 text-center"><UserPlus className="mx-auto h-7 w-7 text-ink/25" /><p className="mt-3 font-medium text-ink">No students yet</p><p className="mt-1 text-sm text-ink/50">Generate an enrollment link and share it with your students.</p><Button className="mt-5" onClick={generateLink}>Copy enrollment link</Button></div>
      : filtered.length === 0
      ? <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-8 text-center"><p className="text-sm text-ink/55">No students match your filters.</p></div>
      : <div className="space-y-3">{filtered.map((student) => {
          const studentClass = student.classId ? getClass(student.classId) : undefined
          const progress = student.totalUnits > 0 ? Math.round((student.unitsCompleted / student.totalUnits) * 100) : 0
          return (
            <div key={student.id} onClick={() => navigate(`/teacher/students/${student.id}`)} className="cursor-pointer">
              <Card className="p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 font-display text-sm font-semibold text-green-800">{initialsOf(student.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{student.name}</span>
                      {studentClass ? <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">{studentClass.name}</span> : <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-800">Not enrolled</span>}
                    </div>
                    <div className="truncate text-xs text-ink/50 mt-0.5">{student.email}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 w-full max-w-[200px] rounded-full bg-line"><div className="h-full rounded-full bg-green-600" style={{ width: `${progress}%` }} /></div>
                      <span className="text-xs text-ink/50">{progress}%</span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="text-sm font-semibold text-ink">{student.pace.quantity} {student.pace.unit}/day</div>
                    <div className="mt-0.5 text-xs text-ink/50">Avg {student.avgScore}%</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-clay-600"><Flame className="h-3.5 w-3.5" />{student.streak}d streak</div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink/25" />
                </div>
              </Card>
            </div>
          )
        })}</div>
    }
  </div>
}
