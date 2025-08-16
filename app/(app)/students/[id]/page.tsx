import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/time";
import { notFound } from "next/navigation";
import { StudentActions } from "./student-actions";
import { SessionForm } from "./session-form";
import { CopyLink } from "./copy-link";
import { Session } from "@/lib/types";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await requireUser();
  const { id } = await params;

  const student = await prisma.student.findFirst({
    where: {
      id,
      tutor: { userId },
    },
    include: {
      sessions: {
        orderBy: { startTime: "desc" },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const upcomingSessions = student.sessions.filter(
    (session: Session) => session.startTime > new Date()
  );
  const pastSessions = student.sessions.filter(
    (session: Session) => session.startTime <= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white mt-2">
            {student.fullName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 dark:text-gray-400 mt-1">
            {student.subject} • {student.year}
          </p>
        </div>
        <StudentActions student={student} />
      </div>

      {/* Student Info */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">Full Name</label>
            <p className="text-gray-900 dark:text-white dark:text-white">{student.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">Subject</label>
            <p className="text-gray-900 dark:text-white dark:text-white">{student.subject}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">Year/Level</label>
            <p className="text-gray-900 dark:text-white dark:text-white">{student.year}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">Status</label>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                student.active
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
              }`}
            >
              {student.active ? "Active" : "Inactive"}
            </span>
          </div>
          {student.parentEmail && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">Parent Email</label>
              <p className="text-gray-900 dark:text-white dark:text-white">{student.parentEmail}</p>
            </div>
          )}
        </div>

        {/* Parent Link */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white dark:text-white mb-2">Parent Access Link</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 dark:text-gray-400 mb-3">
            Share this link with the student&apos;s parent to give them access to progress updates and session information.
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parent/${student.parentLinkToken}`}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
            />
            <CopyLink 
              link={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parent/${student.parentLinkToken}`}
              label="Copy"
            />
          </div>
        </div>
      </div>

      {/* Add Session Form */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Add New Session</h2>
        <SessionForm studentId={student.id} />
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white">Upcoming Sessions</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 dark:divide-gray-700">
            {upcomingSessions.map((session: Session) => (
              <div key={session.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(session.startTime)} at {formatTime(session.startTime)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration: {Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))} minutes
                    </p>
                  </div>
                  <Link
                    href={`/sessions/${session.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Edit
                  </Link>
                </div>
                {session.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Notes:</strong> {session.notes}
                    </p>
                  </div>
                )}
                {session.homework && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Homework:</strong> {session.homework}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Sessions</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pastSessions.slice(0, 6).map((session: Session) => (
              <div key={session.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(session.startTime)} at {formatTime(session.startTime)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration: {Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))} minutes
                    </p>
                  </div>
                  <Link
                    href={`/sessions/${session.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Edit
                  </Link>
                </div>
                {session.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Notes:</strong> {session.notes}
                    </p>
                  </div>
                )}
                {session.homework && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Homework:</strong> {session.homework}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {pastSessions.length > 6 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-center transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing last 6 sessions. View all sessions to see complete history.
              </p>
            </div>
          )}
        </div>
      )}

      {student.sessions.length === 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-gray-400 text-lg mb-4">No sessions yet</div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start tracking {student.fullName}&apos;s progress by adding their first session above.
          </p>
        </div>
      )}
    </div>
  );
}
