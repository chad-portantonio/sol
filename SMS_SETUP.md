# SMS Authentication Setup for Caribbean Users

## Overview
Since Resend doesn't support SMS, we're using **Twilio** for SMS authentication via Supabase. Twilio has excellent Caribbean coverage and integrates seamlessly with Supabase.

## Setup Steps

### 1. Twilio Account Setup
1. Go to [twilio.com](https://www.twilio.com) and create an account
2. Navigate to **Console > Account > API Keys & Tokens**
3. Note down:
   - Account SID
   - Auth Token
4. Go to **Phone Numbers > Manage > Buy a number**
   - Buy a phone number (US/Canada numbers work great for Caribbean)
   - Cost: ~$1/month + usage

### 2. Supabase Configuration
1. Go to your Supabase dashboard
2. Navigate to **Authentication > Settings**
3. In the **SMS Auth** section:
   - Enable SMS authentication
   - Provider: **Twilio**
   - Account SID: (from Twilio)
   - Auth Token: (from Twilio)
   - Phone Number: (your Twilio number)

### 3. Environment Variables
Add to your `.env.local`:
```bash
# SMS Authentication (Twilio via Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# These are configured in Supabase dashboard, not needed in code
# TWILIO_ACCOUNT_SID=your_twilio_sid
# TWILIO_AUTH_TOKEN=your_twilio_token
```

### 4. Supabase SMS Template
In Supabase Auth settings, customize the SMS template:
```
Your Nova verification code is: {{ .Token }}

Valid for 60 minutes.
```

## Caribbean Coverage & Pricing

### Supported Countries
- 🇯🇲 **Jamaica**: Excellent coverage
- 🇧🇧 **Barbados**: Excellent coverage  
- 🇹🇹 **Trinidad & Tobago**: Excellent coverage
- 🇧🇸 **Bahamas**: Good coverage
- 🇬🇩 **Grenada**: Good coverage
- 🇱🇨 **Saint Lucia**: Good coverage
- 🇩🇲 **Dominica**: Good coverage

### Pricing (Estimated)
- **Jamaica**: ~$0.053 per SMS
- **Barbados**: ~$0.046 per SMS
- **Trinidad**: ~$0.053 per SMS
- **Other Caribbean**: ~$0.05-0.08 per SMS

*Much cheaper than international calling rates!*

## Phone Number Format
Our app automatically formats Caribbean numbers:
- User enters: `876-123-4567` 
- App formats to: `+1876123467`
- Works for all NANP Caribbean countries

## Testing
1. Use your own Caribbean number for testing
2. Twilio trial account includes $15 credit
3. SMS delivery typically takes 2-10 seconds

## Production Considerations
1. **Rate Limiting**: Supabase handles this automatically
2. **Cost Management**: Monitor usage in Twilio dashboard
3. **Backup**: Keep email auth as fallback option
4. **Fraud Prevention**: Supabase includes basic protection

## Troubleshooting
- **SMS not received**: Check Twilio logs in console
- **Invalid number**: Ensure +1 prefix for Caribbean
- **Rate limits**: Wait 60 seconds between attempts
- **Costs**: Monitor Twilio usage dashboard

## Alternative Providers
If Twilio doesn't work for your use case:
1. **MessageBird**: Good Caribbean coverage
2. **Vonage (Nexmo)**: Reliable but pricier
3. **Plivo**: Budget option with decent coverage

## Next Steps
1. Set up Twilio account
2. Configure Supabase SMS settings
3. Test with Caribbean phone numbers
4. Deploy and monitor usage
