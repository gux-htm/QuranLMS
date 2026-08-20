import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Enroll } from '@/pages/Enroll'
import { NotFound } from '@/pages/NotFound'
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import { StudentDashboard } from '@/pages/student/Dashboard'

// Layouts
import { TeacherLayout } from '@/components/layout/TeacherLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'

// Placeholder components for other routes
function Placeholder({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      <div className="rounded-lg border border-line bg-white p-8 text-center">
        <p className="text-ink/60">{title} content coming soon...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/enroll" element={<Enroll />} />

        {/* Teacher routes */}
        <Route element={<TeacherLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<Placeholder title="Manage Classes" />} />
          <Route path="/teacher/classes/:classId" element={<Placeholder title="Class Details" />} />
          <Route path="/teacher/attendance" element={<Placeholder title="Mark Attendance" />} />
          <Route path="/teacher/lessons" element={<Placeholder title="Create Lessons" />} />
        </Route>

        {/* Student routes */}
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/calendar" element={<Placeholder title="Calendar" />} />
          <Route path="/student/reports" element={<Placeholder title="Reports" />} />
          <Route path="/student/achievements" element={<Placeholder title="Achievements" />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
