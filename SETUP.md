# Alumariah Realtors — public website and admin setup

This is a separate local copy. The existing Desktop project, Git staging area, GitHub repository and live Vercel deployment have not been changed.

## What changed

- The homepage has no admin form, management buttons, or editor JavaScript.
- `admin.html` is the separate email/password login and property editor. There is no public navigation link to it.
- Supabase stores shared listings and property images. Browser-local listings are not automatically migrated or deleted.
- Database row-level security restricts listing changes and image uploads to users explicitly listed in `admin_users`. Knowing the admin URL does not grant editing access.
- Archive hides a property without permanently deleting its record. To restore one, set its `archived` field to `false` in Supabase's Table Editor.
- The existing contact form's undefined `url` variable was repaired. Existing phone-number choices are preserved; the header uses a different WhatsApp number from the contact/footer links.

## Connect Supabase

1. Create a project at https://supabase.com/dashboard. Keep the database password private.
2. In its SQL Editor, run `database-setup.sql` once. It is intended for a new project; it creates the tables, photo bucket and access policies together.
3. Under Authentication, disable new user sign-ups. Create your own email/password user using the dashboard's Users controls. Set the password yourself; do not place it in website code or send it in chat.
4. Copy that user's UUID and run this separately in the SQL Editor:

   ```sql
   insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
   ```

5. Copy the project URL and **publishable** key into `config.js`. These are public connection details, protected by database policies. Never use a secret or service-role key in these files.
6. Open this folder with VS Code and serve it with Live Server. Visit `admin.html` to sign in. Until configured, the admin page explains setup is incomplete and the public page displays a listings-unavailable message.

References: [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [password login](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [database security](https://supabase.com/docs/guides/database/secure-data).

## Verify before publishing

Use an isolated test project or carefully identified test listing. Publishing from the admin page updates whichever database `config.js` points to; a preview linked to the production database will change live listings too.

- Signed out: visit the homepage and mobile menu; no add/edit/archive controls appear. Direct access to `admin.html` presents sign-in.
- Sign in as the authorised admin. Publish a property with photos. Confirm it appears in a different browser with no login, including search, gallery and WhatsApp enquiry.
- Edit it and archive it; confirm the public listing updates after page refresh.
- Sign out and check the editor disappears. Reload the admin page and confirm sign-in is required.
- Use a separate authenticated user not in `admin_users`: admin access and database writes must be denied. Anonymous inserts/updates must also be denied. Verify these using the Supabase client or API, not only the UI.
- Check expired sessions and failed network requests: no false save confirmation should appear.

The SQL policies and remote authentication/storage flows have not been executed or verified against a real project yet. Syntax and local behaviour checks do not replace these tests.

## Move to GitHub/Vercel after verification

Keep the original backup. Work on a separate Git branch. Copy these website files and the ASSETS folder into the existing project; review the diff before committing. Avoid replacing unrelated files in that project. Use a Vercel preview first, then merge into the configured production branch when ready.

The two SQL/Markdown setup files need not be deployed; keep them in project documentation outside the published web root if preferred. The admin source is public static code; only Supabase authenticates users and authorises writes. Robots `noindex` is for search indexing, not security.

## Existing listings and storage

The old editor stored listings only in the browser where they were entered. Those localStorage records are left untouched. Export/recover any existing listings in that browser before removing old code; migrate them separately after reviewing their details and photos. This update deliberately does not auto-publish local data.

New photos are compressed to JPEG and stored in the public `property-images` bucket, with up to 12 photos per listing. Upload only photos intended for public viewing. Replaced and archived photos remain stored to avoid breaking other references; review unused files in the dashboard if cleanup is needed. If a network failure makes a save uncertain, refresh the list before retrying; an upload may remain unused.

No password recovery form is included in this initial version. Manage account recovery through Supabase's dashboard/authentication settings. The public listing page refreshes from the database on page load, rather than using live push updates.
