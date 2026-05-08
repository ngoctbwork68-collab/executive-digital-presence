
DROP POLICY IF EXISTS "Authenticated users can view active vouchers" ON public.vouchers;

CREATE OR REPLACE FUNCTION public.validate_voucher_by_code(_code text)
RETURNS TABLE (
  id uuid,
  code text,
  description text,
  discount_type text,
  discount_value numeric,
  min_order_amount numeric,
  max_discount numeric,
  usage_limit integer,
  used_count integer,
  valid_from timestamptz,
  valid_until timestamptz,
  product_types text[],
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.code, v.description, v.discount_type, v.discount_value,
         v.min_order_amount, v.max_discount, v.usage_limit, v.used_count,
         v.valid_from, v.valid_until, v.product_types, v.active,
         v.created_at, v.updated_at
  FROM public.vouchers v
  WHERE upper(v.code) = upper(_code)
    AND v.active = true
    AND (v.valid_from IS NULL OR v.valid_from <= now())
    AND (v.valid_until IS NULL OR v.valid_until >= now())
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.validate_voucher_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_voucher_by_code(text) TO anon, authenticated;

CREATE POLICY "Admins can update project images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'project-images' AND has_role(auth.uid(), 'admin'::app_role));
