"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SessionFormProps {
  studentId: string;
}

export function SessionForm({ studentId }: SessionFormProps) {
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    subject: "",
    notes: "",
    homework: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get form data from the actual form
    const formElement = e.target as HTMLFormElement;
    const formDataObj = new FormData(formElement);
    const startTime = formDataObj.get('startTime') as string || formData.startTime || defaultTimes.start;
    const endTime = formDataObj.get('endTime') as string || formData.endTime || defaultTimes.end;

    // Validate datetime values
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError("Please enter valid start and end times");
      setLoading(false);
      return;
    }

    // Validate that end time is after start time
    if (endDate <= startDate) {
      setError("End time must be after start time");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          subject: (formDataObj.get('subject') as string) || formData.subject || 'General',
          notes: (formDataObj.get('notes') as string) || formData.notes || undefined,
          homework: (formDataObj.get('homework') as string) || formData.homework || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      setSuccess(true);
      setFormData({ startTime: "", endTime: "", subject: "", notes: "", homework: "" });
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      // Refresh the page to show the new session
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Set default times (next hour for start, 2 hours later for end)
  const getDefaultTimes = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 2 hours from now
    
    return {
      start: startTime.toISOString().slice(0, 16),
      end: endTime.toISOString().slice(0, 16),
    };
  };

  const defaultTimes = getDefaultTimes();

  // Initialize form with default times if empty
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized && !formData.startTime && !formData.endTime) {
      setFormData(prev => ({
        ...prev,
        startTime: defaultTimes.start,
        endTime: defaultTimes.end,
      }));
      setIsInitialized(true);
    }
  }, [defaultTimes.start, defaultTimes.end, formData.startTime, formData.endTime, isInitialized]);

  return (
    <div className={`transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md transition-colors">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md transition-colors animate-in fade-in-0 duration-300">
          Session created successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Time *
          </label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            required
            disabled={loading}
            value={formData.startTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Time *
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            required
            disabled={loading}
            value={formData.endTime}
            onChange={handleChange}
            min={formData.startTime || defaultTimes.start}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subject *
        </label>
        <select
          id="subject"
          name="subject"
          required
          disabled={loading}
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <option value="">Select a subject</option>
          <option value="Mathematics">Mathematics</option>
          <option value="English">English</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="History">History</option>
          <option value="Geography">Geography</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Economics">Economics</option>
          <option value="Literature">Literature</option>
          <option value="Art">Art</option>
          <option value="Music">Music</option>
          <option value="General">General</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          disabled={loading}
          value={formData.notes}
          onChange={handleChange}
          placeholder="What was covered in this session? Any important points or observations?"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none"
        />
      </div>

      <div>
        <label htmlFor="homework" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Homework Assigned
        </label>
        <textarea
          id="homework"
          name="homework"
          rows={3}
          disabled={loading}
          value={formData.homework}
          onChange={handleChange}
          placeholder="What homework or practice work was assigned for next time?"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none"
        />
      </div>

      <div className="flex justify-end pt-4">
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
              <span>Creating Session...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Session</span>
            </>
          )}
        </button>
      </div>
      </form>
    </div>
  );
}

