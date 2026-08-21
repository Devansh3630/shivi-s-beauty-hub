-- Add chair_id, duration_minutes, and end_time to appointments table for multi-chair parlour system
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS chair_id TEXT NOT NULL DEFAULT 'Chair 1';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_minutes INT NOT NULL DEFAULT 30;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS end_time TEXT NOT NULL DEFAULT '';

-- Allow public / authenticated users to view schedule slot data for real-time chair availability calculation
CREATE OR REPLACE FUNCTION public.get_booked_slots(_target_date DATE)
RETURNS TABLE (
  id UUID,
  chair_id TEXT,
  time_slot TEXT,
  duration_minutes INT,
  end_time TEXT,
  status TEXT
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, chair_id, time_slot, duration_minutes, end_time, status
  FROM public.appointments
  WHERE appointment_date = _target_date
    AND status != 'cancelled';
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(DATE) TO anon, authenticated;

-- Allow authenticated users to cancel their own appointment
CREATE POLICY "appointments own cancel update" ON public.appointments
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
