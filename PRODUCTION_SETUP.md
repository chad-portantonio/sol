# 🚀 Production Setup Guide

## Overview
This guide will help you set up your Nova tutoring application in production on Vercel.

## ✅ What's Already Working
- ✅ Application deployed to Vercel
- ✅ All tests passing locally
- ✅ Database schema simplified and optimized
- ✅ Authentication flow fixed
- ✅ Dashboard access issues resolved

## 🔧 Required Environment Variables

### Vercel Environment Variables
Set these in your Vercel project dashboard:

#### Database
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

#### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Admin Migration (Optional)
```bash
ADMIN_MIGRATION_TOKEN=your-secure-admin-token
```

## 🗄️ Database Setup

### Option 1: Automatic Migration (Recommended)
The application will automatically create the correct schema when it first runs.

### Option 2: Manual Migration
If you need to manually trigger the migration:

1. **Set the admin token** in Vercel environment variables
2. **Call the migration endpoint**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/admin/migrate \
     -H "Authorization: Bearer your-admin-token"
   ```

### Option 3: Database Provider Migration
If using a service like Supabase, Neon, or PlanetScale:
- The schema will be automatically applied when the app connects
- No manual migration needed

## 🧪 Testing Production

### 1. Test Sign-Up Flow
1. Visit: `https://your-app.vercel.app/sign-up`
2. Create a new tutor account
3. Verify the account appears in your database

### 2. Test Dashboard Access
1. Sign in with the created account
2. Navigate to: `https://your-app.vercel.app/app/dashboard`
3. Verify no 404 errors

### 3. Test Database Operations
1. Add a new student
2. Create a session
3. Verify data persists in database

## 📊 Monitoring & Debugging

### Vercel Logs
- Check Vercel function logs for any errors
- Monitor database connection issues
- Watch for authentication problems

### Database Monitoring
- Monitor connection pool usage
- Check for slow queries
- Verify table structures

## 🚨 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: Verify `DATABASE_URL` is correct in Vercel environment variables

### Issue: "Tutor not found" after sign-up
**Solution**: Check if the `/api/tutors/create` endpoint is working

### Issue: Dashboard shows 404
**Solution**: Verify the app layout is properly creating tutor profiles

### Issue: Authentication errors
**Solution**: Check Supabase environment variables and configuration

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive values to git
- Use Vercel's encrypted environment variables
- Rotate admin tokens regularly

### Database Access
- Use connection pooling for production
- Limit database user permissions
- Enable SSL connections

### API Security
- The migration endpoint requires admin token
- Consider adding rate limiting
- Monitor for abuse

## 📈 Performance Optimization

### Database
- Enable connection pooling
- Add database indexes for common queries
- Monitor query performance

### Application
- Enable Vercel's edge caching
- Optimize bundle size
- Use static generation where possible

## 🆘 Support & Troubleshooting

### If Something Goes Wrong
1. Check Vercel function logs
2. Verify environment variables
3. Test database connectivity
4. Run the migration endpoint manually

### Getting Help
- Check Vercel deployment logs
- Review database connection status
- Verify all environment variables are set

## 🎯 Next Steps

1. **Test the production application** with a real sign-up
2. **Monitor the logs** for any issues
3. **Verify database operations** are working
4. **Set up monitoring** for production usage

---

**Status**: 🟢 Ready for Production Testing
**Last Updated**: $(date)
**Version**: 1.0.0
