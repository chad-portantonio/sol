"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Student, Session } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const fetchSessions = useCallback(async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}/sessions`);
      if (response.ok) {
        const sessionsData = await response.json();
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, []);

  const fetchStudentData = useCallback(async (userId: string) => {
    try {
      // Fetch user record
      const userResponse = await fetch(`/api/students/user/${userId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();
      
      if (userData.role === 'student') {
        if (userData.studentId) {
          // Fetch student details if we have a student ID
          const studentResponse = await fetch(`/api/students/${userData.studentId}/public`);
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            setStudent(studentData);
            
            // Fetch sessions for this student
            await fetchSessions(userData.studentId);
          }
        } else {
          // Student user without a linked student record
          setError('Your student account needs to be set up by your tutor. Please contact them to link your account.');
        }
      } else if (userData.role === 'parent') {
        // Try to fetch parent data, but expect this to fail with current schema
        const parentResponse = await fetch(`/api/students/parent/${userId}`);
        if (parentResponse.ok) {
          const parentData = await parentResponse.json();
          setStudent(parentData.student);
          
          // Fetch sessions for the student
          await fetchSessions(parentData.student.id);
        } else {
          // Parent access not implemented with current schema
          setError('Parent access is not yet implemented. Please use the parent link provided by your tutor.');
        }
      } else {
        setError('Unable to determine account type. Please contact support.');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load student data');
    }
  }, [fetchSessions]);

  const checkUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/student/sign-in');
        return;
      }

      // Check if user is a tutor
      const userRole = user.user_metadata?.role;
      if (userRole === 'tutor') {
        router.push('/app/dashboard');
        return;
      }

      setUser(user);
      
      // Fetch student data
      await fetchStudentData(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [supabase.auth, router, fetchStudentData]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Nova</h1>
              <span className="ml-4 text-sm text-gray-500">
                Student Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.user_metadata?.full_name || 'Student'}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {student ? (
          <div className="space-y-8">
            {/* Student Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Student Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{student.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Subject</label>
                  <p className="mt-1 text-sm text-gray-900">{student.subject}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Year</label>
                  <p className="mt-1 text-sm text-gray-900">{student.year}</p>
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Sessions</h2>
              </div>
              <div className="p-6">
                {sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {formatDate(session.startTime)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                        
                        {session.notes && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700">Notes:</h4>
                            <p className="text-sm text-gray-600 mt-1">{session.notes}</p>
                          </div>
                        )}
                        
                        {session.homework && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700">Homework:</h4>
                            <p className="text-sm text-gray-600 mt-1">{session.homework}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No sessions found.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Sessions will appear here once your tutor schedules them.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Welcome to Nova!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account is being set up. You&apos;ll be able to view your sessions and progress here once everything is configured.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                If you&apos;re a student, your tutor will need to link your account.
              </p>
              <p className="text-sm text-gray-500">
                If you&apos;re a parent, you&apos;ll need a student ID from your tutor.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
