#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupSupabaseStorage() {
  console.log('🚀 Setting up Supabase Storage for Tutor Profile Images');
  console.log('=====================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing required environment variables:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('\n📝 Please check your .env.local file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check if bucket already exists
    console.log('🔍 Checking if storage bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }

    const tutorImagesBucket = buckets.find(bucket => bucket.name === 'tutor-images');
    
    if (tutorImagesBucket) {
      console.log('✅ Storage bucket "tutor-images" already exists');
    } else {
      console.log('📦 Creating storage bucket "tutor-images"...');
      const { data: bucket, error: createError } = await supabase.storage.createBucket('tutor-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        process.exit(1);
      }

      console.log('✅ Storage bucket "tutor-images" created successfully');
    }

    // Set up storage policies
    console.log('\n🔐 Setting up storage policies...');
    
    // Policy for authenticated users to upload their own images
    const uploadPolicy = `
      CREATE POLICY "Users can upload their own profile images" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'tutor-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
    `;

    // Policy for public read access to profile images
    const readPolicy = `
      CREATE POLICY "Public read access to profile images" ON storage.objects
      FOR SELECT USING (bucket_id = 'tutor-images');
    `;

    // Policy for users to update their own images
    const updatePolicy = `
      CREATE POLICY "Users can update their own profile images" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'tutor-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
    `;

    // Policy for users to delete their own images
    const deletePolicy = `
      CREATE POLICY "Users can delete their own profile images" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'tutor-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
    `;

    console.log('📋 Storage policies to apply (run these in your Supabase SQL editor):');
    console.log('\n' + '='.repeat(80));
    console.log(uploadPolicy);
    console.log(readPolicy);
    console.log(updatePolicy);
    console.log(deletePolicy);
    console.log('='.repeat(80));

    console.log('\n💡 To apply these policies:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste each policy above');
    console.log('4. Run each statement');

    console.log('\n🎯 Storage setup instructions:');
    console.log('✅ Bucket created/verified');
    console.log('📋 Policies ready to apply');
    console.log('🔗 Bucket URL: ' + supabaseUrl + '/storage/v1/object/public/tutor-images/');

    console.log('\n✨ Storage setup complete!');

  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupSupabaseStorage()
    .then(() => {
      console.log('\n🎉 Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupSupabaseStorage };
