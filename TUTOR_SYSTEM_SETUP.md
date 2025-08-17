# Nova Tutor System Setup Guide

This guide will walk you through setting up the complete tutor system that fixes the "no tutors found" issue.

## 🎯 What This Fixes

- **Tutors now appear in browse results** immediately after sign-up
- **Complete onboarding flow** for tutors to set up profiles
- **Required fields** (subjects, location, profile image) are enforced
- **Automatic profile creation** for new tutors
- **Smart redirects** based on profile completeness

## 🚀 Quick Setup

### 1. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```bash
DATABASE_URL=postgresql://your_supabase_postgres_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run Setup Script

```bash
node scripts/setup-tutor-system.js
```

This will verify your environment variables are set correctly.

### 3. Database Migration

```bash
npx prisma db push
```

This applies the new schema with location fields and required profile image.

### 4. Migrate Existing Tutors

```bash
node scripts/migrate-tutor-profiles.js
```

This creates basic profiles for existing tutors so they appear in browse results.

### 5. Start Development Server

```bash
npm run dev
```

## 🔧 Supabase Storage Setup

Create a storage bucket for tutor profile images:

1. Go to your Supabase dashboard
2. Navigate to Storage → Buckets
3. Create a new bucket called `tutor-images`
4. Set it to public (so profile images are accessible)
5. Set the following policy for authenticated users:

```sql
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tutor-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 📱 How It Works Now

### For New Tutors:
1. **Sign up** at `/tutor-sign-up`
2. **Magic link** authentication
3. **Automatic redirect** to `/tutor-onboarding`
4. **Complete profile** with subjects, location, image
5. **Redirect to dashboard** after completion

### For Existing Tutors:
1. **Sign in** with magic link
2. **Check profile completeness**
3. **Redirect to onboarding** if incomplete
4. **Redirect to dashboard** if complete

### For Students:
1. **Browse tutors** at `/browse-tutors`
2. **See all tutors** with subjects and locations
3. **Filter by subject** (Physics, Math, etc.)
4. **Connect with tutors** through the platform

## 🧪 Testing the System

### Test Tutor Sign-up:
1. Go to `/tutor-sign-up`
2. Enter an email address
3. Check email for magic link
4. Click the link
5. Should redirect to `/tutor-onboarding`

### Test Browse Tutors:
1. Go to `/browse-tutors`
2. Should see tutors (even with basic profiles)
3. Filter by subject (e.g., "Physics")
4. Should see location information

### Test Complete Onboarding:
1. Complete the tutor onboarding form
2. Upload a profile image
3. Fill in all required fields
4. Submit the form
5. Should redirect to dashboard

## 🔍 Troubleshooting

### "No tutors found" still appears:
- Run the migration script: `node scripts/migrate-tutor-profiles.js`
- Check that tutors have `TutorProfile` records in the database
- Verify the API endpoint `/api/tutors/profiles` returns data

### Image upload fails:
- Ensure Supabase storage bucket `tutor-images` exists
- Check storage policies allow authenticated uploads
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in environment

### Database connection errors:
- Verify `DATABASE_URL` is correct in `.env.local`
- Check Supabase database is running
- Ensure IP allowlist includes your development IP

## 📊 Database Schema Changes

The following fields were added to `TutorProfile`:

```prisma
model TutorProfile {
  // ... existing fields ...
  profileImage   String   // Now required (was optional)
  country        String   // New required field
  city           String   // New required field
  address        String?  // New optional field
}
```

## 🎉 What's New

### New Pages:
- `/tutor-sign-up` - Tutor registration
- `/tutor-onboarding` - Complete profile setup

### Enhanced Pages:
- `/browse-tutors` - Shows location info, "Become a Tutor" button
- `/` - Updated CTA buttons for tutors

### New API Endpoints:
- `POST /api/tutors/profiles` - Create/update tutor profiles
- `GET /api/tutors/profiles/check-complete` - Check profile completeness

### Smart Redirects:
- New tutors → Onboarding
- Incomplete profiles → Onboarding  
- Complete profiles → Dashboard
- Students → Dashboard

## 🚀 Next Steps

After setup, consider:

1. **Customizing subjects** in the onboarding form
2. **Adding verification workflow** for tutors
3. **Implementing rating system** for completed sessions
4. **Adding payment integration** for premium features
5. **Setting up email notifications** for new connections

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Run the setup script to validate configuration
4. Check Supabase logs for authentication issues
5. Verify database schema was updated successfully

---

**🎯 Your tutor system is now ready to show real tutors to students!**
