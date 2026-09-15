import { StudentAchievements } from './Achievements'
import { StudentLeaderboard } from './Leaderboard'
import { PointsHistory } from '@/components/student/PointsHistory'

export function StudentAchievementsWithPoints() {
  return (
    <div className="space-y-7">
      <StudentAchievements />
      <PointsHistory />
    </div>
  )
}

export function StudentLeaderboardWithPoints() {
  return (
    <div className="space-y-7">
      <StudentLeaderboard />
      <PointsHistory />
    </div>
  )
}
