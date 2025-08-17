import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/time';
import { Student } from '@/lib/types';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  try {
    const { userId, email } = await requireUser();
    
    // Retry logic for database connection issues
    let tutor = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!tutor && retryCount < maxRetries) {
      try {
        tutor = await prisma.tutor.findUnique({
          where: { userId },
          include: {
            students: {
              include: {
                sessions: {
                  where: {
                    startTime: {
                      gte: new Date(),
                    },
                  },
                  orderBy: { startTime: 'asc' },
                  take: 1,
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        });
        
        if (!tutor) {
          // Try to create tutor profile if it doesn't exist
          try {
            await prisma.tutor.create({
              data: {
                userId,
                email,
              },
            });
            // Redirect to refresh the page with the new tutor profile
            return redirect('/dashboard');
          } catch (createError: unknown) {
            // If it's a unique constraint error, the tutor might already exist
            const prismaError = createError as { code?: string };
            if (prismaError?.code === 'P2002' || (createError as Error)?.message?.includes('Unique constraint')) {
              // Try to find the tutor again
              tutor = await prisma.tutor.findUnique({
                where: { userId },
                include: {
                  students: {
                    include: {
                      sessions: {
                        where: {
                          startTime: {
                            gte: new Date(),
                          },
                        },
                        orderBy: { startTime: 'asc' },
                        take: 1,
                      },
                    },
                    orderBy: { createdAt: 'desc' },
                  },
                },
              });
              if (tutor) break; // Found the tutor, exit retry loop
            }
            throw createError; // Re-throw if not a duplicate error
          }
        }
        break; // Success, exit retry loop
      } catch (error: unknown) {
        retryCount++;
        console.error(`Dashboard query attempt ${retryCount} failed:`, error);
        
        // If it's a connection error, prepared statement issue, or schema mismatch and we have retries left, wait and try again
        const errorMessage = (error as Error)?.message || '';
        const errorCode = (error as { code?: string })?.code;
        if (retryCount < maxRetries && (
          errorMessage.includes('prepared statement') ||
          errorMessage.includes('ConnectorError') ||
          errorMessage.includes('does not exist in the current database') ||
          errorCode === 'P1001' || // Connection error
          errorCode === 'P2022'    // Column doesn't exist
        )) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          continue;
        }
        
        // If we've exhausted retries or it's a different error, throw
        throw error;
      }
    }
    
    if (!tutor) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Setup In Progress</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your account is being set up. Please refresh the page in a moment.</p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Refresh Page
          </Link>
        </div>
      );
    }

    const activeStudents = tutor.students.filter((student) => student.active);
    const totalStudents = tutor.students.length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your students and sessions</p>
          </div>
          <Link
            href="/students/new"
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
          >
            Add New Student
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeStudents.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Active Students</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalStudents}</div>
            <div className="text-gray-600 dark:text-gray-400">Total Students</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{20 - activeStudents.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Slots Available</div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Next Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tutor.students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.fullName}
                      </div>
                      {student.parentEmail && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.parentEmail}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.sessions && student.sessions[0] ? (
                        formatDate(new Date(student.sessions[0].startTime))
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No upcoming sessions</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.active
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {tutor.students.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-lg mb-4">No students yet</div>
              <Link
                href="/students/new"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Add your first student →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    
    // Check if it's a schema mismatch error
    const errorMessage = (error as Error)?.message || '';
    const errorCode = (error as { code?: string })?.code;
    
    if (errorMessage.includes('does not exist in the current database') || errorCode === 'P2022') {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Database Update In Progress</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The application is being updated. Please wait a moment while the database schema is synchronized.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            This usually takes just a few seconds. You can try refreshing the page.
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Refresh Page
          </Link>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">There was an error loading your dashboard. Please try refreshing the page.</p>
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Refresh Page
        </Link>
      </div>
    );
  }
}
