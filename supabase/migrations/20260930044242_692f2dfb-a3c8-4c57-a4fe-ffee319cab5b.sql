ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_member_check CHECK (member IN ('Ale','Sebas','Lisa','Marco','Hogar')),
  ADD CONSTRAINT expenses_category_check CHECK (category IN ('servicios','financiero','alimentacion','salud','personales','transporte','varios')),
  ADD CONSTRAINT expenses_amount_check CHECK (amount > 0);