"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ThemeToggle } from '@/components/theme-toggle';
import type { User } from '@supabase/supabase-js';
import { Subject, SUBJECT_DISPLAY_NAMES, ALL_SUBJECTS, subjectToDisplayName, displayNameToSubject } from '@/lib/subjects';

const CARIBBEAN_COUNTRIES = [
  "Antigua and Barbuda", "Bahamas", "Barbados", "Cuba", "Dominica",
  "Dominican Republic", "Grenada", "Haiti", "Jamaica", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago"
];

const SUBJECTS = ALL_SUBJECTS;

interface TutorProfile {
  displayName: string;
  bio: string;
  subjects: string[];
  experience: string;
  hourlyRate: string;
  availability: string;
  country: string;
  city: string;
  address: string;
}

export default function TutorOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<TutorProfile>({
    displayName: '',
    bio: '',
    subjects: [],
    experience: '',
    hourlyRate: '',
    availability: '',
    country: '',
    city: '',
    address: ''
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Generate cartoon avatar URL based on display name
  const generateAvatarUrl = (name: string) => {
    if (!name) return '';
    const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const checkUser = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        // Pre-fill display name from user metadata or email
        const displayName = currentUser.user_metadata?.full_name || 
                           (currentUser.email ? currentUser.email.split('@')[0] : '');
        setProfile(prev => ({ ...prev, displayName }));
      } else {
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/sign-in');
    }
  }, [supabase.auth, router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setImageFile(file);
      setError(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) {
      throw new Error('No image file selected');
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('tutor-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('tutor-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      let imageUrl = '';
      
      if (imageFile) {
        // Upload image if provided
        imageUrl = await uploadImage();
      } else {
        // Use cartoon avatar if no image uploaded
        imageUrl = generateAvatarUrl(profile.displayName);
      }

      // Create tutor profile
      const response = await fetch('/api/tutors/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorId: user.id,
          ...profile,
          profileImage: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      setSuccess('Profile created successfully! Redirecting to dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error creating profile:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Nova
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Complete Your Tutor Profile
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Let students know about your expertise and experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Image</h3>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={generateAvatarUrl(profile.displayName)} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if avatar fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  )}
                  {!imagePreview && (
                    <span className="text-2xl font-bold text-white hidden">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Image
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Upload a clear photo of yourself (max 5MB) or use the generated avatar
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name *
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    required
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name as students will see it"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    required
                    value={profile.country}
                    onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your country</option>
                    {CARIBBEAN_COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={profile.city}
                    onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your city"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional detailed address"
                  />
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Subjects You Teach *</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select all subjects you&apos;re qualified to teach
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {SUBJECTS.map(subject => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      profile.subjects.includes(subject)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {subjectToDisplayName(subject)}
                  </button>
                ))}
              </div>
              {profile.subjects.length === 0 && (
                <p className="text-red-500 text-sm mt-2">Please select at least one subject</p>
              )}
            </div>

            {/* Experience & Rates */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Experience & Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience
                  </label>
                  <textarea
                    id="experience"
                    value={profile.experience}
                    onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5 years teaching Mathematics, Master's degree in Education"
                  />
                </div>
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hourly Rate (USD)
                  </label>
                  <select
                    id="hourlyRate"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your hourly rate</option>
                    <option value="$15/hour">$15/hour</option>
                    <option value="$20/hour">$20/hour</option>
                    <option value="$25/hour">$25/hour</option>
                    <option value="$30/hour">$30/hour</option>
                    <option value="$35/hour">$35/hour</option>
                    <option value="$40/hour">$40/hour</option>
                    <option value="$45/hour">$45/hour</option>
                    <option value="$50/hour">$50/hour</option>
                    <option value="$60/hour">$60/hour</option>
                    <option value="$70/hour">$70/hour</option>
                    <option value="$80/hour">$80/hour</option>
                    <option value="$100/hour">$100/hour</option>
                    <option value="$15-25/hour">$15-25/hour (Range)</option>
                    <option value="$20-30/hour">$20-30/hour (Range)</option>
                    <option value="$25-35/hour">$25-35/hour (Range)</option>
                    <option value="$30-40/hour">$30-40/hour (Range)</option>
                    <option value="$40-60/hour">$40-60/hour (Range)</option>
                    <option value="$50-80/hour">$50-80/hour (Range)</option>
                    <option value="Negotiable">Negotiable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bio & Availability */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Bio & Availability</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell students about your teaching style, qualifications, and what makes you a great tutor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Availability Schedule
                  </label>
                  <div className="space-y-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="w-24 font-medium text-gray-700 dark:text-gray-300">
                          {day}
                        </div>
                        <div className="flex items-center space-x-2">
                          <select 
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            onChange={(e) => {
                              const timeSlot = e.target.value;
                              const currentAvailability = profile.availability || '';
                              const lines = currentAvailability.split('\n').filter(line => !line.startsWith(day));
                              if (timeSlot) {
                                lines.push(`${day}: ${timeSlot}`);
                              }
                              setProfile(prev => ({ ...prev, availability: lines.join('\n') }));
                            }}
                            value={
                              profile.availability?.split('\n')
                                .find(line => line.startsWith(day))
                                ?.split(': ')[1] || ''
                            }
                          >
                            <option value="">Not Available</option>
                            <option value="9:00 AM - 12:00 PM">Morning (9:00 AM - 12:00 PM)</option>
                            <option value="12:00 PM - 3:00 PM">Early Afternoon (12:00 PM - 3:00 PM)</option>
                            <option value="3:00 PM - 6:00 PM">Late Afternoon (3:00 PM - 6:00 PM)</option>
                            <option value="6:00 PM - 9:00 PM">Evening (6:00 PM - 9:00 PM)</option>
                            <option value="9:00 AM - 6:00 PM">All Day (9:00 AM - 6:00 PM)</option>
                            <option value="9:00 AM - 3:00 PM">Morning to Afternoon (9:00 AM - 3:00 PM)</option>
                            <option value="3:00 PM - 9:00 PM">Afternoon to Evening (3:00 PM - 9:00 PM)</option>
                            <option value="Flexible">Flexible Times</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Preview:</strong> {profile.availability || 'No availability set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg transition-all duration-300 animate-in slide-in-from-top-2">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">{success}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Redirecting you to the dashboard...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || profile.subjects.length === 0 || (!imageFile && profile.displayName.length === 0)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
