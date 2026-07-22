# Demo Setup Guide

This walks through every third-party step needed to get the full demo
working: a patient can submit a request, it lands in Supabase, an
administrator can sign in and confirm it, and a confirmation email (or
email preview) is produced. Menu labels below match Supabase's dashboard
as of when this was written — if a label has moved slightly in a later
dashboard redesign, the underlying setting is the same.

Without any setup, `npm run dev` still works: the landing page and the
first three steps of the booking form are fully usable. You only need
Supabase configured to actually submit a request or sign in as an admin.

## 1. Create a Supabase project

1. Go to https://supabase.com and sign in (or create a free account).
2. Click **New project**.
3. Choose an organization, give the project a name (e.g. `rabito-clinic-demo`),
   set a database password (save it somewhere — you won't need it for this
   app, but Supabase requires one), pick a region close to you, and click
   **Create new project**.
4. Wait for provisioning to finish (a minute or two).

## 2. Locate the project URL

1. In your project, open **Project Settings** (gear icon) → **Data API**
   (older dashboards call this **API**).
2. Copy the **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`).
3. Paste it into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`.

## 3. Locate the anonymous key

1. Same page (**Project Settings → Data API**, "Project API keys" section).
2. Copy the **`anon` `public`** key.
3. Paste it into `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 4. Locate the service-role key

1. Same page, copy the **`service_role`** **`secret`** key.
2. Paste it into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.
3. **Never** put this key in a `NEXT_PUBLIC_*` variable or client-side code
   — it bypasses Row Level Security entirely. This app only reads it in
   server-only modules (see `src/lib/supabase/admin.ts`).

## 5. Add the variables to `.env.local`

1. In the project root, copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` from steps 2–4.
3. Leave `ADMIN_EMAILS`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` for now
   — they're covered below.
4. Restart `npm run dev` after editing `.env.local` (Next.js only reads it
   at startup).

## 6. Run the SQL migrations

1. In the Supabase dashboard, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open [`supabase/migrations/0001_appointments.sql`](./supabase/migrations/0001_appointments.sql)
   in this repo, copy its entire contents, and paste it into the query
   editor.
4. Click **Run**. You should see "Success. No rows returned."
5. Repeat steps 2–4 for [`supabase/migrations/0002_patient_type_and_viewed_at.sql`](./supabase/migrations/0002_patient_type_and_viewed_at.sql)
   (adds the new/existing-patient field and the admin "viewed" marker used
   for new-request notifications). If you set this project up before this
   migration existed, come back and run it now — it's safe to run once.

This creates the `appointments` table, its indexes, and enables Row Level
Security (see the comment at the top of the migration for why there are
deliberately no RLS policies — all access goes through the service-role
key in trusted server code, after the app checks the caller is an
authenticated, allowlisted administrator).

## 7. Enable email and password authentication

1. Open **Authentication → Sign In / Providers** (older dashboards: 
   **Authentication → Providers**).
2. Confirm **Email** is enabled (it's on by default for new projects).
3. Open **Authentication → Sign In / Providers → Email** settings (or
   **Authentication → Settings**) and, for this demo, turn **off**
   "Confirm email" so you can sign in immediately after creating a user
   without clicking a confirmation link. (For anything beyond a demo,
   leave email confirmation on.)

## 8. Create the first administrator user

1. Open **Authentication → Users**.
2. Click **Add user** → **Create new user**.
3. Enter an email address and a password. Click **Create user**.
   (This is a real login — use an email/password you'll remember for the
   pitch demo.)

## 9. Add the administrator email to `ADMIN_EMAILS`

1. In `.env.local`, set:
   ```
   ADMIN_EMAILS=the-email-you-just-created@example.com
   ```
2. For multiple administrators, comma-separate them:
   ```
   ADMIN_EMAILS=admin-one@example.com, admin-two@example.com
   ```
3. Restart `npm run dev`.

Being a valid Supabase login is not enough by itself — the signed-in
email must also appear in `ADMIN_EMAILS`, or `/admin` redirects back to
the login page with an explanation.

## 10. Configure local and production authentication URLs

1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to `http://localhost:3000` for local development.
3. Under **Redirect URLs**, add `http://localhost:3000/**`.
4. Once you deploy to Vercel (see below), come back and add your Vercel
   URL too (e.g. `https://your-app.vercel.app/**`), and update **Site
   URL** to the production URL.

## 11. Verify that the appointment table exists

1. Open **Table Editor** in the Supabase dashboard.
2. Confirm you see an `appointments` table with the columns described in
   the migration (`request_reference`, `patient_name`, `status`, etc.).

## 12. Seed fictional demo appointments

```bash
npm run seed
```

This inserts ~4 pending requests, 3 confirmed appointments, and 1
rejected request, all using clearly fictional names and a fake
`@demo.rabitoclinic.example` email domain. Re-running it clears and
re-inserts only rows with that domain, so it's safe to run more than
once.

## 13. Test administrator login

1. Start the app: `npm run dev`.
2. Go to http://localhost:3000/admin — you should be redirected to
   `/admin/login`.
3. Sign in with the email/password from step 8.
4. You should land on `/admin` and see the dashboard, including the demo
   data from step 12 if you seeded it.

---

## Resend (transactional email)

The demo works without Resend — every confirmation/rejection "email"
becomes a `preview_only` record instead, viewable from the admin
dashboard via **View email preview**. Set up Resend when you want the
demo to send real emails.

### 1. Create a Resend account

Go to https://resend.com and sign up.

### 2. Create an API key

1. In the Resend dashboard, open **API Keys**.
2. Click **Create API Key**, give it a name (e.g. `rabito-demo`), and
   choose **Sending access**.
3. Copy the key — Resend only shows it once.

### 3. Understand Resend's testing restrictions

On a new Resend account, you can only send email **to the address you
signed up with** until you verify a sending domain. This is normal and
expected — it's enough to demo the confirmation email to yourself before
verifying a domain.

### 4. Verify a sending domain when needed

To send to *any* recipient (e.g. real patient addresses), open
**Domains** in Resend, click **Add Domain**, and add the DNS records
(SPF/DKIM) it gives you at your domain registrar. Verification typically
takes a few minutes to a few hours depending on DNS propagation.

### 5. Configure `RESEND_API_KEY`

In `.env.local`:
```
RESEND_API_KEY=re_your_key_here
```

### 6. Configure `RESEND_FROM_EMAIL`

This must be an address at a domain you've verified in Resend (or, before
verification, Resend's own testing sender for your account — check the
Resend dashboard for the exact address to use pre-verification):
```
RESEND_FROM_EMAIL=appointments@your-verified-domain.com
```
Restart `npm run dev` after editing.

### 7. Test the confirmation email

1. Submit a booking request at `/book` using an email address you can
   check (before domain verification, this must be the same address you
   signed up to Resend with).
2. Sign in to `/admin`, open the request, and click **Confirm
   appointment**.
3. Check your inbox for the confirmation email.

### 8. Use the email-preview fallback before domain verification is complete

If `RESEND_API_KEY` or `RESEND_FROM_EMAIL` is missing (or sending fails),
the app never crashes — it marks the email `preview_only`, stores the
fully-rendered subject/HTML/text, and shows a **View email preview**
action in the admin panel so you can demonstrate exactly what would have
been sent.

---

## Deploying to Vercel

### 1. Push the project to GitHub

```bash
git add -A
git commit -m "Rabito Clinic booking demo"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. Import it into Vercel

1. Go to https://vercel.com/new.
2. Import the GitHub repository you just pushed.
3. Framework preset should auto-detect as **Next.js** — leave the default
   build/output settings.

### 3. Add every required environment variable

In the Vercel project's **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase step 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase step 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase step 4 |
| `ADMIN_EMAILS` | same value as local |
| `RESEND_API_KEY` | if using Resend |
| `RESEND_FROM_EMAIL` | if using Resend |
| `NEXT_PUBLIC_APP_URL` | your Vercel URL, e.g. `https://your-app.vercel.app` |

### 4. Select the correct production environment

When adding each variable, make sure the **Production** environment
checkbox is selected (also tick **Preview** if you want preview
deployments to work the same way).

### 5. Redeploy after adding variables

Environment variables only take effect on new deployments. Trigger one
from **Deployments → Redeploy** (or just push another commit).

### 6. Add the Vercel URL to the Supabase redirect allowlist

Back in Supabase **Authentication → URL Configuration** (setup step 10),
set **Site URL** to your Vercel URL and add
`https://your-app.vercel.app/**` to **Redirect URLs**.

### 7. Test the complete workflow after deployment

Repeat the manual demonstration script below against the live Vercel URL.

---

## Manual demonstration script (for a pitch)

A step-by-step run-through your friend can follow live:

1. Open the public landing page.
2. Click **Book an Appointment**.
3. Fill in a fictional patient's name, phone and email; continue.
4. Choose a service and branch; continue.
5. Choose a date and time; continue.
6. Review the details, tick the consent checkbox, and submit.
7. **Copy the request reference** shown on the confirmation screen
   (`REQ-2026-XXXXXX`).
8. Click **Return to homepage**, then **Administrator login** in the
   footer, and sign in.
9. On the dashboard, paste the reference into the search box to find the
   pending request.
10. Open it, optionally assign a branch/team, and click **Confirm
    appointment** → confirm in the dialog.
11. Note the **email delivery** status shown (sent, or preview-only), and
    if preview-only, click **View email preview** to show exactly what
    the patient would have received, including the final appointment
    reference (`RAB-2026-XXXXXX`).
12. Return to the dashboard — the request now shows status **Confirmed**
    and the summary cards have updated.
