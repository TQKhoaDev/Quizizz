import type { Session } from "../api/sessionApi"
import { SessionCard } from "./SessionCard"

interface SessionListProps {
  sessions: Session[];
  onStart: (sessionId: string) => void;
  onEnd: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onView: (sessionId: string) => void;
}

export function SessionList({
  sessions,
  onStart,
  onEnd,
  onCancel,
  onView
}: SessionListProps) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard 
          key={session.id}
          session={session}
          onStart={onStart}
          onEnd={onEnd}
          onCancel={onCancel}
          onView={() => onView(session.id)}
        />
      ))}
    </div>
  )
} 