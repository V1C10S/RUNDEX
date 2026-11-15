BEGIN;

CREATE TABLE IF NOT EXISTS public.game (
    slug TEXT PRIMARY KEY REFERENCES public.pokemon(slug),
    caps TEXT[] NOT NULL DEFAULT '{}',
    dicas JSONB NOT NULL DEFAULT '{}'::jsonb,
    images JSONB NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO public.game (slug)
VALUES ('pokemon-blue')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
