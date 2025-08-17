import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function redirectResponse(url: string) {
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get('code');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  const domain = new URL(origin).hostname;
  const tokenInfo = token
    ? (token.startsWith('pkce_') || type === 'signup')
      ? `present (type: PKCE, ${token.substring(0, 10)}...)`
      : `present (${token.substring(0, 10)}...)`
    : 'missing';

  console.log('🔍 AUTH CALLBACK DEBUGGING:', {
    timestamp: new Date().toISOString(),
    fullUrl: request.url,
    origin,
    domain,
    code: code ? `present (${code.substring(0, 10)}...)` : 'missing',
    token: tokenInfo,
    type: type ?? 'missing',
    next,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  // Handle PKCE/OAuth code flow where provider sends `code`
  if (code) {
    console.log('Processing PKCE code exchange for authentication');
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Handle cookie setting error silently
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth code exchange failed:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        hint: 'Ensure the site URL and redirect URLs are correctly configured in Supabase Auth settings.'
      });
      return redirectResponse(`${origin}/sign-in?error=${encodeURIComponent('Authentication failed. Please request a new magic link or ensure you used the most recent email.')}&email=${encodeURIComponent(searchParams.get('email') || '')}`);
    }
    
    // Successfully authenticated
    console.log('PKCE authentication successful');
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Try to create user profile if it doesn't exist
      try {
        // Determine if this is a tutor or student based on user metadata
        const isStudentFlow = user.user_metadata?.role === 'student' || user.user_metadata?.role === 'parent';
        
        if (isStudentFlow) {
          const role = user.user_metadata?.role || 'student';
          
          // Use unified student account creation API
          try {
            const response = await fetch(`${origin}/api/student-accounts/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                email: user.email,
                fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || (role === 'parent' ? 'Parent' : 'Student'),
                preferredSubjects: user.user_metadata?.preferred_subjects || [],
                gradeLevel: user.user_metadata?.grade_level || null,
                bio: user.user_metadata?.bio || null,
                role: role,
                studentId: user.user_metadata?.student_id || null,
              }),
            });
            
            if (response.ok) {
              console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`);
            } else if (response.status === 409) {
              console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} account already exists`);
            } else {
              const errorData = await response.text();
              console.warn(`Failed to create ${role} account (${response.status}): ${errorData}, but proceeding with login`);
            }
          } catch (fetchError) {
            console.warn(`Network error creating ${role} account:`, fetchError, '- proceeding with login');
          }
          
          // Students always go to dashboard
          return redirectResponse(`${origin}/dashboard`);
        } else {
          // This is a tutor - check if they have a complete profile
          let hasCompleteProfile = false;
          
          try {
            // Check if tutor has a profile with required fields
            const profileResponse = await fetch(`${origin}/api/tutors/profiles/check-complete?tutorId=${user.id}`);
            if (profileResponse.ok) {
              const { isComplete } = await profileResponse.json();
              hasCompleteProfile = isComplete;
            }
          } catch (error) {
            console.warn('Could not check tutor profile completeness:', error);
          }
          
          // Try to create tutor record if it doesn't exist
          const response = await fetch(`${origin}/api/tutors/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
            }),
          });
          
          if (response.ok) {
            console.log('Tutor profile created successfully');
            
            // Get the created tutor record to get the correct tutor ID
            const tutorData = await response.json();
            const tutorId = tutorData.tutor?.id;
            
            if (tutorId) {
              // Create a basic tutor profile so they appear in browse results
              try {
                const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Tutor';
                const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
                
                const profileResponse = await fetch(`${origin}/api/tutors/profiles`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tutorId: user.id, // This is correct - we want the Supabase user ID
                  displayName: displayName,
                  subjects: ['Mathematics'], // Default subject
                  profileImage: avatarUrl, // Cartoon avatar instead of placeholder
                  country: 'Jamaica', // Default country
                  city: 'Kingston', // Default city
                  bio: 'New tutor - profile setup in progress',
                  experience: '',
                  hourlyRate: '',
                  availability: '',
                  address: ''
                }),
              });
              
              if (profileResponse.ok) {
                console.log('Basic tutor profile created successfully');
                hasCompleteProfile = false; // Force onboarding for new tutors
              } else {
                console.warn('Failed to create basic tutor profile, but tutor record exists');
              }
            } catch (profileError) {
              console.warn('Error creating basic tutor profile:', profileError);
            }
            } // Close the if (tutorId) block
          } else if (response.status === 409) {
            console.log('Tutor profile already exists');
          } else {
            console.warn('Failed to create tutor profile, but proceeding with login');
          }
          
          // Redirect tutors based on profile completeness
          if (hasCompleteProfile) {
            return redirectResponse(`${origin}/dashboard`);
          } else {
            return redirectResponse(`${origin}/tutor-onboarding`);
          }
        }
      } catch (error) {
        console.warn('Error creating user profile:', error);
        // Don't fail the authentication if profile creation fails
        // Redirect based on user type
        if (user.user_metadata?.role === 'tutor') {
          return redirectResponse(`${origin}/tutor-onboarding`);
        } else {
          return redirectResponse(`${origin}/dashboard`);
        }
      }
    }
    
    return redirectResponse(`${origin}${next}`);
  }

  // Handle PKCE token shortcut (providers that send token instead of code for signup)
  if (token && (type === 'signup' || token.startsWith('pkce_'))) {
    console.log('🔑 PKCE token detected - attempting session exchange');

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );

    const { error: pkceError } = await supabase.auth.exchangeCodeForSession(token);
    if (pkceError) {
      return redirectResponse(`${origin}/sign-in?error=${encodeURIComponent(pkceError.message || 'Invalid PKCE token')}`);
    }
    console.log('✅ PKCE session exchange successful');

    // Provision profile (same as code branch)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        const isStudentFlow = user.user_metadata?.role === 'student' || user.user_metadata?.role === 'parent';
        if (isStudentFlow) {
          const role = user.user_metadata?.role || 'student';
          try {
            const response = await fetch(`${origin}/api/student-accounts/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                email: user.email,
                fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || (role === 'parent' ? 'Parent' : 'Student'),
                preferredSubjects: user.user_metadata?.preferred_subjects || [],
                gradeLevel: user.user_metadata?.grade_level || null,
                bio: user.user_metadata?.bio || null,
                role,
                studentId: user.user_metadata?.student_id || null,
              }),
            });
            if (!response.ok && response.status !== 409) {
              console.warn(`Student account creation failed with status ${response.status}`);
            }
          } catch (error) {
            console.warn('Student account creation network error:', error);
          }
        } else {
          try {
            const response = await fetch(`${origin}/api/tutors/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, email: user.email }),
            });
            if (!response.ok && response.status !== 409) {
              console.warn(`Tutor account creation failed with status ${response.status}`);
            } else if (response.ok) {
              // Create a basic tutor profile so they appear in browse results
              try {
                const profileResponse = await fetch(`${origin}/api/tutors/profiles`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tutorId: user.id,
                    displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Tutor',
                    subjects: ['Mathematics'], // Default subject
                    profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`, // Cartoon avatar
                    country: 'Jamaica', // Default country
                    city: 'Kingston', // Default city
                    bio: 'New tutor - profile setup in progress',
                    experience: '',
                    hourlyRate: '',
                    availability: '',
                    address: ''
                  }),
                });
                
                if (profileResponse.ok) {
                  console.log('Basic tutor profile created successfully');
                } else {
                  console.warn('Failed to create basic tutor profile, but tutor record exists');
                }
              } catch (profileError) {
                console.warn('Error creating basic tutor profile:', profileError);
              }
            }
            
            // Redirect tutors to onboarding (they'll have basic profiles that need completion)
            return redirectResponse(`${origin}/tutor-onboarding`);
          } catch (error) {
            console.warn('Tutor account creation network error:', error);
            return redirectResponse(`${origin}/tutor-onboarding`);
          }
        }
      } catch (provisionErr) {
        console.warn('Error creating user profile:', provisionErr);
      }
    }

    return redirectResponse(`${origin}${next}`);
  }

  // Handle traditional OTP/token flows (some Supabase magic-link variants)
  if (token && type) {
    console.log('Processing token-based verification', { maskedToken: `${token.substring(0, 10)}...`, type });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );

    // Map query param types to Supabase verifyOtp types
    const supportedTypes = new Set(['magiclink', 'recovery', 'email_change', 'signup', 'invite']);
    if (!supportedTypes.has(type)) {
      return redirectResponse(`${origin}/sign-in?error=${encodeURIComponent('Unsupported verification type')}`);
    }
    const verifyType = type as 'magiclink' | 'recovery' | 'email_change' | 'signup' | 'invite';

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: verifyType,
    });

    if (error) {
      console.error('Token verification failed:', { message: error.message, type: verifyType });
      return redirectResponse(`${origin}/sign-in?error=${encodeURIComponent('Authentication failed. Please request a new magic link and try again.')}&email=${encodeURIComponent(searchParams.get('email') || '')}`);
    }

    console.log('Token verification successful', { userId: data?.user?.id });

    // Provision profile similar to the PKCE branch
    try {
      const { data: userResp } = await supabase.auth.getUser();
      const user = userResp.user;
      if (user) {
        const isStudentFlow = user.user_metadata?.role === 'student' || user.user_metadata?.role === 'parent';
        if (isStudentFlow) {
          const role = user.user_metadata?.role || 'student';
          try {
            const response = await fetch(`${origin}/api/student-accounts/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                email: user.email,
                fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || (role === 'parent' ? 'Parent' : 'Student'),
                preferredSubjects: user.user_metadata?.preferred_subjects || [],
                gradeLevel: user.user_metadata?.grade_level || null,
                bio: user.user_metadata?.bio || null,
                role,
                studentId: user.user_metadata?.student_id || null,
              }),
            });
            if (!response.ok && response.status !== 409) {
              console.warn(`Student account creation failed with status ${response.status}`);
            }
          } catch (error) {
            console.warn('Student account creation network error:', error);
          }
        } else {
          try {
            const response = await fetch(`${origin}/api/tutors/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, email: user.email }),
            });
            if (!response.ok && response.status !== 409) {
              console.warn(`Tutor account creation failed with status ${response.status}`);
            } else if (response.ok) {
              // Create a basic tutor profile so they appear in browse results
              try {
                const profileResponse = await fetch(`${origin}/api/tutors/profiles`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tutorId: user.id,
                    displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Tutor',
                    subjects: ['Mathematics'], // Default subject
                    profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`, // Cartoon avatar
                    country: 'Jamaica', // Default country
                    city: 'Kingston', // Default city
                    bio: 'New tutor - profile setup in progress',
                    experience: '',
                    hourlyRate: '',
                    availability: '',
                    address: ''
                  }),
                });
                
                if (profileResponse.ok) {
                  console.log('Basic tutor profile created successfully');
                } else {
                  console.warn('Failed to create basic tutor profile, but tutor record exists');
                }
              } catch (profileError) {
                console.warn('Error creating basic tutor profile:', profileError);
              }
            }
            
            // Redirect tutors to onboarding (they'll have basic profiles that need completion)
            return redirectResponse(`${origin}/tutor-onboarding`);
          } catch (error) {
            console.warn('Tutor account creation network error:', error);
            return redirectResponse(`${origin}/tutor-onboarding`);
          }
        }
      }
    } catch (provisionErr) {
      console.warn('Profile provisioning after token verification failed (continuing):', provisionErr);
    }
    return redirectResponse(`${origin}${next}`);
  }

  // If there's no code or token, redirect to sign-in with error message
  console.log('No auth parameter found in callback URL', { url: request.url });
  return redirectResponse(`${origin}/sign-in?error=${encodeURIComponent('No verification code found. Magic link expired or invalid')}`);
}
