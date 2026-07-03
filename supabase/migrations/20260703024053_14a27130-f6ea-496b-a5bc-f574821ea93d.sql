-- Enable extensions for scheduled keep-alive
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule prior job if exists
DO $$
BEGIN
  PERFORM cron.unschedule('keep-alive-every-5-min');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'keep-alive-every-5-min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://xfgzpqcvejscxuaxkouh.supabase.co/functions/v1/keep-alive',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZ3pwcWN2ZWpzY3h1YXhrb3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxMjcsImV4cCI6MjA4MDYzMjEyN30.R-Dokun3eBdldACkm2GCPP7T4knGrNBSCpflBOsVRJo"}'::jsonb,
    body:='{"source":"cron"}'::jsonb
  );
  $$
);