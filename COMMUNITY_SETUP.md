# Community Setup

This site now includes:

- GitHub login through Supabase Auth
- Public read-only blog comments
- Signed-in blog comments and replies
- Public discussion page at `#/discuss`
- Signed-in discussion topics and replies

The UI is already built. Live data turns on after Supabase is configured.

## 1. Create Supabase Project

1. Go to Supabase and create a new project.
2. Open `SQL Editor`.
3. Run `supabase/schema.sql`.

The schema enables Row Level Security. Everyone can read, but only signed-in
users can insert/update/delete their own rows.

## 2. Enable GitHub Login

In Supabase:

1. Go to `Authentication` -> `Providers`.
2. Enable `GitHub`.
3. Add your GitHub OAuth client id and secret.
4. Add your production URL to allowed redirect URLs, for example:

```text
https://hhhxg07-homepage.guohanxing20070730.workers.dev
```

Also add local development when needed:

```text
http://127.0.0.1:5173
```

## 3. Add Environment Variables

In Supabase, copy:

- Project URL
- anon public key

In Cloudflare project settings, add:

```text
VITE_SUPABASE_URL=<your Supabase Project URL>
VITE_SUPABASE_ANON_KEY=<your Supabase anon public key>
```

Then redeploy the Cloudflare project.

For local development, create `.env.local`:

```text
VITE_SUPABASE_URL=<your Supabase Project URL>
VITE_SUPABASE_ANON_KEY=<your Supabase anon public key>
```

## 4. Release Flow

After editing code:

```bash
npm run build
git add .
git commit -m "Update community features"
git push
```

Cloudflare will rebuild automatically.
