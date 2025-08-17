"use client";

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeView, setActiveView] = useState<'student' | 'tutor'>('student'); // Student view prioritized

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Nova
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveView('student')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                  activeView === 'student'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                I&apos;m a Student
              </button>
              <button
                onClick={() => setActiveView('tutor')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                  activeView === 'tutor'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                I&apos;m a Tutor
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link 
                href={activeView === 'student' ? "/student-sign-in" : "/sign-in"}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link 
                href={activeView === 'student' ? "/student-sign-up" : "/sign-up"}
                className={`px-4 py-2 ${
                  activeView === 'student' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                } dark:from-blue-500 dark:to-blue-600 text-white rounded-lg font-medium dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Hero Title */}
          <div className="relative mb-8">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-6 animate-gradient-x">
              Nova
            </h1>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl animate-pulse-slow"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-500/20 dark:bg-purple-400/20 rounded-full blur-xl animate-pulse-slow delay-1000"></div>
          </div>

          {activeView === 'student' ? (
            <>
              <p className="text-3xl md:text-4xl text-gray-800 dark:text-gray-200 mb-6 font-semibold leading-tight">
                Connect with Caribbean Tutors Today
              </p>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-4xl mx-auto">
                Find qualified tutors from Jamaica and across the Caribbean. Connect with local educators who understand your cultural context and academic needs.
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl md:text-4xl text-gray-800 dark:text-gray-200 mb-6 font-semibold leading-tight">
                Caribbean Tutoring Management Platform
              </p>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-4xl mx-auto">
                Built for Caribbean educators. Manage your tutoring business with student tracking, session management, 
                and parent communication. Designed specifically for the Caribbean educational context.
              </p>
            </>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            {activeView === 'student' ? (
              <>
                <Link 
                  href="/browse-tutors"
                  className="group px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1 hover:scale-105"
                >
                  <span className="flex items-center">
                    Browse Tutors
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </span>
                </Link>
                <Link 
                  href="/student-sign-up"
                  className="px-8 py-4 border-2 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl font-semibold text-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Create Free Account
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/sign-up"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25 transform hover:-translate-y-1 hover:scale-105"
                >
                  <span className="flex items-center">
                    Start Your Journey
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </span>
                </Link>
                <Link 
                  href="/pricing"
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  View Pricing
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {activeView === 'student' ? (
            <>
              {/* Student Feature 1 */}
              <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-green-500/10 dark:hover:shadow-green-400/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-3 transition-transform animate-float">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Find Verified Tutors</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Browse hundreds of verified tutors across all subjects. Filter by experience, ratings, and specializations to find your perfect match.</p>
              </div>
              
              {/* Student Feature 2 */}
              <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-3 transition-transform animate-float delay-1000">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Work with Multiple Tutors</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Connect with different tutors for different subjects. Manage all your tutoring relationships in one place.</p>
              </div>
              
              {/* Student Feature 3 */}
              <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-3 transition-transform animate-float delay-2000">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Track Your Progress</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Monitor your learning journey with detailed progress tracking, session notes, and homework assignments from all your tutors.</p>
              </div>
            </>
          ) : (
            <>
              {/* Tutor Feature 1 */}
              <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-3 transition-transform animate-float">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Smart Student Management</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Manage up to 20 active students with AI-powered insights, detailed profiles, and comprehensive progress tracking</p>
              </div>
              
              {/* Tutor Feature 2 */}
              <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-3 transition-transform animate-float delay-1000">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Automated Session Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Schedule sessions, take notes, assign homework, and track progress with intelligent automation</p>
              </div>
              
              {/* Tutor Feature 3 */}
              <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-green-500/10 dark:hover:shadow-green-400/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-3 transition-transform animate-float delay-2000">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Parent Communication Hub</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Share progress updates and session details with parents through automated communication tools</p>
              </div>
            </>
          )}
        </div>
        
        {/* Pricing Section */}
        <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Simple, Transparent Pricing</h2>
            <div className="relative inline-block">
              <div className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">$25</div>
              <div className="absolute -top-2 -right-8 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold transform rotate-12">Best Value</div>
            </div>
            <div className="text-2xl text-gray-600 dark:text-gray-400 mb-8">per month</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
              {[
                "Up to 20 active students",
                "Unlimited sessions",
                "Parent communication portal",
                "Email reminders & notifications",
                "Progress tracking & analytics",
                "Mobile-responsive design",
                "24/7 customer support",
                "Data export & backup"
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                  <svg className="w-6 h-6 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student & Parent Section */}
        <div className={`bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-400/10 dark:to-blue-400/10 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-green-200/50 dark:border-green-700/50 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">For Students & Parents</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
            Access your sessions, homework assignments, and progress tracking through our dedicated student portal
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/student-sign-up"
              className="group px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 dark:hover:from-green-500 dark:hover:to-green-600 transition-all duration-300 shadow-xl hover:shadow-green-500/25 dark:hover:shadow-green-400/25 transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="flex items-center">
                Student Portal
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </span>
            </Link>
            <Link 
              href="/student-sign-in"
              className="px-8 py-4 border-2 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl font-semibold text-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Already Registered?
            </Link>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-500/5 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-green-500/5 dark:bg-green-400/5 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>
    </div>
  );
}