with numbered as (
  select id, 'S' || lpad(row_number() over (order by created_at, id)::text, 4, '0') as new_display_soul
  from public.confessions
  where soul_id is null and display_soul like 'SEED%'
)
update public.confessions c
set display_soul = numbered.new_display_soul
from numbered
where c.id = numbered.id;
