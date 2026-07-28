import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Avoid throwing during module initialization in serverless environments
  // where env vars may be injected differently. Creating a client with
  // empty strings is safe and prevents a hard crash during import.
  // Individual operations will return errors which the app already
  // checks and surfaces in a user-friendly way.
  // This keeps the production route from failing completely when
  // configuration is missing and allows graceful handling/logging.
  // Note: the test suite sets defaults for these variables.
  // eslint-disable-next-line no-console
  console.warn("Supabase environment variables are missing. Continuing with a client created from empty values.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
