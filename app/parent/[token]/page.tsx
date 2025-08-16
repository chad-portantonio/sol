import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime } from "@/lib/time";

interface ParentPageProps {
  params: Promise<{ token: string }>;
}

export default async function ParentPage({ params }: ParentPageProps) {
  const { token } = await params;

  // Find student by parent link token
  const student = await prisma.student.findFirst({
    where: { parentLinkToken: token },
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
    (session) => session.startTime > new Date()
  );
  const pastSessions = student.sessions.filter(
    (session) => session.startTime <= new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Nova Parent Portal
            </h1>
            <p className="text-xl text-gray-600">
              Progress updates for {student.fullName}
            </p>
          </div>

          {/* Student Info */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Student Name</label>
                <p className="text-gray-900 font-medium">{student.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Subject</label>
                <p className="text-gray-900">{student.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Year/Level</label>
                <p className="text-gray-900">{student.year}</p>
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(session.startTime)} at {formatTime(session.startTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Duration: {Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))} minutes
                        </p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Upcoming
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          {pastSessions.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {pastSessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="px-6 py-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(session.startTime)} at {formatTime(session.startTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Duration: {Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))} minutes
                        </p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                    
                    {session.notes && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Session Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {session.notes}
                        </p>
                      </div>
                    )}
                    
                    {session.homework && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Homework Assigned</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {session.homework}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {pastSessions.length > 10 && (
                <div className="px-6 py-4 bg-gray-50 text-center">
                  <p className="text-sm text-gray-500">
                    Showing last 10 sessions. Contact the tutor for complete history.
                  </p>
                </div>
              )}
            </div>
          )}

          {student.sessions.length === 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 text-lg mb-4">No sessions yet</div>
              <p className="text-gray-500">
                {student.fullName} hasn&apos;t had any sessions yet. Check back soon for updates!
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Questions or Concerns?</h3>
            <p className="text-blue-700 mb-4">
              If you have any questions about {student.fullName}&apos;s progress or upcoming sessions, 
              please contact the tutor directly.
            </p>
            <p className="text-sm text-blue-600">
              This portal is automatically updated after each session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

