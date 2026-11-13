-- Estrutura e dados iniciais do catalogo.
BEGIN;

CREATE TABLE IF NOT EXISTS public.pokemon (
    nome TEXT NOT NULL,
    slug TEXT PRIMARY KEY,
    franchise TEXT NOT NULL,
    plataforms TEXT NOT NULL,
    parent_plataforms TEXT NOT NULL,
    image TEXT,
    remake TEXT NOT NULL,
    image_data BYTEA,
    release_date DATE
);

ALTER TABLE public.pokemon
    ADD COLUMN IF NOT EXISTS image_data BYTEA,
    ADD COLUMN IF NOT EXISTS release_date DATE;

INSERT INTO public.pokemon (
    nome, slug, franchise, plataforms, parent_plataforms, remake, release_date
)
VALUES
    ('Pokémon Red', 'pokemon-red', 'Pokémon', '["Game Boy", "Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '1996-02-27'),
    ('Pokémon Green', 'pokemon-green', 'Pokémon', '["Game Boy", "Game Boy Color", "Game Boy Advance"]', '["Nintendo"]', 'NO', DATE '1996-02-27'),
    ('Pokémon Blue', 'pokemon-blue', 'Pokémon', '["Game Boy", "Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '1996-10-15'),
    ('Pokémon Yellow', 'pokemon-yellow', 'Pokémon', '["Game Boy", "Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '1998-09-12'),
    ('Pokémon Gold', 'pokemon-gold', 'Pokémon', '["Game Boy", "Game Boy Color", "Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '1999-11-21'),
    ('Pokémon Silver', 'pokemon-silver', 'Pokémon', '["Game Boy", "Game Boy Color", "Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '1999-11-21'),
    ('Pokémon Crystal', 'pokemon-crystal', 'Pokémon', '["Game Boy Color", "Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '2000-12-14'),
    ('Pokémon Ruby', 'pokemon-ruby', 'Pokémon', '["Game Boy Advance"]', '["Nintendo"]', 'NO', DATE '2002-11-21'),
    ('Pokémon Sapphire', 'pokemon-sapphire', 'Pokémon', '["Game Boy Advance"]', '["Nintendo"]', 'NO', DATE '2002-11-21'),
    ('Pokémon Emerald', 'pokemon-emerald', 'Pokémon', '["Game Boy Advance"]', '["Nintendo"]', 'NO', DATE '2004-09-16'),
    ('Pokémon Fire Red', 'pokemon-fire-red', 'Pokémon', '["Game Boy Advance"]', '["Nintendo"]', 'YES', DATE '2004-01-29'),
    ('Pokémon Leaf Green', 'pokemon-leaf-green', 'Pokémon', '["Game Boy Advance"]', '["Nintendo"]', 'YES', DATE '2004-01-29'),
    ('Pokémon Diamond', 'pokemon-diamond', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'NO', DATE '2006-09-28'),
    ('Pokémon Pearl', 'pokemon-pearl', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'NO', DATE '2006-09-28'),
    ('Pokémon Platinum', 'pokemon-platinum', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'NO', DATE '2008-09-13'),
    ('Pokémon Heart Gold', 'pokemon-heart-gold', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'YES', DATE '2009-09-12'),
    ('Pokémon Soul Silver', 'pokemon-soul-silver', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'YES', DATE '2009-09-12'),
    ('Pokémon Black', 'pokemon-black', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'NO', DATE '2010-09-18'),
    ('Pokémon White', 'pokemon-white', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'NO', DATE '2010-09-18'),
    ('Pokémon Black 2', 'pokemon-black-2', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'YES', DATE '2012-06-23'),
    ('Pokémon White 2', 'pokemon-white-2', 'Pokémon', '["Nintendo DS"]', '["Nintendo"]', 'YES', DATE '2012-06-23'),
    ('Pokémon X', 'pokemon-x', 'Pokémon', '["Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '2013-10-12'),
    ('Pokémon Y', 'pokemon-y', 'Pokémon', '["Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '2013-10-12'),
    ('Pokémon Omega Ruby', 'pokemon-omega-ruby', 'Pokémon', '["Nintendo 3DS"]', '["Nintendo"]', 'YES', DATE '2014-11-21'),
    ('Pokémon Alpha Sapphire', 'pokemon-alpha-sapphire', 'Pokémon', '["Nintendo 3DS"]', '["Nintendo"]', 'YES', DATE '2014-11-21'),
    ('Pokémon Sun', 'pokemon-sun', 'Pokémon', '["Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '2016-11-18'),
    ('Pokémon Moon', 'pokemon-moon', 'Pokémon', '["Nintendo 3DS"]', '["Nintendo"]', 'NO', DATE '2016-11-18'),
    ('Pokémon Ultra Sun', 'pokemon-ultra-sun', 'Pokémon', '["Nintendo 3DS"]', '["Nintendo"]', 'YES', DATE '2017-11-17'),
    ('Pokémon Ultra Moon', 'pokemon-ultra-moon', 'Pokémon', '["Nintendo 3DS"]', '["Nintendo"]', 'YES', DATE '2017-11-17'),
    ('Pokémon Let''s Go, Pikachu!', 'pokemon-let-s-go-pikachu', 'Pokémon', '["Nintendo Switch"]', '["Nintendo"]', 'YES', DATE '2018-11-16'),
    ('Pokémon Let''s Go, Eevee!', 'pokemon-let-s-go-eevee', 'Pokémon', '["Nintendo Switch"]', '["Nintendo"]', 'YES', DATE '2018-11-16'),
    ('Pokémon Sword', 'pokemon-sword', 'Pokémon', '["Nintendo Switch"]', '["Nintendo"]', 'NO', DATE '2019-11-15'),
    ('Pokémon Shield', 'pokemon-shield', 'Pokémon', '["Nintendo Switch"]', '["Nintendo"]', 'NO', DATE '2019-11-15'),
    ('Pokémon Brilliant Diamond', 'pokemon-brilliant-diamond', 'Pokémon', '["Nintendo Switch"]', '["Nintendo"]', 'YES', DATE '2021-11-19'),
    ('Pokémon Shining Pearl', 'pokemon-shining-pearl', 'Pokémon', '["Nintendo Switch"]', '["Nintendo"]', 'YES', DATE '2021-11-19'),
    ('Pokémon Scarlet', 'pokemon-scarlet', 'Pokémon', '["Nintendo Switch"]', '["Nintendo"]', 'NO', DATE '2022-11-18'),
    ('Pokémon Violet', 'pokemon-violet', 'Pokémon', '["Nintendo Switch"]', '["Nintendo"]', 'NO', DATE '2022-11-18')
ON CONFLICT (slug) DO UPDATE SET
    nome = EXCLUDED.nome,
    franchise = EXCLUDED.franchise,
    plataforms = EXCLUDED.plataforms,
    parent_plataforms = EXCLUDED.parent_plataforms,
    remake = EXCLUDED.remake,
    release_date = EXCLUDED.release_date;

COMMIT;
