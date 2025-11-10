-- Update the default status for assignments table to 'Status'
ALTER TABLE public.assignments 
ALTER COLUMN status SET DEFAULT 'Status'::text;