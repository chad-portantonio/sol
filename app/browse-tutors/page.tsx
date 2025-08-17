"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import ConnectTutorModal from "@/components/connect-tutor-modal";


interface TutorProfile {
  id: string;
  displayName: string;
  bio?: string;
  subjects: string[];
  experience?: string;
  hourlyRate?: string;
  availability?: string;
  profileImage?: string;
  rating?: number;
  totalSessions: number;
  verified: boolean;
  tutor: {
    id: string;
    email: string;
    createdAt: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function BrowseTutors() {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchSubject, setSearchSubject] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [connectModal, setConnectModal] = useState<{
    isOpen: boolean;
    tutorId: string;
    tutorName: string;
    tutorSubjects: string[];
  }>({
    isOpen: false,
    tutorId: '',
    tutorName: '',
    tutorSubjects: []
  });



  const subjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Computer Science', 'Programming', 'Languages',
    'Spanish', 'French', 'Art', 'Music', 'Economics', 'Psychology'
  ];

  const fetchTutors = async (page = 1, subject = '', retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (subject && subject.trim()) {
        params.append('subject', subject.trim());
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`/api/tutors/profiles?${params}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(data.error || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.tutors || !Array.isArray(data.tutors)) {
        throw new Error('Invalid response format');
      }

      setTutors(data.tutors);
      setPagination(data.pagination);
      
    } catch (err: unknown) {
      console.error('Error fetching tutors:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Retry logic for network errors
      if (retryCount < 2 && (
        errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('AbortError')
      )) {
        console.log(`Retrying fetch (attempt ${retryCount + 2})...`);
        setTimeout(() => fetchTutors(page, subject, retryCount + 1), 2000 * (retryCount + 1));
        return;
      }
      
      setError(errorMessage.includes('AbortError') 
        ? 'Request timed out. Please check your connection and try again.'
        : `Failed to load tutors: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors(1, searchSubject);
  }, [searchSubject]); // fetchTutors is stable due to useCallback not needed here

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTutors(newPage, searchSubject);
    }
  };

  const handleConnectRequest = (tutor: TutorProfile) => {
    setConnectModal({
      isOpen: true,
      tutorId: tutor.tutor.id,
      tutorName: tutor.displayName,
      tutorSubjects: tutor.subjects
    });
  };

  const handleConnectionSuccess = () => {
    alert('Connection request sent successfully!');
    // Optionally redirect to dashboard
    window.location.href = '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Nova
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <Link 
                href="/student-sign-in"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link 
                href="/student-sign-up"
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Find Your Perfect Tutor
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
            Browse verified tutors across all subjects. Connect with experts who care about your success.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  Filter by Subject
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    aria-label="Filter tutors by subject"
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="w-full appearance-none pr-10 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fetchTutors(1, searchSubject)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg max-w-md mx-auto">
              <div className="mb-4">{error}</div>
              <button
                onClick={() => fetchTutors(pagination.currentPage, searchSubject)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 dark:text-gray-400 text-lg">
              No tutors found {searchSubject && `for ${searchSubject}`}. Try adjusting your search criteria.
            </div>
          </div>
        ) : (
          <>
            {/* Tutors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
              {tutors.map((tutor) => (
                <div key={tutor.id} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      {tutor.profileImage ? (
                        <img src={tutor.profileImage} alt={tutor.displayName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xl sm:text-2xl font-bold text-white">
                          {tutor.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mr-2">
                        {tutor.displayName}
                      </h3>
                      {tutor.verified && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {tutor.rating && (
                      <div className="flex items-center justify-center mb-2">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(tutor.rating!) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">({tutor.rating.toFixed(1)})</span>
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                      {tutor.totalSessions} sessions completed
                    </div>
                  </div>
                  
                  <div className="mb-3 sm:mb-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mb-3 sm:mb-4">
                      {tutor.subjects.slice(0, 3).map((subject) => (
                        <span key={subject} className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                          {subject}
                        </span>
                      ))}
                      {tutor.subjects.length > 3 && (
                        <span className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs sm:text-sm">
                          +{tutor.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {tutor.bio && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-3 mb-3 sm:mb-4 px-2">
                        {tutor.bio}
                      </p>
                    )}
                    
                    {tutor.hourlyRate && (
                      <div className="text-center mb-3 sm:mb-4">
                        <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                          {tutor.hourlyRate}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex">
                    <button
                      onClick={() => handleConnectRequest(tutor)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      pagination.currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Connect Tutor Modal */}
      <ConnectTutorModal
        tutorId={connectModal.tutorId}
        tutorName={connectModal.tutorName}
        tutorSubjects={connectModal.tutorSubjects}
        isOpen={connectModal.isOpen}
        onClose={() => setConnectModal(prev => ({ ...prev, isOpen: false }))}
        onSuccess={handleConnectionSuccess}
      />
    </div>
  );
}
