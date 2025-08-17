"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Student } from "@/lib/types";
import { ALL_SUBJECTS, subjectToDisplayName } from '@/lib/subjects';

export default function NewStudent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    year: "",
    parentEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newStudent, setNewStudent] = useState<Student | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create student");
      }

      setNewStudent(data.student);
      setSuccess(true);
      setFormData({ fullName: "", email: "", subject: "", year: "", parentEmail: "" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const copyParentLink = async () => {
    if (newStudent?.parentLinkToken) {
      try {
        const parentLink = `${window.location.origin}/parent/${newStudent.parentLinkToken}`;
        await navigator.clipboard.writeText(parentLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        // Fallback for browsers that don't support clipboard API
        alert("Could not copy to clipboard. Please copy the link manually.");
      }
    }
  };

  const startAutoRedirect = () => {
    setAutoRedirectCountdown(10);
  };

  const cancelAutoRedirect = () => {
    setAutoRedirectCountdown(null);
  };

  // Auto-redirect countdown effect
  useEffect(() => {
    if (autoRedirectCountdown === null) return;
    
    if (autoRedirectCountdown === 0) {
      router.push('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setAutoRedirectCountdown(autoRedirectCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoRedirectCountdown, router]);

  if (success && newStudent) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 animate-in fade-in-0 duration-500">
          <div className="flex items-center mb-4">
            <div className="relative">
              <svg className="w-6 h-6 text-green-600 mr-2 animate-in zoom-in-0 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-300">Student Created Successfully!</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-green-700 dark:text-green-300">
              <strong>{newStudent.fullName}</strong> has been added to your student list.
            </p>
          </div>

          {/* Auto-redirect notification */}
          {autoRedirectCountdown !== null && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Redirecting to dashboard in {autoRedirectCountdown} seconds...
                </p>
                <button
                  onClick={cancelAutoRedirect}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-4 rounded border border-green-200 dark:border-green-800 mb-4">
            <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">Parent Link</h3>
            <p className="text-sm text-green-600 dark:text-green-400 mb-3">
              Share this link with the student&apos;s parent to give them access to progress updates and session information.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/parent/${newStudent.parentLinkToken}`}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={copyParentLink}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  copySuccess
                    ? 'bg-green-700 dark:bg-green-600 text-white'
                    : 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600'
                }`}
              >
                {copySuccess ? (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </div>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-3 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <span>Back to Dashboard</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            {autoRedirectCountdown === null ? (
              <button
                onClick={startAutoRedirect}
                className="px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Auto-redirect (10s)</span>
              </button>
            ) : null}

            <Link
              href={`/students/${newStudent.id}`}
              className="px-4 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule Session</span>
            </Link>
            
            <button
              onClick={() => {
                setSuccess(false);
                setNewStudent(null);
                setCopySuccess(false);
                setAutoRedirectCountdown(null);
              }}
              className="px-4 py-3 border border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Another Student</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-3 sm:mt-4">Add New Student</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Add a new student to your tutoring roster. You can have up to 20 active students.
        </p>
      </div>

      <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md transition-colors">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              disabled={loading}
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter student's full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Student Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={loading}
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter student's email address"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Subject *
            </label>
            <select
              id="subject"
              name="subject"
              required
              disabled={loading}
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select primary subject</option>
              {ALL_SUBJECTS.map(subject => (
                <option key={subject} value={subject}>
                  {subjectToDisplayName(subject)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year/Level *
            </label>
            <input
              type="text"
              id="year"
              name="year"
              required
              disabled={loading}
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g., Grade 10, Year 12, CSEC"
            />
          </div>

          <div>
            <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parent Email (Optional)
            </label>
            <input
              type="email"
              id="parentEmail"
              name="parentEmail"
              disabled={loading}
              value={formData.parentEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="parent@example.com"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              If provided, parents will receive email reminders about upcoming sessions.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-md hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Student...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
