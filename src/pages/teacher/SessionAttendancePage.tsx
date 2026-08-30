import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { TEACHER_SCHEDULE } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { TeacherSessionLesson } from '@/pages/teacher/SessionLesson'

export function TeacherSessionAttendancePage() {
  const { sessionId } = useParams(); const { students, sessionAttendance, markAttendance } = useAppStore(); const [reason, setReason] = useState('')
  const session = TEACHER_SCHEDULE.find((item) => item.id === sessionId); const student = students.find((item) => item.name === session?.studentName)
  if (!session || !student || !sessionId) return <TeacherSessionLesson />
  const key = `${sessionId}:${student.id}`; const current = sessionAttendance[key] ?? sessionAttendance[sessionId]
  const related = TEACHER_SCHEDULE.filter((item) => item.className === session.className && item.date === session.date)
  const records = related.map((item) => { const member = students.find((s) => s.name === item.studentName); return member ? sessionAttendance[`${item.id}:${member.id}`] ?? sessionAttendance[item.id] : undefined })
  const present = records.filter((record) => record?.status === 'present' || record?.status === 'late').length; const absent = records.filter((record) => record?.status === 'absent').length; const notMarked = related.length - present - absent; const rate = related.length ? Math.round((present / related.length) * 100) : 0
  return <div className="space-y-6"><Card className="border-green-200"><CardTitle className="mb-3">Attendance</CardTitle><CardContent className="space-y-3"><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-sm font-medium text-ink">Attendance:</span>{(['present','late','absent'] as const).map((status) => { const selected = current?.status === status || (!current && status === 'present'); const label = status[0].toUpperCase() + status.slice(1); const selectedClass = status === 'present' ? 'bg-green-100 text-green-700 ring-1 ring-green-300' : status === 'late' ? 'bg-gold-100 text-gold-800 ring-1 ring-gold-300' : 'bg-clay-100 text-clay-700 ring-1 ring-clay-300'; return <button key={status} onClick={() => markAttendance(sessionId, status, student.id, status === 'absent' ? reason : undefined)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${selected ? selectedClass : 'bg-paper-dim text-ink/55 hover:bg-paper'}`}>{label}</button> })}</div>{current?.status === 'absent' && <Input label="Reason (optional)" placeholder="e.g. Sick, Emergency" value={reason} onChange={(e) => setReason(e.target.value)} />}</CardContent></Card>
    <Card><CardTitle className="mb-3">Attendance summary</CardTitle><CardContent className="grid gap-3 sm:grid-cols-4"><div className="rounded-lg bg-green-50 p-3"><div className="text-xs text-ink/50">Present</div><div className="font-display text-xl font-semibold text-green-700">{present}</div></div><div className="rounded-lg bg-clay-100/60 p-3"><div className="text-xs text-ink/50">Absent</div><div className="font-display text-xl font-semibold text-clay-700">{absent}</div></div><div className="rounded-lg bg-paper-dim p-3"><div className="text-xs text-ink/50">Not marked</div><div className="font-display text-xl font-semibold text-ink">{notMarked}</div></div><div className="rounded-lg bg-sky-100 p-3"><div className="text-xs text-ink/50">Attendance rate</div><div className="font-display text-xl font-semibold text-sky-700">{rate}%</div></div></CardContent></Card>
    <TeacherSessionLesson />
  </div>
}
