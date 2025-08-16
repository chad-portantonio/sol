# Nova Environment Variables Setup

Create a `.env.local` file in your project root with these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database
DATABASE_URL=postgresql://your_supabase_postgres_connection_string

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_PRICE_ID=price_your_25_monthly_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="Nova <no-reply@nova.app>"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Jobs
CRON_SECRET=your_super_secret_cron_key_for_automated_emails
```

## How to Get These Values:

### 1. **Supabase Setup**
- Go to [supabase.com](https://supabase.com) and create a new project
- Navigate to Settings → API
- Copy the Project URL and anon/public key
- For the service role key, go to Settings → API → Project API keys → service_role

### 2. **Database Connection**
- In Supabase, go to Settings → Database
- Find the Connection string section
- Copy the connection string and replace the password with your database password

### 3. **Stripe Setup**
- Go to [stripe.com](https://stripe.com) and create an account
- Navigate to Developers → API Keys
- Copy the Publishable key and Secret key
- Create a product and price for $25/month subscription
- Set up webhooks pointing to `/api/stripe/webhook`
- Copy the webhook signing secret

### 4. **Resend Email Service**
- Go to [resend.com](https://resend.com) and create an account
- Navigate to API Keys
- Create a new API key
- Verify your domain or use the provided sandbox domain

### 5. **Cron Secret**
- Generate a secure random string for cron job authentication
- You can use: `openssl rand -base64 32`

## Vercel Deployment Setup

If deploying to Vercel, add these environment variables in your Vercel dashboard:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add each variable from the list above
4. Set `NEXT_PUBLIC_APP_URL` to your production domain

## Cron Job Setup

To set up automated email reminders, create a cron job that calls:

```
POST https://your-domain.com/api/cron/send-reminders
Authorization: Bearer your_cron_secret
```

Recommended schedule: Daily at 9:00 AM UTC

## Testing Your Setup

1. **Database**: Run `npx prisma db push` to create tables
2. **Stripe**: Test with test cards (e.g., 4242 4242 4242 4242)
3. **Email**: Send a test email through the Resend dashboard
4. **Cron**: Test the cron endpoint with a GET request

## Security Notes

- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate your cron secret regularly
- Monitor webhook events in Stripe dashboard

