import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Pages
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Enroll } from '@/pages/Enroll'
import { NotFound } from '@/pages/NotFound'
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import { TeacherSchedule } from '@/pages/teacher/Schedule'
import { TeacherSessionLesson } from '@/pages/teacher/SessionLesson'
import { TeacherStudents } from '@/pages/teacher/Students'
import { TeacherStudentDetail } from '@/pages/teacher/StudentDetail'
import { TeacherClasses } from '@/pages/teacher/Classes'
import { TeacherClassDetail } from '@/pages/teacher/ClassDetail'
import { TeacherEnrollRequests } from '@/pages/teacher/EnrollRequests'
import { TeacherCurriculum } from '@/pages/teacher/CurriculumPage'
import { TeacherSettings } from '@/pages/teacher/SettingsPage'
import { TeacherLessonView } from '@/pages/teacher/LessonViewPage'
import { TeacherStudentReports } from '@/pages/teacher/StudentReportsPage'
import { TeacherClassAnalytics } from '@/pages/teacher/ClassAnalyticsPage'
import { TeacherReportsIndex } from '@/pages/teacher/ReportsIndex'
import { StudentDashboard } from '@/pages/student/Dashboard'
import { StudentCalendar } from '@/pages/student/Calendar'
import { StudentReports } from '@/pages/student/Reports'
import { StudentAchievements } from '@/pages/student/Achievements'

// Layouts
import { TeacherLayout } from '@/components/layout/TeacherLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'

// Shared data store
import { AppStoreProvider } from '@/lib/store'
import { ToastProvider } from '@/components/ui/Toaster'

export default function App() {
  return (
    <Router>
      <AppStoreProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/enroll" element={<Enroll />} />

            {/* Teacher routes */}
            <Route element={<TeacherLayout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/schedule" element={<TeacherSchedule />} />
              <Route path="/teacher/schedule/:sessionId" element={<TeacherSessionLesson />} />
              <Route path="/teacher/students" element={<TeacherStudents />} />
              <Route path="/teacher/students/:studentId" element={<TeacherStudentDetail />} />
              <Route path="/teacher/classes" element={<TeacherClasses />} />
              <Route path="/teacher/classes/:classId" element={<TeacherClassDetail />} />
              <Route path="/teacher/enrollments" element={<TeacherEnrollRequests />} />
              <Route path="/teacher/curriculum" element={<TeacherCurriculum />} />
              <Route path="/teacher/reports" element={<TeacherReportsIndex />} />
              <Route path="/teacher/settings" element={<TeacherSettings />} />
              <Route path="/teacher/sessions/:sessionId/lesson" element={<TeacherLessonView />} />
              <Route path="/teacher/students/:studentId/reports" element={<TeacherStudentReports />} />
              <Route path="/teacher/classes/:classId/analytics" element={<TeacherClassAnalytics />} />
            </Route>

            {/* Student routes */}
            <Route element={<StudentLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/calendar" element={<StudentCalendar />} />
              <Route path="/student/reports" element={<StudentReports />} />
              <Route path="/student/achievements" element={<StudentAchievements />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AppStoreProvider>
    </Router>
  )
}
