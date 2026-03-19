import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rnrlwiocnhpwszranpqj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmx3aW9jbmhwd3N6cmFucHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjA4OTAsImV4cCI6MjA4NzYzNjg5MH0.Y1ioJTJjgq0vE2JUTQ27Nf4TRKPnTDRWmjE3J1oidW4";

export const supabase = createClient(supabaseUrl, supabaseKey);