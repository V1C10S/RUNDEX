"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "../../CNPJ/header/header";
import Footer from "../../CNPJ/footer/footer";
import Rollback from "../../CNPJ/rollback/rollback";
import { apiFetch } from "../../fetch/api";
import { heroesPorJogo } from "../../CNPJ/detonado/heroes";
import "../../detonados/[slug]/hero.css";
import "../../CNPJ/catalog/letter.css";
import "./posgame.css";

type Categoria = "lendarios" | "pos-game";
type DadosPosGame = {
    nome: string;
    plataformas: string[];
    game: {
        slug: string;
        caps: string[];
        dicas: Record<string, unknown>;
        images: Record<string, unknown>;
        categorias: Record<string, Categoria>;
    } | null;
};
type Resultado = { slug: string } & (
    | { estado: "pronto"; dados: DadosPosGame }
    | { estado: "inexistente" | "erro" }
);

function arteConsole(plataformas: string[]): string | null {
    const nomes = plataformas.map((plataforma) => plataforma.trim().toUpperCase());
    const grupos = [
        { nomes: ["GAME BOY", "GAME BOY COLOR"], imagem: "/usaveis/GAME BOY.png" },
        { nomes: ["GAME BOY ADVANCE"], imagem: "/usaveis/ADVANCED.png" },
        { nomes: ["NINTENDO DS", "NINTENDO 3DS", "DS", "3DS"], imagem: "/usaveis/DS.png" },
        { nomes: ["NINTENDO SWITCH", "NINTENDO SWITCH 2", "SWITCH", "SWITCH 2"], imagem: "/usaveis/SWITCH.png" },
    ];
    return grupos.find((grupo) => grupo.nomes.some((nome) => nomes.includes(nome)))?.imagem ?? null;
}

function ordenarCapitulos(game: NonNullable<DadosPosGame["game"]>) {
    const capitulos = game.caps.map((titulo, indice) => ({
        titulo,
        id: `capitulo-${indice + 1}`,
        categoria: game.categorias[titulo] ?? "pos-game",
    }));
    return [
        ...capitulos.filter((capitulo) => capitulo.categoria === "lendarios"),
        ...capitulos.filter((capitulo) => capitulo.categoria !== "lendarios"),
    ];
}

function PosGameConteudo() {
    const { slug } = useParams<{ slug: string }>();
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [capituloAtivo, setCapituloAtivo] = useState("");
    const [escolha, setEscolha] = useState<{ slug: string; categorias: Categoria[] } | null>(null);
    const atual = resultado?.slug === slug ? resultado : null;
    const dados = atual?.estado === "pronto" ? atual.dados : null;
    const game = dados?.game;
    const categoriasAbertas = escolha?.slug === slug ? escolha.categorias : [];
    const capitulos = game ? ordenarCapitulos(game) : [];

    useEffect(() => {
        const controller = new AbortController();
        async function carregar() {
            try {
                const resposta = await apiFetch(`/pos-game/${encodeURIComponent(slug)}`, { signal: controller.signal });
                if (resposta.status === 404) {
                    if (!controller.signal.aborted) setResultado({ slug, estado: "inexistente" });
                    return;
                }
                if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
                const dados: DadosPosGame = await resposta.json();
                if (!controller.signal.aborted) {
                    const match = window.location.hash.match(/^#capitulo-(\d+)$/);
                    const capitulo = match ? dados.game?.caps[Number(match[1]) - 1] : undefined;
                    const categoriaDoLink = capitulo ? dados.game?.categorias[capitulo] : undefined;
                    if (categoriaDoLink) setEscolha({ slug, categorias: [categoriaDoLink] });
                    setResultado({ slug, estado: "pronto", dados });
                }
            } catch {
                if (!controller.signal.aborted) setResultado({ slug, estado: "erro" });
            }
        }
        void carregar();
        return () => controller.abort();
    }, [slug]);

    useEffect(() => {
        if (!game) return;
        const ids = ordenarCapitulos(game).map((capitulo) => capitulo.id);
        if (!ids.length) return;
        const atualizar = () => {
            let ativo = ids[0];
            ids.forEach((id) => {
                const titulo = document.getElementById(id);
                if (titulo && titulo.getBoundingClientRect().top <= 140) ativo = id;
            });
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) ativo = ids[ids.length - 1];
            setCapituloAtivo(ativo);
        };
        atualizar();
        window.addEventListener("scroll", atualizar, { passive: true });
        return () => window.removeEventListener("scroll", atualizar);
    }, [game]);

    function selecionarCategoria(proxima: Categoria) {
        const categorias = categoriasAbertas.includes(proxima)
            ? categoriasAbertas.filter((item) => item !== proxima)
            : [...categoriasAbertas, proxima];
        setEscolha({ slug, categorias });
    }

    const titulo = dados?.nome.toLocaleUpperCase("pt-BR");
    const consoleImage = dados ? arteConsole(dados.plataformas) : null;
    let posicao = 0;

    return (
        <div className="posgame-page" lang="pt-BR">
            <div className="posgame-header"><Header /></div>
            {dados && heroesPorJogo[slug] && (
                <section className="hero" aria-label="Arte do jogo">
                    <div className="hero-image-area">
                        <Image src={heroesPorJogo[slug]} alt="" fill priority sizes="100vw" />
                    </div>
                </section>
            )}
            <main className="posgame-content">
                <div className="posgame-nav">
                    <Rollback href="/pos-game" label="Voltar ao pós-game" />
                    {dados && titulo && (
                        <div className="posgame-heading">
                            <h1 id="posgame-titulo" aria-label={titulo}>
                                <span className="poke-title" aria-hidden="true">
                                    {titulo.normalize("NFC").split(/\s+/).map((palavra, indice) => (
                                        <span className="poke-title-word" key={indice}>
                                            {Array.from(palavra).map((letra, indiceLetra) => (
                                                <span className="poke-title-letter" key={indiceLetra} style={{ animationDelay: `${300 + posicao++ * 600}ms` }}>{letra}</span>
                                            ))}
                                        </span>
                                    ))}
                                </span>
                            </h1>
                            {dados.plataformas.length > 0 && (
                                <ul className="posgame-badges" role="list" aria-label="Plataformas">
                                    {dados.plataformas.map((plataforma) => <li className="posgame-badge" key={plataforma}>{plataforma}</li>)}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
                {!atual && <p role="status">Carregando pós-game…</p>}
                {atual?.estado === "inexistente" && <h1>Jogo não encontrado</h1>}
                {atual?.estado === "erro" && <p role="alert">Não foi possível carregar o pós-game.</p>}
                {dados && (
                    <>
                        <div className="posgame-inicio-heading"><div className="posgame-inicio-line" aria-hidden="true" /><span className="posgame-inicio-title">INÍCIO</span></div>
                        <div className="posgame-layout">
                            <nav className="posgame-indice" aria-labelledby="posgame-capitulos">
                                <div className="posgame-indice-cabecalho">
                                    {consoleImage && <Image className="posgame-indice-console" data-console={consoleImage} src={consoleImage} alt="" width={2172} height={724} />}
                                    <h2 id="posgame-capitulos"><span className="posgame-indice-pokebola" aria-hidden="true" />CAPITULOS</h2>
                                </div>
                                <div className="posgame-categorias" role="group" aria-label="Categorias dos capítulos">
                                    {([
                                        { chave: "lendarios", titulo: "LENDÁRIOS" },
                                        { chave: "pos-game", titulo: "PÓS-GAME" },
                                    ] as const).map((grupo) => {
                                        const itens = capitulos.filter((capitulo) => capitulo.categoria === grupo.chave);
                                        const aberto = categoriasAbertas.includes(grupo.chave);
                                        return (
                                            <div className="posgame-categoria" key={grupo.chave}>
                                                <button type="button" aria-expanded={aberto} aria-controls={`posgame-lista-${grupo.chave}`} onClick={() => selecionarCategoria(grupo.chave)}>
                                                    {grupo.titulo}<span className="posgame-categoria-seta" aria-hidden="true" />
                                                </button>
                                                <div id={`posgame-lista-${grupo.chave}`} hidden={!aberto}>
                                                    {itens.length ? (
                                                        <ol>
                                                            {itens.map((capitulo, indice) => (
                                                                <li key={capitulo.id}>
                                                                    <a href={`#${capitulo.id}`} aria-current={capituloAtivo === capitulo.id ? "location" : undefined}>
                                                                        <span className="ribbon-numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span>
                                                                        <span className="ribbon-titulo">{capitulo.titulo}</span>
                                                                        <span className="ribbon-seta" aria-hidden="true" />
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </nav>
                            <div className="posgame-guia">
                                {capitulos.length ? capitulos.map((capitulo) => {
                                    const dica = game?.dicas[capitulo.titulo];
                                    const textos = typeof dica === "string" ? [dica] : Array.isArray(dica) ? dica.filter((item): item is string => typeof item === "string") : [];
                                    return <section key={capitulo.id} aria-labelledby={capitulo.id}><h2 id={capitulo.id} tabIndex={-1}>{capitulo.titulo}</h2>{textos.length ? textos.map((texto, i) => <p key={i}>{texto}</p>) : <p>O conteúdo deste capítulo ainda não foi adicionado.</p>}</section>;
                                }) : <p>O pós-game deste jogo ainda não está disponível.</p>}
                            </div>
                        </div>
                    </>
                )}
            </main>
            <div className="footer-container">
                <Footer />
            </div>
        </div>
    );
}

export default function PosGamePage() {
    return <Suspense fallback={<p role="status">Carregando pós-game…</p>}><PosGameConteudo /></Suspense>;
}
