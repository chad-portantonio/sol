"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { AuthError, User, Session } from "@supabase/supabase-js";

interface DebugResult {
  data?: { user: User | null; session: Session | null } | null;
  error?: AuthError | null;
  session?: Session | null;
  user?: User | null;
}

export default function DebugAuth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const testMagicLink = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setResult({ data, error });
    } catch (error) {
      setResult({ error: { message: error instanceof Error ? error.message : 'Unknown error' } as AuthError });
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setResult({ session, error });
    } catch (error) {
      setResult({ error: { message: error instanceof Error ? error.message : 'Unknown error' } as AuthError });
    }
  };

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      setResult({ user, error });
    } catch (error) {
      setResult({ error: { message: error instanceof Error ? error.message : 'Unknown error' } as AuthError });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Magic Link Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Magic Link</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={testMagicLink}
              disabled={loading || !email}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Check Authentication Status</h2>
          <div className="flex gap-4">
            <button
              onClick={checkSession}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Check Session
            </button>
            <button
              onClick={checkUser}
              className="px-4 py-2 bg-purple-600 text-white rounded-md"
            >
              Check User
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Debugging Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Enter your email and click &quot;Send Magic Link&quot;</li>
            <li>Check your email for the magic link</li>
            <li>Click the magic link (it should redirect to /auth/callback)</li>
            <li>Use &quot;Check Session&quot; and &quot;Check User&quot; to verify authentication</li>
            <li>Check the browser console and network tab for any errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
