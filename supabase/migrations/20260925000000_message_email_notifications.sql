-- Run once in the Supabase SQL Editor. Safe to re-run.
--
-- Records when the "new contact message" email was sent, so that a webhook retry
-- cannot send you a second copy of the same message.
alter table public.messages add column if not exists notified_at timestamptz;
