ALTER TABLE public.schedule_changes
ADD COLUMN original_teacher_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
ADD COLUMN original_teacher_name text,
ADD COLUMN operation_source text NOT NULL DEFAULT 'single';

COMMENT ON COLUMN public.schedule_changes.original_teacher_id IS '代課前原任老師 staff id';
COMMENT ON COLUMN public.schedule_changes.original_teacher_name IS '代課前原任老師姓名快照';
COMMENT ON COLUMN public.schedule_changes.operation_source IS '操作來源：single 或 batch';
