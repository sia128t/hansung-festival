import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ezbtfgkahhnxkqqaikyr.supabase.co';
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YnRmZ2thaGhueGtxcWFpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDExNTMsImV4cCI6MjA4OTAxNzE1M30.tWm2rHGE8fe-CRGeHtSVxq32jm6MUF8FltwKGkOhjdA';

export const supabase = SUPABASE_URL.startsWith('https://')
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;
