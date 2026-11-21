"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { apiFetch } from "../../fetch/api";
import { heroesPorJogo } from "./heroes";

type Capitulo = {
    slug: string;
    titulo: string;
    passos: string[];
};

type DadosDetonado = {
    nome: string;
    plataformas: string[];
    guia: {
        capitulos: Capitulo[];
    } | null;
};

type Resultado = { slug: string } & (
    { estado: "pronto"; dados: DadosDetonado }
    | { estado: "inexistente" }
    | { estado: "erro" }
);



function arteConsole(plataformas: string[]): string | null {
    const nomes = plataformas.map((plataforma) => plataforma.trim().toUpperCase());
    const grupos = [
        { nomes: ["GAME BOY", "GAME BOY COLOR"], imagem: "/usaveis/GAME BOY.png" },
        { nomes: ["GAME BOY ADVANCE"], imagem: "/usaveis/ADVANCED.png" },
        { nomes: ["NINTENDO DS", "NINTENDO 3DS", "DS", "3DS"], imagem: "/usaveis/DS.png" },
        { nomes: ["NINTENDO SWITCH", "NINTENDO SWITCH 2", "SWITCH", "SWITCH 2"], imagem: "/usaveis/SWITCH.png" },
    ];
    for (const grupo of grupos) {
        if (grupo.nomes.some((nome) => nomes.includes(nome))) return grupo.imagem;
    }
    return null;
}

export default function Detonado({ rollback }: { rollback: ReactNode }) {
    const { slug } = useParams<{ slug: string }>();
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [capituloAtivo, setCapituloAtivo] = useState("");
    const atual = resultado?.slug === slug ? resultado : null;

    useEffect(() => {
        const controller = new AbortController();

        async function carregarDetonado() {
            try {
                const resposta = await apiFetch(`/detonados/${encodeURIComponent(slug)}`, {
                    signal: controller.signal,
                });

                if (resposta.status === 404) {
                    if (!controller.signal.aborted) setResultado({ slug, estado: "inexistente" });
                    return;
                }
                if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

                const dados: DadosDetonado = await resposta.json();
                if (!controller.signal.aborted) setResultado({ slug, estado: "pronto", dados });
            } catch {
                if (!controller.signal.aborted) setResultado({ slug, estado: "erro" });
            }
        }

        void carregarDetonado();
        return () => controller.abort();
    }, [slug]);

    const dados = atual?.estado === "pronto" ? atual.dados : null;
    useEffect(() => {
        if (!dados?.guia?.capitulos.length) return;
        const capitulos = dados.guia.capitulos;
        const atualizar = () => {
            let ativo = capitulos[0].slug;
            for (const capitulo of capitulos) {
                const titulo = document.getElementById(capitulo.slug);
                if (titulo && titulo.getBoundingClientRect().top <= 140) ativo = capitulo.slug;
            }
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
                ativo = capitulos[capitulos.length - 1].slug;
            }
            setCapituloAtivo(ativo);
        };
        atualizar();
        window.addEventListener("scroll", atualizar, { passive: true });
        return () => window.removeEventListener("scroll", atualizar);
    }, [dados]);
    const titulo = dados?.nome.toLocaleUpperCase("pt-BR");
    let posicao = 0;

    const navegacao = (

        <div className="detonado-nav">
            {rollback}
            {dados && titulo ? (
                <div className="detonado-heading">
                    <h1 id="detonado-titulo" aria-label={titulo}>
                        <span className="poke-title" aria-hidden="true">
                            {titulo.normalize("NFC").split(/\s+/).map((palavra, indice) => (
                                <span className="poke-title-word" key={indice}>
                                    {Array.from(palavra).map((letra, indiceLetra) => (
                                        <span
                                            className="poke-title-letter"
                                            key={indiceLetra}
                                            style={{ animationDelay: `${300 + posicao++ * 600}ms` }}>
                                            {letra}
                                        </span>
                                    ))}
                                </span>
                            ))}
                        </span>
                    </h1>

                    {dados.plataformas.length > 0 ? (
                        <ul className="detonado-badges" role="list" aria-label="Plataformas">
                            {dados.plataformas.map((plataforma) => (
                                <li className="detonado-badge" key={plataforma}>{plataforma}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
        </div>
    );

    if (!dados) {
        return (
            <div className="detonado-content">
                {navegacao}
                {!atual ? <p role="status">Carregando detonado…</p> : null}
                {atual?.estado === "inexistente" ? <h1>Jogo não encontrado</h1> : null}
                {atual?.estado === "erro" ? <p role="alert">Não foi possível carregar o detonado.</p> : null}
            </div>
        );
    }

    const { guia } = dados;
    const consoleImage = arteConsole(dados.plataformas);
    const hero = heroesPorJogo[slug] ?? null;

    return (
        <>
            {hero && (
                <section className="hero" aria-label="Arte do detonado">
                    <div className="hero-image-area">
                        <Image src={hero} alt="" fill priority sizes="100vw" />
                    </div>
                </section>
            )}
            <div className="detonado-content">
            {navegacao}
            <div className="detonado-inicio-heading">
                <div className="detonado-inicio-line" aria-hidden="true"/>
                <span className="detonado-inicio-title">INÍCIO</span>
            </div>

            {guia && guia.capitulos.length > 0 ? (
                <div className="detonado-layout">
                    <nav className="detonado-indice" aria-labelledby="detonado-capitulos">
                        <div className="detonado-indice-cabecalho">
                            {consoleImage && (
                                <Image className="detonado-indice-console" data-console={consoleImage} src={consoleImage} alt="" width={2172} height={724} />
                            )}
                            <h2 id="detonado-capitulos"> <span className="detonado-indice-pokebola" aria-hidden="true" />CAPITULOS</h2>
                        </div>
                        <ol>
                            {guia.capitulos.map((capitulo, indice) => (
                                <li key={capitulo.slug}>
                                    <a href={`#${capitulo.slug}`} aria-current={capituloAtivo === capitulo.slug ? "location" : undefined}>
                                        <span className="ribbon-numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span>
                                        <span className="ribbon-titulo">{capitulo.titulo}</span>
                                        <span className="ribbon-seta" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    <div className="detonado-guia">
                        {guia.capitulos.map((capitulo) => (
                            <section key={capitulo.slug} aria-labelledby={capitulo.slug}>
                                <h2 id={capitulo.slug} tabIndex={-1}>{capitulo.titulo}</h2>
                                {capitulo.passos.map((passo, indice) => <p key={indice}>{passo}</p>)}
                            </section>
                        ))}
                    </div>
                </div>

            ) : <p>O guia deste jogo ainda não está disponível.</p>}
            </div>
        </>
    );
}
