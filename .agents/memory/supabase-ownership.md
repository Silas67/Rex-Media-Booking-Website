---
name: Supabase ownership
description: Rex Media's database ownership and setup preference.
---

Rex Media uses the user's own Supabase project. Provide the SQL schema and environment-variable connection instructions; do not provision a different database.

**Why:** the user specified that Supabase will be their database and asked for the schema and environment connection instructions.

**How to apply:** Keep app data access compatible with the user's Supabase project and include setup instructions for SQL, RLS, and public environment values. Do not migrate to the Replit database unless the user changes this requirement.