import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Navigation from '@/components/navigation';
export const dynamic = 'force-dynamic';

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
      // Create tutor record if it doesn't exist
      try {
        await prisma.tutor.create({
          data: { userId, email },
        });
      } catch (error) {
        console.error('Failed to ensure tutor record exists:', error);
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
        <Navigation variant="app" />

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

