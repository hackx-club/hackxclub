DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;
CREATE POLICY "Anyone can register" ON public.registrations FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(btrim(college)) BETWEEN 1 AND 150
  AND phone ~ '^[0-9+ ]{8,16}$'
  AND char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND team_size BETWEEN 1 AND 4
  AND char_length(track) <= 60
  AND event_slug IN ('hackx-1-0','general')
);
DROP POLICY IF EXISTS "Anyone can send a message" ON public.contact_messages;
CREATE POLICY "Anyone can send a message" ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(btrim(message)) BETWEEN 1 AND 1000
);