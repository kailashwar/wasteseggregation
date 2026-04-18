-- Add credits + photo count to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photo_count integer NOT NULL DEFAULT 0;

-- Trigger function: bump photo_count + recalc credits on new report
CREATE OR REPLACE FUNCTION public.handle_new_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    photo_count = photo_count + 1,
    credits = floor((photo_count + 1) / 2),
    updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_report_created ON public.reports;
CREATE TRIGGER on_report_created
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_report();

-- Allow admins to view all profiles (for leaderboards / credit checks)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Backfill existing data
UPDATE public.profiles p
SET
  photo_count = COALESCE(r.cnt, 0),
  credits = floor(COALESCE(r.cnt, 0) / 2)
FROM (
  SELECT user_id, COUNT(*)::int AS cnt
  FROM public.reports
  GROUP BY user_id
) r
WHERE p.id = r.user_id;