BEGIN;

CREATE TABLE IF NOT EXISTS public.builds (
    slug TEXT PRIMARY KEY REFERENCES public.pokemon(slug)
);

ALTER TABLE public.builds
    ADD COLUMN IF NOT EXISTS caps TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS dicas JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '{}'::jsonb;

INSERT INTO public.builds (slug, caps, dicas)
VALUES ('pokemon-blue', ARRAY['1º GYM - BROCK', '2º GYM - MISTY', '3º GYM - LT. SURGE', '4º GYM - ERIKA', '5º GYM - KOGA', '6º GYM - SABRINA', '7º GYM - BLAINE', '8º GYM - GIOVANNI', 'ELITE FOUR - LORELEI', 'ELITE FOUR - BRUNO', 'ELITE FOUR - AGATHA', 'ELITE FOUR - LANCE', 'CHAMPION'],
    jsonb_build_object('1º GYM - BROCK', jsonb_build_array('Brock, líder especialista no tipo Pedra, usa um Geodude de nível 12 e um Onix de nível 14, ambos dos tipos Pedra e Terra e vulneráveis a golpes de Água, Planta, Lutador e Terra.', 'É recomendado usar um dos iniciais que têm vantagem contra Brock: Squirtle, do tipo Água, ou Bulbasaur, dos tipos Planta e Veneno.', 'Tenha cuidado com o golpe Bide de Onix, que acumula o dano recebido antes de devolvê-lo.')))
ON CONFLICT (slug) DO NOTHING;

COMMIT;

