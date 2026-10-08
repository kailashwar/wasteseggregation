CREATE TABLE public.user_contact_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  address TEXT NOT NULL,
  location_label TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_contact_details TO authenticated;
GRANT ALL ON public.user_contact_details TO service_role;
ALTER TABLE public.user_contact_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contact details"
  ON public.user_contact_details
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contact details"
  ON public.user_contact_details
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contact details"
  ON public.user_contact_details
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname TEXT;
  contact_phone TEXT;
  contact_upi TEXT;
  contact_address TEXT;
  contact_location TEXT;
  contact_latitude DOUBLE PRECISION;
  contact_longitude DOUBLE PRECISION;
BEGIN
  uname := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, uname);

  IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;

  contact_phone := NEW.raw_user_meta_data->>'phone_number';
  contact_upi := NEW.raw_user_meta_data->>'upi_id';
  contact_address := NEW.raw_user_meta_data->>'address';
  contact_location := NEW.raw_user_meta_data->>'location_label';
  contact_latitude := NULLIF(NEW.raw_user_meta_data->>'latitude', '')::DOUBLE PRECISION;
  contact_longitude := NULLIF(NEW.raw_user_meta_data->>'longitude', '')::DOUBLE PRECISION;

  IF contact_phone IS NOT NULL
    AND contact_upi IS NOT NULL
    AND contact_address IS NOT NULL
    AND contact_location IS NOT NULL THEN
    INSERT INTO public.user_contact_details (
      user_id, phone_number, upi_id, address, location_label, latitude, longitude
    ) VALUES (
      NEW.id, contact_phone, contact_upi, contact_address, contact_location, contact_latitude, contact_longitude
    );
  END IF;

  RETURN NEW;
END;
$$;