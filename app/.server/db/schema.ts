import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { defaultNow, id } from './helpers'

export const workoutLogs = sqliteTable('workout_logs', {
  id: id(),
  completed_at: defaultNow(),
})
