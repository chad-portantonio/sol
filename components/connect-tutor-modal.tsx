"use client";

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface ConnectTutorModalProps {
  tutorId: string;
  tutorName: string;
  tutorSubjects: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConnectTutorModal({
  tutorId,
  tutorName,
  tutorSubjects,
  isOpen,
  onClose,
  onSuccess
}: ConnectTutorModalProps) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check authentication with timeout
      const authTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication check timed out')), 10000)
      );
      
      const authResult = await Promise.race([
        supabase.auth.getUser(),
        authTimeout
      ]) as { data: { user: any }, error: any };
      
      if (authResult.error || !authResult.data?.user) {
        // Redirect to sign up with connection intent
        const params = new URLSearchParams({
          connect: tutorId,
          subject: selectedSubject,
          message: message || ''
        });
        window.location.href = `/student-sign-up?${params}`;
        return;
      }

      // Make connection request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/student-tutor-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId,
          subject: selectedSubject,
          requestMessage: message || `Hi ${tutorName}! I would like to connect with you for ${selectedSubject} tutoring.`,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setSelectedSubject('');
        setMessage('');
      } else {
        const data = await response.json().catch(() => ({ error: 'Server error' }));
        setError(data.error || `Failed to send connection request (${response.status})`);
      }
    } catch (err: unknown) {
      console.error('Error sending connection request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('AbortError') || errorMessage.includes('timed out')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (errorMessage.includes('Authentication check timed out')) {
        setError('Authentication check failed. Please sign in and try again.');
      } else {
        setError(`Failed to send connection request: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connect with {tutorName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Select a subject</option>
              {tutorSubjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message (optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder={`Tell ${tutorName} about your learning goals...`}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
