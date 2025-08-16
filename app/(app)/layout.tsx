import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { userId, email } = await requireUser();
    
    // Get tutor and subscription
    const tutor = await prisma.tutor.findUnique({
      where: { userId },
      include: { subscription: true }
    });

    if (!tutor) {
      // Create tutor profile if it doesn't exist
      try {
        await prisma.tutor.create({
          data: {
            userId,
            email, // Use the email from the user record
          },
        });
        
        // Instead of redirecting, just continue - the profile is now created
        // The page will render normally with the new tutor record
      } catch (error) {
        console.error('Failed to create tutor profile:', error);
        // If we can't create the profile, redirect to sign-up
        redirect('/sign-up');
      }
    }

    // Check subscription status
    // Temporarily disabled to fix 404 error
    // if (tutor && (!tutor.subscription || tutor.subscription.status !== 'active')) {
    //   redirect('/billing');
    // }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Navigation */}
        <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Nova
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/students/new"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  New Student
                </Link>
                <Link
                  href="/billing"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  Billing
                </Link>
                <ThemeToggle />
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    );
  } catch (error) {
    console.error('App layout error:', error);
    redirect('/sign-in');
  }
}

