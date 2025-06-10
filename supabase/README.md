# Supabase Configuration

This directory contains Supabase-related configuration, migrations, and edge functions.

## Structure

- `functions/` - Edge Functions (Deno-based serverless functions)
  - `insert_user_profile/` - Handles user profile creation after signup
  
- `migrations/` - Database migrations and security policies
  - `add_rls_policies.sql` - Row Level Security policies for data access control

- `config.toml` - Supabase project configuration

## Edge Functions

### insert_user_profile
- Creates user profiles after signup
- Uses Supabase service role for database access
- Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables

## Security Policies

The RLS policies in `add_rls_policies.sql` control access to:
- PDF Documents
- Annotations
- Document Shares
- Annotation History

Each table has specific policies for:
- Viewing (SELECT)
- Creating (INSERT)
- Updating (UPDATE)
- Deleting (DELETE)

## Development

To work with Supabase locally:
1. Install Supabase CLI
2. Run `supabase start` to start local development
3. Run `supabase db reset` to apply migrations
4. Run `supabase functions deploy insert_user_profile` to deploy functions 