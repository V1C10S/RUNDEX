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
import "./builds.css";

type DadosBuilds = {
    nome: string;
    plataformas: string[];
    builds: { slug: string; caps: string[]; dicas: Record<string, unknown>; images: Record<string, unknown>; categorias: Record<string, string> } | null;
};

type Resultado = { slug: string } & (
    | { estado: "pronto"; dados: DadosBuilds }
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

function BuildsConteudo() {
    const { slug } = useParams<{ slug: string }>();
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [capituloAtivo, setCapituloAtivo] = useState("");
    const [escolha, setEscolha] = useState<{ slug: string; categorias: string[] } | null>(null);

    const atual = resultado?.slug === slug ? resultado : null;
    const dados = atual?.estado === "pronto" ? atual.dados : null;

    useEffect(() => {
        const controller = new AbortController();
        async function carregar() {
            try {
                const resposta = await apiFetch(`/builds/${encodeURIComponent(slug)}`, { signal: controller.signal });
                if (resposta.status === 404) {
                    if (!controller.signal.aborted) setResultado({ slug, estado: "inexistente" });
                    return;
                }
                if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
                const dados: DadosBuilds = await resposta.json();
                if (!controller.signal.aborted) {
                    const match = window.location.hash.match(/^#capitulo-(\d+)$/);
                    const capitulo = match ? dados.builds?.caps[Number(match[1]) - 1] : undefined;
                    const categoria = capitulo ? dados.builds?.categorias?.[capitulo] : undefined;
                    if (categoria) setEscolha({ slug, categorias: [categoria] });
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
        if (!dados?.builds?.caps.length) return;
        const caps = dados.builds.caps;
        const atualizar = () => {
            let ativo = "capitulo-1";
            caps.forEach((_, indice) => {
                const id = `capitulo-${indice + 1}`;
                const titulo = document.getElementById(id);
                if (titulo && titulo.getBoundingClientRect().top <= 140) ativo = id;
            });
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) ativo = `capitulo-${caps.length}`;
            setCapituloAtivo(ativo);
        };
        atualizar();
        window.addEventListener("scroll", atualizar, { passive: true });
        return () => window.removeEventListener("scroll", atualizar);
    }, [dados]);

    const titulo = dados?.nome.toLocaleUpperCase("pt-BR");
    const consoleImage = dados ? arteConsole(dados.plataformas) : null;
    let posicao = 0;

    return (
        <div className="builds-page">
            <section className="builds-header">
                <Header />
            </section>

            {dados && heroesPorJogo[slug] && (
                <section className="hero" aria-label="Arte do jogo">
                    <div className="hero-image-area">
                        <Image src={heroesPorJogo[slug]} alt="" fill priority sizes="100vw" />
                    </div>
                </section>
            )}

            <main className="builds-content">
                <div className="builds-nav">
                    <Rollback href="/builds" label="Voltar às builds" />
                    {dados && titulo && (
                        <div className="builds-heading">
                            <h1 id="builds-titulo" aria-label={titulo}>
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
                                <ul className="builds-badges" role="list" aria-label="Plataformas">
                                    {dados.plataformas.map((plataforma) => <li className="builds-badge" key={plataforma}>{plataforma}</li>)}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {!atual && <p role="status">Carregando builds…</p>}
                {atual?.estado === "inexistente" && <h1>Jogo não encontrado</h1>}
                {atual?.estado === "erro" && <p role="alert">Não foi possível carregar as builds.</p>}

                {dados && (
                    <>
                        <div className="builds-inicio-heading">
                            <div className="builds-inicio-line" aria-hidden="true" />
                            <span className="builds-inicio-title">INÍCIO</span>
                        </div>

                        {dados.builds && dados.builds.caps.length > 0 ? (
                            <section className="builds-layout" aria-label="Guia de builds">
                                <nav className="builds-indice" aria-labelledby="builds-capitulos">
                                    <div className="builds-indice-cabecalho">
                                        {consoleImage && <Image className="builds-indice-console" data-console={consoleImage} src={consoleImage} alt="" width={2172} height={724} />}
                                        <h2 id="builds-capitulos"><span className="builds-indice-pokebola" aria-hidden="true" />CAPITULOS</h2>
                                    </div>
                                    {dados.builds.caps.some((capitulo) => dados.builds?.categorias?.[capitulo]) ? (
                                        <div className="builds-categorias" role="group" aria-label="Categorias dos capítulos">
                                            {[
                                                { chave: "victory-road", titulo: "GYM" },
                                                { chave: "path-of-legends", titulo: "TITANS" },
                                                { chave: "starfall-street", titulo: "TEAM STAR" },
                                            ].map((grupo) => {
                                                const aberto = escolha?.slug === slug && escolha.categorias.includes(grupo.chave);
                                                const itens = dados.builds!.caps.map((capitulo, indice) => ({ capitulo, indice })).filter(({capitulo}) => dados.builds?.categorias?.[capitulo] === grupo.chave);
                                                return <div className="builds-categoria" key={grupo.chave}>
                                                    <button type="button" aria-expanded={aberto} aria-controls={"builds-lista-" + grupo.chave} onClick={() => setEscolha((anterior) => {
                                                        const abertas = anterior?.slug === slug ? anterior.categorias : [];
                                                        return { slug, categorias: abertas.includes(grupo.chave) ? abertas.filter((item) => item !== grupo.chave) : [...abertas, grupo.chave] };
                                                    })}>{grupo.titulo}<span className="builds-categoria-seta" aria-hidden="true" /></button>
                                                    <div id={"builds-lista-" + grupo.chave} hidden={!aberto}><ol>{itens.map(({ capitulo, indice }, ordem) => {
                                                        const id = "capitulo-" + (indice + 1);
                                                        return <li key={id}><a href={"#" + id} aria-current={capituloAtivo === id ? "location" : undefined}><span className="ribbon-numero" aria-hidden="true">{String(ordem + 1).padStart(2, "0")}</span><span className="ribbon-titulo">{capitulo}</span><span className="ribbon-seta" aria-hidden="true" /></a></li>;
                                                    })}</ol></div>
                                                </div>;
                                            })}
                                        </div>
                                    ) : <ol>{dados.builds.caps.map((capitulo, indice) => {
                                        const id = "capitulo-" + (indice + 1);
                                        return <li key={id}><a href={"#" + id} aria-current={capituloAtivo === id ? "location" : undefined}><span className="ribbon-numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span><span className="ribbon-titulo">{capitulo}</span><span className="ribbon-seta" aria-hidden="true" /></a></li>;
                                    })}</ol>}
                                </nav>

                                <div className="builds-guia">
                                    {dados.builds.caps.map((capitulo, indice) => {
                                        const id = `capitulo-${indice + 1}`;
                                        const dica = dados.builds?.dicas[capitulo];
                                        const textos = typeof dica === "string" ? [dica] : Array.isArray(dica) ? dica.filter((item): item is string => typeof item === "string") : [];
                                        return (
                                            <section key={id} aria-labelledby={id}>
                                                <h2 id={id} tabIndex={-1}>{capitulo}</h2>
                                                {textos.length
                                                    ? textos.map((texto, i) => <p key={i}>{texto}</p>)
                                                    : <p>As dicas deste capítulo ainda não foram adicionadas.</p>}
                                            </section>
                                        );
                                    })}
                                </div>
                            </section>
                        ) : <p>As builds deste jogo ainda não estão disponíveis.</p>}
                    </>
                )}
            </main>

            <section className="footer-container">
                <Footer />
            </section>
        </div>
    );
}

export default function BuildsPage() {
    return (
        <Suspense fallback={<p role="status">Carregando builds…</p>}>
            <BuildsConteudo />
        </Suspense>
    );
}

