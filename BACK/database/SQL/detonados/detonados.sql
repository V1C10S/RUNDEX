BEGIN;



CREATE TABLE IF NOT EXISTS public.detonados (

    slug TEXT PRIMARY KEY REFERENCES public.pokemon(slug),

    caps TEXT[] NOT NULL DEFAULT '{}',

    walkthrough JSONB NOT NULL DEFAULT '{}'::jsonb,

    images JSONB NOT NULL DEFAULT '{}'::jsonb

);



DO $$

BEGIN

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'detonados' AND column_name = 'jogo_slug')

       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'detonados' AND column_name = 'slug') THEN

        ALTER TABLE public.detonados RENAME COLUMN jogo_slug TO slug;

    END IF;

END $$;



ALTER TABLE public.detonados ADD COLUMN IF NOT EXISTS caps TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.detonados ADD COLUMN IF NOT EXISTS walkthrough JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.detonados ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '{}'::jsonb;



-- Se a tabela antiga ainda existir, copia seu conteúdo antes de prosseguir.

DO $$

BEGIN

    IF to_regclass('public.caps') IS NOT NULL THEN

        UPDATE public.detonados d

        SET caps = c.nomes, walkthrough = c.textos

        FROM (SELECT slug, array_agg(titulo ORDER BY ordem) AS nomes,

                     jsonb_object_agg(titulo, to_jsonb(passos)) AS textos

              FROM public.caps GROUP BY slug) c

        WHERE d.slug = c.slug AND cardinality(d.caps) = 0;

    END IF;

END $$;



-- Os dados antigos de introdução e capa são preservados em backup antes da migração.

ALTER TABLE public.detonados DROP COLUMN IF EXISTS introducao;

ALTER TABLE public.detonados DROP COLUMN IF EXISTS capa_tematica;



-- Cadastro inicial em uma única linha. Não substitui o que já estiver salvo.

WITH capitulos(slug, ordem, titulo, passos) AS (VALUES

('pokemon-blue', 1, 'Pallet Town', ARRAY[

    'O Professor Carvalho apresenta o mundo Pokémon, pergunta seu nome e pede que você escolha o nome do seu rival.',

    'Ao sair de casa, siga até a grama ao norte para encontrar o professor, que levará você ao laboratório para escolher entre Bulbasaur, Charmander e Squirtle, antes da primeira batalha contra seu rival.',

    'Com seu primeiro Pokémon, siga para o norte pela Route 1 até Viridian City, enfrentando Pokémon selvagens pelo caminho para ganhar experiência.',

    'Em Viridian City, entre no Poké Mart, receba a encomenda do atendente e volte a Pallet Town para entregá-la ao Professor Carvalho e receber sua Pokédex.'

]),

('pokemon-blue', 2, 'Pewter City', ARRAY[

    'Depois de receber sua Pokédex, volte a Viridian City e siga ao norte pela Route 2 até a entrada da Viridian Forest.',

    'Atravesse a floresta, enfrentando treinadores e Pokémon selvagens pelo caminho, e continue para o norte até chegar a Pewter City.',

    'Na cidade, recupere sua equipe no Pokémon Center e entre no ginásio para enfrentar Brock, que entregará a primeira insígnia e a TM34, Bide, após a vitória.',

    'Com a insígnia em mãos, saia de Pewter pelo leste e siga pela Route 3 em direção a Cerulean City.'

]),

('pokemon-blue', 3, 'Cerulean City', ARRAY[

    'Atravesse a Route 3 e entre na caverna Mt. Moon, onde você encontrará treinadores e membros da Team Rocket.',

    'Antes de sair da caverna, enfrente o Super Nerd e escolha entre o Dome Fossil e o Helix Fossil, que mais tarde poderão ser revividos como Pokémon dos tipos Água e Pedra.',

    'Ao sair da caverna, siga para a direita pela Route 4 até chegar a Cerulean City.',

    'Saia de Cerulean pelo norte, enfrente seu rival e os treinadores da ponte, depois siga para leste até encontrar a casa de Bill.',

    'Converse com Bill, que está na forma de um Pokémon, e use o computador para ajudá-lo a voltar ao normal e receber o S.S. Ticket.',

    'Volte a Cerulean City, derrote Misty para conquistar sua segunda insígnia e siga pela casa ao norte do ginásio, onde antes havia um policial.'

]),

('pokemon-blue', 4, 'Vermilion City', ARRAY[

    'Passe pela casa roubada em Cerulean e siga ao sul pela Route 5, onde fica o Pokémon Day Care, depois entre na casa ao sudeste para atravessar a passagem subterrânea até a Route 6 e continuar para Vermilion City.',

    'No porto ao sul da cidade, apresente o S.S. Ticket para embarcar na S.S. Anne, suba até encontrar seu rival e, depois de vencê-lo, fale com o capitão para receber HM01 Cut.',

    'Ao deixar o navio, a S.S. Anne partirá do porto, então ensine Cut a um Pokémon compatível e use o golpe na árvore diante do ginásio.',

    'Dentro do ginásio, encontre o primeiro interruptor nos cestos e procure o segundo em um cesto vizinho, depois derrote o líder Lt. Surge para receber sua terceira insígnia, a Thunder Badge.'

]),

('pokemon-blue', 5, 'Celadon City', ARRAY[

    '(DICA) Para iluminar o Rock Tunnel, siga para leste de Vermilion e atravesse a Diglett’s Cave até a Route 2, onde você poderá usar Cut e falar com o ajudante do Professor Carvalho para receber HM05 Flash após registrar dez espécies capturadas na Pokédex.',

    'Volte a Cerulean City e siga para leste, usando Cut na árvore que bloqueia a passagem, depois atravesse as Routes 9 e 10 até encontrar um Pokémon Center ao lado da entrada do Rock Tunnel.',

    'Atravesse o Rock Tunnel e siga para Lavender Town, depois vá para oeste pela Route 8 e use a passagem subterrânea até a Route 7 para chegar a Celadon City.',

    'No Game Corner, derrote o membro da Team Rocket diante do pôster e examine-o para abrir o esconderijo, depois encontre a Lift Key e use o elevador para chegar a Giovanni e receber o Silph Scope após a batalha.',

    'Ao sul de Celadon, use Cut para chegar ao ginásio e derrote Erika, líder do tipo Planta, para conquistar sua quarta insígnia, a Rainbow Badge.',

    'Suba o Celadon Mall até o terraço e compre uma bebida em uma das máquinas, para entregá-la a um guarda quando for acessar Saffron City.'

]),

('pokemon-blue', 6, 'Fuchsia City', ARRAY[

    'Em Lavender Town, entre na Pokémon Tower com o Silph Scope e suba até enfrentar o espírito de Marowak, um Pokémon do tipo Terra que bloqueia a passagem.',

    'Depois da batalha, continue até o último andar, derrote os membros da Team Rocket e fale com Mr. Fuji, que levará você à casa dele e entregará a Poké Flute.',

    'Siga ao sul de Lavender pela Route 12, use a Poké Flute para acordar o Snorlax que bloqueia o caminho e continue pelas Routes 13, 14 e 15 até Fuchsia City.',

    'Ao norte de Fuchsia, entre na Safari Zone e atravesse as áreas até encontrar a Secret House para receber HM03 Surf, aproveitando para pegar os Gold Teeth no caminho.',

    'Entregue os Gold Teeth ao guarda na casa ao sul de Fuchsia para receber HM04 Strength, depois enfrente Koga, líder do tipo Veneno, para conquistar sua quinta insígnia, a Soul Badge.',

    'Depois da vitória, volte a Lavender pelo mesmo caminho para seguir em direção a Saffron City.'

]),

('pokemon-blue', 7, 'Saffron City', ARRAY[

    'Entregue a bebida comprada no Celadon Mall a qualquer um dos guardas de Saffron City para liberar o acesso à cidade.',

    'Ao norte de Saffron, visite o Fighting Dojo ao lado do ginásio e derrote os treinadores para escolher entre os Pokémon do tipo Lutador Hitmonlee e Hitmonchan.',

    'Entre na Silph Co., o grande prédio no centro da cidade, enfrente a Team Rocket e encontre o Card Key no quinto andar para abrir as salas trancadas.',

    'No terceiro andar, use o teletransportador de uma das salas trancadas para avançar pela empresa, enfrentar seu rival e seguir até Giovanni, o líder da Team Rocket.',

    'Após derrotar Giovanni, fale com o presidente da Silph Co. para receber a Master Ball e siga para o ginásio, onde poderá enfrentar Sabrina, líder do tipo Psíquico, pela Marsh Badge.'

]),

('pokemon-blue', 8, 'Cinnabar Island', ARRAY[

    'Volte a Pallet Town e use Surf ao sul pela Route 21 até chegar a Cinnabar Island.',

    'Entre na Pokémon Mansion, ao norte da ilha, e acione os interruptores das estátuas para abrir as passagens até encontrar a Secret Key no porão.',

    'Saia da mansão e use a Secret Key para abrir o ginásio de Blaine, líder do tipo Fogo, depois derrote-o para receber a Volcano Badge e volte a Pallet Town.'

]),

('pokemon-blue', 9, 'Viridian City', ARRAY[

    'De Pallet Town, siga para Viridian City e entre no ginásio para enfrentar Giovanni, líder do tipo Terra e da Team Rocket.',

    'Após derrotá-lo e receber sua última insígnia, a Earth Badge, saia para oeste pela Route 22 em direção à Victory Road.'

]),

('pokemon-blue', 10, 'Victory Road', ARRAY[

    'Na Route 22, enfrente seu rival e continue pela Route 23, passando pelos guardas que verificam suas insígnias até chegar à Victory Road.',

    'Leve Pokémon que possam usar Surf e Strength e, dentro da caverna, use HM04 Strength para empurrar as pedras sobre os interruptores e liberar as passagens.',

    'Ao sair da Victory Road, siga até Indigo Plateau, onde você encontrará um Pokémon Center e uma loja para preparar sua equipe antes da Liga.'

]),

('pokemon-blue', 11, 'Elite Four', ARRAY[

    'A Elite Four reúne quatro dos melhores treinadores de Kanto que devem ser enfrentados em sequência, sendo Lorelei, especialista no tipo Gelo que também usa Pokémon de Água, e Bruno, especialista no tipo Lutador que também usa Pokémon de Pedra.',

    'Os próximos desafios são Agatha, especialista no tipo Fantasma que também usa Pokémon do tipo Veneno, e Lance, especialista no tipo Dragão que também usa Pokémon do tipo Voador.',

    'Prepare sua equipe e compre itens de recuperação antes de entrar, pois não será possível voltar ao Pokémon Center entre as batalhas, embora você possa usar itens na equipe entre elas.'

]),

('pokemon-blue', 12, 'Champion', ARRAY[

    'Após vencer Lance, enfrente o campeão de Kanto, seu rival, que chegou à Liga antes de você e possui uma equipe que varia conforme o inicial escolhido no começo da jornada.',

    'A batalha contra o campeão acontece em seguida à Elite Four, então use os itens de recuperação que tiver disponíveis antes de entrar na sala.',

    'Após a vitória, o Professor Carvalho parabenizará você e o acompanhará até o Hall of Fame, onde sua equipe será registrada e a campanha principal chegará ao fim.'

])

)

INSERT INTO public.detonados (slug, caps, walkthrough)

SELECT slug, array_agg(titulo ORDER BY ordem),

       jsonb_object_agg(titulo, to_jsonb(passos))

FROM capitulos GROUP BY slug

ON CONFLICT (slug) DO UPDATE

SET caps = EXCLUDED.caps, walkthrough = EXCLUDED.walkthrough

WHERE cardinality(public.detonados.caps) = 0

  AND public.detonados.walkthrough = '{}'::jsonb;



-- Cópias iniciais do guia de Pokémon Blue; cada jogo pode ser revisado separadamente.
INSERT INTO public.detonados (slug, caps, walkthrough, images)
SELECT alvo.slug, origem.caps, origem.walkthrough, origem.images
FROM public.detonados AS origem
JOIN public.pokemon AS alvo ON alvo.slug IN (
    'pokemon-red', 'pokemon-green', 'pokemon-yellow',
    'pokemon-fire-red', 'pokemon-leaf-green',
    'pokemon-let-s-go-pikachu', 'pokemon-let-s-go-eevee'
)
WHERE origem.slug = 'pokemon-blue'
ON CONFLICT (slug) DO NOTHING;

-- Campanha principal de Pokémon Gold e Silver, até o Champion.
WITH capitulos_johto (ordem, titulo, passos) AS (
VALUES
(1, 'New Bark Town', ARRAY[
    'O Professor Carvalho apresenta o mundo Pokémon e pergunta seu nome, depois você ajusta o relógio e começa sua jornada em New Bark Town.',
    'Desça as escadas e fale com sua mãe para receber a Pokégear, depois vá ao laboratório do Professor Elm e escolha entre Chikorita, Cyndaquil e Totodile.',
    'Elm pedirá que você visite Mr. Pokémon, então receba uma Potion do assistente e saia de New Bark pelo oeste, seguindo pela Route 29 até Cherrygrove City.'
]),
(2, 'Cherrygrove City', ARRAY[
    'Ao chegar em Cherrygrove, acompanhe o morador que apresenta a cidade para receber o mapa na Pokégear, depois saia pelo norte e siga pela Route 30 até a casa de Mr. Pokémon.',
    'Receba o Mystery Egg de Mr. Pokémon e a Pokédex do Professor Carvalho, depois atenda à ligação de Elm e volte em direção a New Bark Town.',
    'Ao passar por Cherrygrove, enfrente o garoto que roubou um dos Pokémon do laboratório e continue para New Bark, onde você contará à polícia o nome do seu rival e entregará o ovo ao Professor Elm.',
    'Receba Poké Balls do assistente, volte a Cherrygrove e siga ao norte pelas Routes 30 e 31 até chegar a Violet City.'
]),
(3, 'Violet City', ARRAY[
    'Em Violet City, entre na Sprout Tower ao norte e suba enfrentando os treinadores até vencer o sábio no último andar, que entregará HM05 Flash.',
    'Vá ao ginásio e derrote Falkner, líder especialista no tipo Voador, para conquistar a Zephyr Badge, depois fale com o assistente de Elm no Pokémon Center para receber o ovo, deixando um espaço livre na equipe.',
    'Saia de Violet pelo sul, atravesse a Route 32 e entre na Union Cave, depois continue pela Route 33 até Azalea Town.'
]),
(4, 'Azalea Town', ARRAY[
    'Em Azalea Town, fale com Kurt na casa ao noroeste para descobrir o que está acontecendo com os Slowpoke, depois entre no Slowpoke Well e derrote os membros da Team Rocket.',
    'Com o poço livre, entre no ginásio e vença Bugsy, líder especialista no tipo Inseto, para receber a Hive Badge.',
    'Ao sair pela passagem a oeste da cidade, enfrente seu rival e entre na Ilex Forest, onde você deve conduzir o Farfetch’d perdido de volta ao seu dono para receber HM01 Cut.',
    'Ensine Cut a um Pokémon, corte a árvore que bloqueia a floresta e siga pela Route 34 até Goldenrod City.'
]),
(5, 'Goldenrod City', ARRAY[
    'Em Goldenrod City, entre no ginásio e derrote Whitney, líder especialista no tipo Normal, depois fale com uma das treinadoras e converse novamente com Whitney para receber a Plain Badge.',
    'Na floricultura ao lado do ginásio, receba a Squirtbottle e saia pelo norte, atravessando a Route 35 e o National Park até encontrar a árvore que bloqueia a Route 36.',
    'Use a Squirtbottle na árvore para enfrentar Sudowoodo e, após capturá-lo ou vencê-lo, siga pela Route 37 até Ecruteak City.'
]),
(6, 'Ecruteak City', ARRAY[
    'Em Ecruteak City, entre na Burned Tower ao noroeste, enfrente seu rival e desça até encontrar Raikou, Entei e Suicune, que fugirão da torre.',
    'Na casa de dança ao norte do Pokémon Center, derrote as cinco Kimono Girls e fale com o homem presente para receber HM03 Surf.',
    'Entre no ginásio e atravesse o caminho invisível até Morty, líder especialista no tipo Fantasma, depois vença a batalha para receber a Fog Badge e poder usar Surf fora das batalhas.',
    'Saia de Ecruteak pelo oeste e atravesse as Routes 38 e 39 até Olivine City.'
]),
(7, 'Cianwood City', ARRAY[
    'Em Olivine City, suba o farol e fale com Jasmine, que está cuidando do Ampharos doente, depois receba HM04 Strength do marinheiro em uma casa ao sul da cidade.',
    'Use Surf a partir da praia de Olivine e atravesse as Routes 40 e 41 até Cianwood City, enfrentando os treinadores pelo caminho.',
    'Na farmácia ao sul de Cianwood, fale com o atendente para receber a SecretPotion necessária para Ampharos.',
    'Entre no ginásio e derrote Chuck, líder especialista no tipo Lutador, para receber a Storm Badge, depois fale com a mulher do lado de fora para ganhar HM02 Fly e volte a Olivine.'
]),
(8, 'Olivine City', ARRAY[
    'De volta a Olivine, suba o farol e entregue a SecretPotion a Jasmine, que cuidará de Ampharos e retornará ao ginásio.',
    'Entre no ginásio e derrote Jasmine, líder especialista no tipo Aço, para conquistar a Mineral Badge.',
    'Volte a Ecruteak City e saia pelo leste, atravessando a Route 42 até Mahogany Town.'
]),
(9, 'Mahogany Town', ARRAY[
    'Siga ao norte de Mahogany pela Route 43 até o Lake of Rage, use Surf para alcançar o Gyarados vermelho e capture-o ou derrote-o, depois fale com Lance na margem do lago.',
    'Volte a Mahogany e encontre Lance na loja, onde ele revelará a entrada do esconderijo da Team Rocket, então desça e enfrente os membros da equipe.',
    'No esconderijo, obtenha as duas senhas com os membros da Team Rocket, vença o executivo e fale com o Murkrow para descobrir a senha que abre a sala do gerador.',
    'Entre na sala, ajude Lance a derrotar os Electrode e receba HM06 Whirlpool, depois saia e derrote Pryce, líder especialista no tipo Gelo, no ginásio de Mahogany para conquistar a Glacier Badge.',
    'Após receber a ligação de Elm, volte a Goldenrod City e entre na Radio Tower, suba até derrotar o impostor no andar superior e receba a Basement Key.',
    'Use a chave na passagem subterrânea de Goldenrod, enfrente seu rival e acione os interruptores para alcançar o verdadeiro diretor, que entregará a Card Key.',
    'Retorne à Radio Tower, use a Card Key para abrir a passagem bloqueada e derrote os membros restantes da Team Rocket, depois volte a Mahogany e saia pelo leste em direção à Route 44.'
]),
(10, 'Blackthorn City', ARRAY[
    'Atravesse a Route 44 e entre no Ice Path, onde você deve pegar HM07 Waterfall e usar Strength para empurrar as pedras nos buracos antes de continuar até Blackthorn City.',
    'No ginásio, use Strength para abrir caminho e derrote Clair, líder especialista no tipo Dragão, que pedirá uma prova antes de entregar a insígnia.',
    'Use Surf atrás do ginásio para entrar na Dragon’s Den, atravesse o redemoinho com Whirlpool e encontre a Dragon Fang para receber de Clair a Rising Badge.',
    'Depois da ligação de Elm, volte ao laboratório em New Bark para receber a Master Ball, então use Surf a leste da cidade e atravesse a Route 27 e as Tohjo Falls, usando Waterfall nas cachoeiras.',
    'Continue pela Route 27 e pela Route 26 até a entrada da Victory Road, apresente suas oito insígnias aos guardas e atravesse a caverna, enfrentando seu rival perto da saída para chegar ao Indigo Plateau.'
]),
(11, 'Elite Four', ARRAY[
    'A Elite Four reúne quatro dos melhores treinadores de Johto que devem ser enfrentados em sequência, sendo Will, especialista no tipo Psíquico, e Koga, especialista no tipo Veneno que também usa Pokémon do tipo Inseto.',
    'Os próximos desafios são Bruno, especialista no tipo Lutador que também usa um Pokémon do tipo Pedra, e Karen, especialista no tipo Sombrio que também usa Pokémon de outros tipos.',
    'Prepare sua equipe e compre itens de recuperação antes de entrar, pois não será possível voltar ao Pokémon Center entre as batalhas, embora você possa usar itens na equipe entre elas.'
]),
(12, 'Champion', ARRAY[
    'Após vencer Karen, enfrente o Champion da Liga Pokémon, Lance, especialista no tipo Dragão que também usa Pokémon do tipo Voador.',
    'A batalha contra o Champion acontece em seguida à Elite Four, então use os itens de recuperação que tiver disponíveis antes de entrar na sala.',
    'Após a vitória, Lance acompanhará você até o Hall of Fame, onde sua equipe será registrada e a primeira parte da jornada chegará ao fim.'
])
),
guia_johto AS (
    SELECT array_agg(titulo ORDER BY ordem) AS caps,
           jsonb_object_agg(titulo, to_jsonb(passos)) AS walkthrough
    FROM capitulos_johto
)
INSERT INTO public.detonados (slug, caps, walkthrough)
SELECT jogo.slug, guia.caps, guia.walkthrough
FROM public.pokemon AS jogo
CROSS JOIN guia_johto AS guia
WHERE jogo.slug IN ('pokemon-gold', 'pokemon-silver')
ON CONFLICT (slug) DO UPDATE
SET caps = EXCLUDED.caps, walkthrough = EXCLUDED.walkthrough
WHERE public.detonados.walkthrough = '{}'::jsonb
  AND (cardinality(public.detonados.caps) = 0 OR public.detonados.caps = EXCLUDED.caps);

-- Campanha de Pokémon Crystal, com os eventos próprios dessa versão.
INSERT INTO public.detonados (slug, caps, walkthrough)
SELECT alvo.slug, origem.caps, jsonb_set(jsonb_set(jsonb_set(jsonb_set(origem.walkthrough, ARRAY['New Bark Town'], jsonb_build_array('O Professor Carvalho apresenta o mundo Pokémon e pergunta seu nome, depois você escolhe seu personagem e começa a jornada em New Bark Town.', 'Fale com sua mãe para receber a Pokégear, depois vá ao laboratório do Professor Elm e escolha entre Chikorita, Cyndaquil e Totodile.', 'Elm pedirá que você visite Mr. Pokémon, então receba uma Potion do assistente e saia de New Bark pelo oeste, seguindo pela Route 29 até Cherrygrove City.'), true), ARRAY['Ecruteak City'], jsonb_build_array('Em Ecruteak City, entre na Burned Tower ao noroeste, conheça Eusine e enfrente seu rival, depois desça até encontrar Raikou, Entei e Suicune, que fugirão da torre.', 'Na casa de dança ao norte do Pokémon Center, derrote as cinco Kimono Girls e fale com o homem presente para receber HM03 Surf.', 'Entre no ginásio e atravesse o caminho invisível até Morty, líder especialista no tipo Fantasma, depois vença a batalha para receber a Fog Badge e poder usar Surf fora das batalhas.', 'Saia de Ecruteak pelo oeste e atravesse as Routes 38 e 39 até Olivine City.'), true), ARRAY['Cianwood City'], jsonb_build_array('Em Olivine City, suba o farol e fale com Jasmine, que está cuidando do Ampharos doente, depois receba HM04 Strength do marinheiro em uma casa ao sul da cidade.', 'Use Surf a partir da praia de Olivine e atravesse as Routes 40 e 41 até Cianwood City, enfrentando os treinadores pelo caminho.', 'Ao norte da cidade, encontre Suicune e enfrente Eusine, depois vá à farmácia ao sul de Cianwood e receba a SecretPotion para Ampharos.', 'Entre no ginásio e derrote Chuck, líder especialista no tipo Lutador, para receber a Storm Badge, depois fale com a mulher do lado de fora para ganhar HM02 Fly e volte a Olivine.'), true), ARRAY['Blackthorn City'], jsonb_build_array('Atravesse a Route 44 e entre no Ice Path, onde você deve pegar HM07 Waterfall e usar Strength para empurrar as pedras nos buracos antes de continuar até Blackthorn City.', 'No ginásio, use Strength para abrir caminho e derrote Clair, líder especialista no tipo Dragão, que pedirá uma prova antes de entregar a insígnia.', 'Use Surf atrás do ginásio para entrar na Dragon’s Den, atravesse o redemoinho com Whirlpool e entre no templo para responder às perguntas do ancião e receber de Clair a Rising Badge.', 'Depois da ligação de Elm, volte ao laboratório em New Bark para receber a Master Ball, então use Surf a leste da cidade e atravesse as Tohjo Falls, usando Waterfall nas cachoeiras.', 'Continue pelas Routes 27 e 26 até a entrada da Victory Road, apresente suas oito insígnias aos guardas e atravesse a caverna, enfrentando seu rival perto da saída para chegar ao Indigo Plateau.'), true)
FROM public.detonados AS origem
JOIN public.pokemon AS alvo ON alvo.slug = 'pokemon-crystal'
WHERE origem.slug = 'pokemon-gold'
ON CONFLICT (slug) DO UPDATE
SET caps = EXCLUDED.caps, walkthrough = EXCLUDED.walkthrough
WHERE public.detonados.walkthrough = '{}'::jsonb
  AND (cardinality(public.detonados.caps) = 0 OR public.detonados.caps = EXCLUDED.caps);

-- Os remakes compartilham a estrutura, com mudanças próprias de sua jornada.
INSERT INTO public.detonados (slug, caps, walkthrough)
SELECT alvo.slug, origem.caps, jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(origem.walkthrough, ARRAY['New Bark Town'], jsonb_build_array('O Professor Carvalho apresenta o mundo Pokémon, pede que você escolha seu personagem e pergunta seu nome antes do início da jornada em New Bark Town.', 'Vá ao laboratório do Professor Elm e escolha entre Chikorita, Cyndaquil e Totodile, depois receba Potions do assistente ao sair.', 'Fale com sua mãe para receber a Pokégear e saia de New Bark pelo oeste, seguindo pela Route 29 até Cherrygrove City para procurar Mr. Pokémon.'), true), ARRAY['Cherrygrove City'], jsonb_build_array('Acompanhe o morador que apresenta Cherrygrove e receba os Running Shoes, depois siga pela saída norte da cidade para receber o mapa da Pokégear e continue pela Route 30 até a casa de Mr. Pokémon.', 'Receba o Mystery Egg de Mr. Pokémon e a Pokédex do Professor Carvalho, depois atenda à ligação de Elm e volte em direção a New Bark Town.', 'Ao sair de Cherrygrove, enfrente o garoto que roubou um dos Pokémon do laboratório e volte a New Bark, onde você contará o nome do seu rival e entregará o ovo a Elm.', 'Ao sair de New Bark, acompanhe a demonstração de captura de Ethan ou Lyra e receba Poké Balls, depois volte a Cherrygrove e siga pelas Routes 30 e 31 até Violet City.'), true), ARRAY['Violet City'], jsonb_build_array('Em Violet City, entre na Sprout Tower ao norte e suba enfrentando os treinadores até vencer o sábio no último andar, que entregará TM70 Flash.', 'Vá ao ginásio e derrote Falkner, líder especialista no tipo Voador, para conquistar a Zephyr Badge, depois encontre o assistente de Elm no Poké Mart para receber o ovo, deixando um espaço livre na equipe.', 'Saia de Violet pelo sul, atravesse a Route 32 e entre na Union Cave, depois continue pela Route 33 até Azalea Town.'), true), ARRAY['Azalea Town'], jsonb_build_array('Em Azalea Town, fale com Kurt na casa ao noroeste para descobrir o que está acontecendo com os Slowpoke, depois entre no Slowpoke Well e derrote os membros da Team Rocket.', 'Com o poço livre, entre no ginásio e vença Bugsy, líder especialista no tipo Inseto, para receber a Hive Badge.', 'Ao sair pela passagem a oeste da cidade, enfrente seu rival e entre na Ilex Forest, onde você deve conduzir os dois Farfetch’d perdidos de volta ao lenhador para receber HM01 Cut.', 'Ensine Cut a um Pokémon, corte a árvore que bloqueia a floresta e siga pela Route 34 até Goldenrod City.'), true), ARRAY['Goldenrod City'], jsonb_build_array('Em Goldenrod City, entre na Radio Tower e responda ao questionário no balcão para receber o Radio Card e encontrar Whitney, que voltará ao ginásio.', 'Vá ao ginásio e derrote Whitney, líder especialista no tipo Normal, depois fale com uma das treinadoras e converse novamente com ela para receber a Plain Badge.', 'Na floricultura ao lado do ginásio, receba a Squirtbottle e saia pelo norte, atravessando a Route 35 e o National Park até encontrar a árvore que bloqueia a Route 36.', 'Use a Squirtbottle na árvore para enfrentar Sudowoodo e, após capturá-lo ou vencê-lo, siga pela Route 37 até Ecruteak City.'), true), ARRAY['Ecruteak City'], jsonb_build_array('Em Ecruteak City, entre no Dance Theater ao norte do Pokémon Center e derrote o membro da Team Rocket que incomoda uma Kimono Girl, depois fale com o homem presente para receber HM03 Surf.', 'Entre na Burned Tower ao noroeste, enfrente seu rival e desça até encontrar Raikou, Entei e Suicune, que fugirão da torre.', 'Entre no ginásio e atravesse o caminho até Morty, líder especialista no tipo Fantasma, depois vença a batalha para receber a Fog Badge e poder usar Surf fora das batalhas.', 'Saia de Ecruteak pelo leste e fale com o homem perto do Mt. Mortar para receber HM04 Strength, depois volte à cidade e siga pelo oeste através das Routes 38 e 39 até Olivine City.'), true), ARRAY['Cianwood City'], jsonb_build_array('Em Olivine City, suba o farol e fale com Jasmine, que está cuidando do Ampharos doente e precisa de um remédio de Cianwood.', 'Use Surf a partir da praia de Olivine e atravesse as Routes 40 e 41 até Cianwood City, enfrentando os treinadores pelo caminho.', 'Na farmácia ao lado do Pokémon Center, fale com o atendente para receber a SecretPotion necessária para Ampharos.', 'No ginásio, desligue a cachoeira e derrote Chuck, líder especialista no tipo Lutador, para receber a Storm Badge, depois fale com a mulher do lado de fora para ganhar HM02 Fly e volte a Olivine.'), true), ARRAY['Mahogany Town'], jsonb_build_array('Siga ao norte de Mahogany pela Route 43 até o Lake of Rage, use Surf para alcançar o Gyarados vermelho e capture-o ou derrote-o, depois fale com Lance na margem do lago.', 'Volte a Mahogany e encontre Lance na loja, onde ele revelará a entrada do esconderijo da Team Rocket, então desça e enfrente os membros da equipe.', 'No esconderijo, obtenha as duas senhas com os membros da Team Rocket, vença o executivo e fale com o Murkrow para descobrir a senha que abre a sala do gerador.', 'Entre na sala, ajude Lance a derrotar os Electrode e receba HM05 Whirlpool, depois saia e derrote Pryce, líder especialista no tipo Gelo, para conquistar a Glacier Badge.', 'Após receber a ligação de Elm, volte a Goldenrod City, entre na passagem subterrânea e obtenha o uniforme da Team Rocket para acessar as escadas da Radio Tower.', 'Suba a Radio Tower, derrote o impostor e receba a Basement Key, depois use a chave na passagem subterrânea, enfrente seu rival e acione os interruptores para alcançar o diretor e receber a Card Key.', 'Retorne à Radio Tower, use a Card Key na passagem bloqueada e derrote os membros restantes da Team Rocket, depois volte a Mahogany e saia pelo leste em direção à Route 44.'), true), ARRAY['Blackthorn City'], jsonb_build_array('Atravesse a Route 44 e entre no Ice Path, onde você deve pegar HM07 Waterfall e usar Strength para empurrar as pedras nos buracos antes de continuar até Blackthorn City.', 'No ginásio, abra caminho e derrote Clair, líder especialista no tipo Dragão, que pedirá uma prova antes de entregar a insígnia.', 'Use Surf atrás do ginásio para entrar na Dragon’s Den, atravesse o redemoinho com Whirlpool e fale com o ancião no templo para responder às perguntas e receber de Clair a Rising Badge.', 'Após a ligação de Elm, volte ao laboratório em New Bark para receber a Master Ball, depois vá ao Dance Theater em Ecruteak e derrote as cinco Kimono Girls em sequência.', 'Em HeartGold, siga até a Bell Tower para encontrar Ho-Oh, enquanto em SoulSilver você deve atravessar as Whirl Islands para encontrar Lugia, então capture ou derrote o Pokémon da sua versão.', 'Volte a New Bark, use Surf a leste da cidade e atravesse as Tohjo Falls com Waterfall, depois continue pelas Routes 27 e 26 até a entrada da Victory Road.', 'Apresente suas oito insígnias aos guardas e atravesse a Victory Road, enfrentando seu rival perto da saída para chegar ao Indigo Plateau.'), true)
FROM public.detonados AS origem
JOIN public.pokemon AS alvo ON alvo.slug IN ('pokemon-heart-gold', 'pokemon-soul-silver')
WHERE origem.slug = 'pokemon-gold'
ON CONFLICT (slug) DO UPDATE
SET caps = EXCLUDED.caps, walkthrough = EXCLUDED.walkthrough
WHERE public.detonados.walkthrough = '{}'::jsonb
  AND (cardinality(public.detonados.caps) = 0 OR public.detonados.caps = EXCLUDED.caps);

-- Ajusta apenas a frase antiga, preservando o restante de cada detonado de Kanto.
UPDATE public.detonados
SET walkthrough = jsonb_set(walkthrough, '{Elite Four,0}',
    to_jsonb(replace(walkthrough #>> '{Elite Four,0}',
        'A Elite Four reúne quatro treinadores de Kanto',
        'A Elite Four reúne quatro dos melhores treinadores de Kanto')))
WHERE slug IN ('pokemon-blue', 'pokemon-red', 'pokemon-green', 'pokemon-yellow',
    'pokemon-fire-red', 'pokemon-leaf-green', 'pokemon-let-s-go-pikachu', 'pokemon-let-s-go-eevee')
  AND walkthrough #>> '{Elite Four,0}' LIKE 'A Elite Four reúne quatro treinadores de Kanto%';

-- Atualiza a pontuação da Elite Four sem alterar os demais textos.
UPDATE public.detonados
SET walkthrough = jsonb_set(walkthrough, '{Elite Four,0}',
    to_jsonb(replace(replace(walkthrough #>> '{Elite Four,0}',
        'sequência: Lorelei,', 'sequência, sendo Lorelei,'),
        'sequência: Will,', 'sequência, sendo Will,')))
WHERE slug IN ('pokemon-blue', 'pokemon-red', 'pokemon-green', 'pokemon-yellow',
    'pokemon-fire-red', 'pokemon-leaf-green', 'pokemon-let-s-go-pikachu', 'pokemon-let-s-go-eevee',
    'pokemon-gold', 'pokemon-silver', 'pokemon-heart-gold', 'pokemon-soul-silver')
  AND (walkthrough #>> '{Elite Four,0}' LIKE '%sequência: Lorelei,%'
       OR walkthrough #>> '{Elite Four,0}' LIKE '%sequência: Will,%');

-- Campanha principal de Pokémon Ruby e Sapphire, até o Champion.
WITH capitulos_hoenn (ordem, titulo, passos) AS (
VALUES
(1, 'Littleroot Town', ARRAY['O Professor Birch apresenta o mundo Pokémon e pergunta seu nome, depois você chega à sua nova casa em Littleroot Town.', 'Acerte o relógio no quarto e conheça o vizinho, depois siga ao norte pela Route 101 para ajudar o Professor Birch e escolha Treecko, Torchic ou Mudkip para enfrentar o Pokémon selvagem.', 'No laboratório, Birch pedirá que você procure seu rival, então atravesse Oldale Town e siga pela Route 103 para enfrentá-lo, depois volte ao laboratório para receber a Pokédex e Poké Balls.']),
(2, 'Petalburg City', ARRAY['Saia de Oldale pelo oeste e atravesse a Route 102 até Petalburg City, depois entre no ginásio para encontrar seu pai, Norman.', 'Acompanhe Wally enquanto ele captura seu primeiro Pokémon e volte ao ginásio, depois siga para oeste pela Route 104 e entre na Petalburg Woods.', 'Na floresta, ajude o funcionário da Devon contra um membro da equipe adversária e continue ao norte pela Route 104 até Rustboro City.']),
(3, 'Rustboro City', ARRAY['No ginásio de Rustboro, derrote Roxanne, líder especialista no tipo Pedra, para conquistar a Stone Badge.', 'Siga pela Route 116 até o Rusturf Tunnel e derrote o membro da equipe que roubou os Devon Goods, libertando também Peeko, o Pokémon de Mr. Briney.', 'Volte a Rustboro e entregue os Devon Goods ao funcionário, depois converse com o presidente da Devon para receber a PokéNav e as encomendas para Steven e Captain Stern.', 'Atravesse a Petalburg Woods em direção ao sul e fale com Mr. Briney na casa perto da praia para viajar de barco até Dewford Town.']),
(4, 'Dewford Town', ARRAY['Entre no ginásio de Dewford e derrote Brawly, líder especialista no tipo Lutador, para receber a Knuckle Badge.', 'Siga ao norte até a Granite Cave e receba HM05 Flash na entrada, depois atravesse a caverna e entregue a carta a Steven.', 'Volte ao barco e peça a Mr. Briney que leve você a Slateport City.']),
(5, 'Slateport City', ARRAY['Em Slateport, vá ao estaleiro e converse com Dock, depois entre no Oceanic Museum para encontrar Captain Stern.', 'Derrote os membros da equipe adversária e entregue os Devon Goods ao capitão, depois saia da cidade pelo norte.', 'Siga pelas Routes 110 e 103, enfrente seu rival no caminho e continue até Mauville City.']),
(6, 'Mauville City', ARRAY['Em Mauville, fale com Wally diante do ginásio e vença a batalha, depois entre e derrote Wattson, líder especialista no tipo Elétrico, para receber a Dynamo Badge.', 'Em uma casa da cidade, receba HM06 Rock Smash e pegue uma bicicleta na loja, depois saia pelo norte em direção à Route 111.', 'Como o deserto está bloqueado, siga pela Route 112 e atravesse o Fiery Path, depois continue pelas Routes 113 e 114 até Fallarbor Town.']),
(7, 'Fallarbor Town', ARRAY['Siga a oeste pela Route 114 e entre no Meteor Falls, onde você encontrará membros da equipe adversária com o Professor Cozmo.', 'Após os acontecimentos na caverna, volte à Route 112 e use o teleférico para subir ao Mt. Chimney.', 'No topo, enfrente a equipe adversária e seu líder para impedir seus planos, depois desça pelo Jagged Pass até Lavaridge Town.']),
(8, 'Lavaridge Town', ARRAY['No ginásio de Lavaridge, atravesse as passagens e derrote Flannery, líder especialista no tipo Fogo, para conquistar a Heat Badge.', 'Ao sair, receba os Go-Goggles do seu rival, depois retorne a Petalburg City para desafiar Norman.']),
(9, 'Petalburg Gym', ARRAY['Entre no ginásio de Petalburg com quatro insígnias, atravesse as salas e derrote Norman, líder especialista no tipo Normal, para receber a Balance Badge.', 'Na casa de Wally ao lado do ginásio, receba HM03 Surf e ensine o golpe a um Pokémon, depois volte a Mauville City e use Surf a leste pela Route 118.', 'Continue ao norte pela Route 119 até encontrar o Weather Institute, onde você deve derrotar a equipe adversária e libertar os pesquisadores.', 'Atravesse a ponte, vença seu rival para receber HM02 Fly e siga até Fortree City.']),
(10, 'Fortree City', ARRAY['O caminho para o ginásio de Fortree está bloqueado, então saia pelo leste e encontre Steven na ponte da Route 120 para receber o Devon Scope.', 'Use o Devon Scope para revelar o Kecleon invisível e volte ao ginásio, depois revele o Pokémon que bloqueia a entrada.', 'Derrote Winona, líder especialista no tipo Voador, para conquistar a Feather Badge e siga pelas Routes 120 e 121 até Lilycove City.']),
(11, 'Lilycove City', ARRAY['Saia de Lilycove pelo oeste e use Surf ao sul na Route 121 para chegar ao Mt. Pyre, depois suba ao topo e enfrente a equipe adversária.', 'Voe até Slateport e encontre Captain Stern no porto, onde a equipe roubará um submarino, depois volte a Lilycove e entre no esconderijo ao norte da praia.', 'Atravesse o esconderijo e enfrente os membros da equipe, depois saia e use Surf a leste até Mossdeep City.']),
(12, 'Mossdeep City', ARRAY['No ginásio de Mossdeep, vença a batalha em dupla contra Tate e Liza, especialistas no tipo Psíquico, para receber a Mind Badge.', 'Fale com Steven em sua casa para receber HM08 Dive, depois use Surf para seguir ao sul e mergulhe nas águas profundas da Route 128.', 'Encontre o submarino e entre na Seafloor Cavern, usando Strength e Rock Smash para atravessar os obstáculos, depois derrote o líder da equipe adversária.', 'Após o despertar de Groudon em Ruby ou Kyogre em Sapphire, siga até Sootopolis City usando Dive na entrada submersa cercada por rochas.']),
(13, 'Sootopolis City', ARRAY['Em Sootopolis, encontre Steven e entre na Cave of Origin para pegar HM07 Waterfall e chegar ao Pokémon lendário da sua versão.', 'Capture ou derrote Groudon em Ruby ou Kyogre em Sapphire, depois saia da caverna e entre no ginásio.', 'Atravesse os pisos de gelo e derrote Wallace, líder especialista no tipo Água, para conquistar a Rain Badge.', 'Com as oito insígnias, siga pela Route 128 até Ever Grande City e use Waterfall para subir a cachoeira, depois atravesse a Victory Road e enfrente Wally perto da saída para chegar à Liga Pokémon.']),
(14, 'Elite Four', ARRAY['A Elite Four reúne quatro dos melhores treinadores de Hoenn que devem ser enfrentados em sequência, sendo Sidney especialista no tipo Sombrio e Phoebe especialista no tipo Fantasma.', 'Os próximos desafios são Glacia, especialista no tipo Gelo que também usa Pokémon de Água, e Drake, especialista no tipo Dragão.', 'Prepare sua equipe e compre itens de recuperação antes de entrar, pois não será possível voltar ao Pokémon Center entre as batalhas, embora você possa usar itens na equipe entre elas.']),
(15, 'Champion', ARRAY['Após vencer Drake, enfrente o Champion da Liga Pokémon, Steven, que usa uma equipe com destaque para Pokémon dos tipos Aço e Pedra.', 'A batalha contra o Champion acontece em seguida à Elite Four, então use os itens de recuperação que tiver disponíveis antes de entrar na sala.', 'Após a vitória, Steven acompanhará você até o Hall of Fame, onde sua equipe será registrada e a campanha principal chegará ao fim.'])
), guia_hoenn AS (
    SELECT array_agg(titulo ORDER BY ordem) AS caps, jsonb_object_agg(titulo, to_jsonb(passos)) AS walkthrough
    FROM capitulos_hoenn
)
INSERT INTO public.detonados (slug, caps, walkthrough)
SELECT jogo.slug, guia.caps, guia.walkthrough
FROM public.pokemon AS jogo CROSS JOIN guia_hoenn AS guia
WHERE jogo.slug IN ('pokemon-ruby', 'pokemon-sapphire')
ON CONFLICT (slug) DO UPDATE
SET caps = EXCLUDED.caps, walkthrough = EXCLUDED.walkthrough
WHERE public.detonados.walkthrough = '{}'::jsonb
  AND (cardinality(public.detonados.caps) = 0 OR public.detonados.caps = EXCLUDED.caps);

-- Campanha de Pokémon Emerald, com seus eventos próprios.
INSERT INTO public.detonados (slug, caps, walkthrough)
SELECT alvo.slug, origem.caps, jsonb_set(jsonb_set(jsonb_set(jsonb_set(origem.walkthrough, ARRAY['Lilycove City'], jsonb_build_array('Saia de Lilycove pelo oeste e use Surf ao sul na Route 121 para chegar ao Mt. Pyre, depois suba ao topo e enfrente os membros da Team Aqua para receber o Magma Emblem.', 'Volte ao Mt. Chimney e desça pelo Jagged Pass até o emblema revelar a entrada do esconderijo da Team Magma, depois atravesse o local e enfrente Maxie.', 'Vá até o porto de Slateport e encontre Captain Stern, depois que a Team Aqua roubar o submarino, volte à praia de Lilycove e entre no esconderijo da equipe.', 'Atravesse o esconderijo e derrote os membros da Team Aqua, depois saia e use Surf a leste até Mossdeep City.'), true), ARRAY['Mossdeep City'], jsonb_build_array('No ginásio de Mossdeep, vença a batalha em dupla contra Tate e Liza, especialistas no tipo Psíquico, para receber a Mind Badge.', 'Vá ao Space Center e ajude Steven a enfrentar a Team Magma, depois fale com ele em sua casa para receber HM08 Dive.', 'Use Surf para seguir ao sul, mergulhe nas águas profundas da Route 128 e encontre o submarino na entrada da Seafloor Cavern.', 'Atravesse a caverna com Strength e Rock Smash e enfrente Archie, líder da Team Aqua, depois do despertar de Kyogre siga até Sootopolis City pela entrada submersa cercada por rochas.'), true), ARRAY['Sootopolis City'], jsonb_build_array('Em Sootopolis, encontre Steven e fale com Wallace na Cave of Origin, depois indique o Sky Pillar como o lugar onde Rayquaza pode ser encontrado.', 'Siga até o Sky Pillar na Route 131, a leste de Pacifidlog, e suba até o topo para despertar Rayquaza, depois volte a Sootopolis.', 'Após Rayquaza interromper o confronto entre Groudon e Kyogre, fale com Wallace para receber HM07 Waterfall e entrar no ginásio.', 'Atravesse os pisos de gelo e derrote Juan, líder especialista no tipo Água, para conquistar a Rain Badge.', 'Com as oito insígnias, siga pela Route 128 até Ever Grande City e use Waterfall para subir a cachoeira, depois atravesse a Victory Road e enfrente Wally para chegar à Liga Pokémon.'), true), ARRAY['Champion'], jsonb_build_array('Após vencer Drake, enfrente o Champion da Liga Pokémon, Wallace, especialista no tipo Água.', 'A batalha contra o Champion acontece em seguida à Elite Four, então use os itens de recuperação que tiver disponíveis antes de entrar na sala.', 'Após a vitória, Wallace acompanhará você até o Hall of Fame, onde sua equipe será registrada e a campanha principal chegará ao fim.'), true)
FROM public.detonados AS origem
JOIN public.pokemon AS alvo ON alvo.slug = 'pokemon-emerald'
WHERE origem.slug = 'pokemon-ruby'
ON CONFLICT (slug) DO UPDATE
SET caps = EXCLUDED.caps, walkthrough = EXCLUDED.walkthrough
WHERE public.detonados.walkthrough = '{}'::jsonb
  AND (cardinality(public.detonados.caps) = 0 OR public.detonados.caps = EXCLUDED.caps);

COMMIT;

