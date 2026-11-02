UPDATE public.pokemon
SET plataforms = '["Game Boy", "Game Boy Color", "Nintendo 3DS"]'
WHERE slug = 'pokemon-silver'
RETURNING nome, plataforms;

UPDATE public.pokemon
SET plataforms = '["Game Boy Color", "Nintendo 3DS"]'
WHERE slug = 'pokemon-crystal'
RETURNING nome, plataforms;