"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Student } from "@/lib/types";

interface StudentActionsProps {
  student: Student;
}

export function StudentActions({ student }: StudentActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    fullName: student.fullName,
    subject: student.subject,
    year: student.year,
    parentEmail: student.parentEmail || "",
    active: student.active,
  });
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleToggleStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !student.active,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update student");
      }

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update student");
      }

      setShowEditForm(false);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete student");
      }

      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (showEditForm) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 min-w-[400px] transition-colors">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Edit Student</h3>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-4 transition-colors">
            {error}
          </div>
        )}

        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label htmlFor="editFullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="editFullName"
              required
              value={editData.fullName}
              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="editSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="editSubject"
              required
              value={editData.subject}
              onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="editYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year/Level
            </label>
            <input
              type="text"
              id="editYear"
              required
              value={editData.year}
              onChange={(e) => setEditData({ ...editData, year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="editParentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent Email
            </label>
            <input
              type="email"
              id="editParentEmail"
              value={editData.parentEmail}
              onChange={(e) => setEditData({ ...editData, parentEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="editActive"
              checked={editData.active}
              onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="editActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Active Student
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      <button
        onClick={() => setShowEditForm(true)}
        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        Edit Student
      </button>
      
      <button
        onClick={handleToggleStatus}
        disabled={loading}
        className={`px-4 py-2 rounded-md transition-colors ${
          student.active
            ? "bg-yellow-600 dark:bg-yellow-500 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600"
            : "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? "Updating..." : student.active ? "Deactivate" : "Activate"}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}

