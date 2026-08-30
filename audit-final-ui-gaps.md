# TILP Frontend Audit — 2026-08-30

## Audit inventory

### Routes confirmed on main
- `/`, `/login`, `/signup`, `/enroll`, `/verify-email`, `/forgot-password`, `/reset-password`
- Teacher: `/teacher`, `/teacher/dashboard`, `/teacher/schedule`, `/teacher/schedule/:sessionId`, `/teacher/students`, `/teacher/students/:studentId`, `/teacher/classes`, `/teacher/classes/:classId`, `/teacher/enrollments`, `/teacher/curriculum`, `/teacher/reports`, `/teacher/settings`, `/teacher/sessions/:sessionId/lesson`, `/teacher/students/:studentId/reports`, `/teacher/classes/:classId/analytics`
- Student: `/student`, `/student/dashboard`, `/student/lesson`, `/student/lesson/:id`, `/student/assignments`, `/student/calendar`, `/student/reports`, `/student/achievements`, `/student/leaderboard`, `/student/settings`
- Wildcard `*` → `NotFound`

### Reusable components confirmed
Card, Button, Input, Modal, Toaster, AudioPlayer, NotificationsPanel, charts, AssignmentModal, CurriculumCard, MistakeLogger, ReportPreviewModal, ScheduleSessionModal, ScoringRubric.

## Gap verdicts
- MFA setup — EXISTS & WIRED
- Individual student profile — EXISTS & WIRED
- Assign lesson modal — EXISTS & WIRED
- Pace adjustment modal — EXISTS & WIRED
- Teacher settings — EXISTS & WIRED
- Student achievements — EXISTS & WIRED
- Dashboard milestone/progress surface — EXISTS & WIRED
- 404 page — EXISTS & WIRED
- Calendar day-detail popover — EXISTS BUT BROKEN: day selection existed, but no cell popover was rendered
- Lesson creation — DOES NOT EXIST: added `/teacher/lessons/new`
- React ErrorBoundary — DOES NOT EXIST: added and used around routed page content

## Final-gap changes
Only confirmed missing/broken items were added or wired. Existing completed features were preserved rather than duplicated.
