ALTER TABLE public.sessions
  ADD COLUMN created_by text REFERENCES public.ba_user(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.sessions.created_by IS '建立此課堂的使用者 ID（ba_user）；系統排程或舊資料可能為 null';
