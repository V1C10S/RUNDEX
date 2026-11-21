"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import Header from "../CNPJ/dark/dark";
import Footer from "../CNPJ/footer/footer";
import { apiFetch, apiUrl } from "../fetch/api";
import { arrowLeft, arrowRight } from "../CNPJ/key";

import "./background.css";
import "./hero.css";
import "./carrossel.css";
import "./letter.css";


type Jogo = {
    name: string;
    slug: string;
    franchise: string;
    platforms: string[];
    parent_platforms: string[];
    image: string | null;
    remake: "YES" | "NO";
};

export default function JogosPage() {
    const [jogos, setJogos] = useState<Jogo[]>([]);
    const [erro, setErro] = useState("");
    const [indiceAtual, setIndiceAtual] = useState(0);
    const carrosselRef = useRef<HTMLElement>(null);
    const cartoesRef = useRef<(HTMLDivElement | null)[]>([]);
    const focoPendente = useRef<number | null>(null);

    const slots = Array.from({ length: jogos.length || 30 }, (_, indice) => ({
        id: indice + 1,
        indice,
        jogo: jogos[indice],
    }));
    const indiceAtivo = indiceAtual % slots.length;

    useEffect(() => {
        const controller = new AbortController();

        apiFetch("/jogos/pokemon", { signal: controller.signal })
            .then((resposta) => {
                if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
                return resposta.json();
            })
            .then((dados: Jogo[]) => {
                if (!controller.signal.aborted) {
                    const slug = new URLSearchParams(window.location.search).get("jogo");
                    const indice = dados.findIndex((jogo) => jogo.slug === slug);
                    if (indice >= 0) setIndiceAtual(indice);
                    setJogos(dados);
                }
            })
            .catch((error) => {
                if (!controller.signal.aborted) {
                    console.error("Erro ao buscar jogos:", error);
                    setErro("Não foi possível carregar os jogos. Atualize a página para tentar novamente.");
                }
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const slug = new URLSearchParams(window.location.search).get("jogo");
        const indice = jogos.findIndex((jogo) => jogo.slug === slug);
        if (indice < 0) return;

        const frame = requestAnimationFrame(() => {
            cartoesRef.current[indice]?.querySelector<HTMLElement>(".cartao-selecionar")
                ?.focus({ preventScroll: true });
            carrosselRef.current?.scrollIntoView({ block: "start" });
        });
        return () => cancelAnimationFrame(frame);
    }, [jogos]);

    useEffect(() => {
        if (focoPendente.current === null) return;

        cartoesRef.current[indiceAtivo]
            ?.querySelector<HTMLElement>(`[data-passo="${focoPendente.current}"]`)
            ?.focus({ preventScroll: true });
        focoPendente.current = null;
    }, [indiceAtivo]);

    const slotsCarrossel = slots.map(({ id, indice, jogo }) => {
        let distancia = indice - indiceAtivo;

        if (distancia > slots.length / 2) distancia -= slots.length;
        if (distancia < -slots.length / 2) distancia += slots.length;

        let position = 0;
        const palavras = (
            jogo?.name.normalize("NFC").trim().split(/\s+/) ?? []
        ).map((palavra) =>
            Array.from(palavra).map((letra) => ({
                letra,
                position: ++position,
            }))
        );

        return {
            id,
            indice,
            jogo,
            palavras,
            posicao: Math.max(-2, Math.min(2, distancia)),
            visivel: Math.abs(distancia) <= 1,
        };
    });

    function moverCarrossel(direcao: number, moverFoco = false) {
        focoPendente.current = moverFoco ? 0 : null;
        setIndiceAtual((atual) =>
            (atual + direcao + slots.length) % slots.length
        );
    }

    function navegarCarrossel(event: KeyboardEvent<HTMLElement>) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (!arrowLeft(event) && !arrowRight(event)) return;

        event.preventDefault();
        const direcao = arrowRight(event) ? 1 : -1;
        const controle = (event.target as HTMLElement).closest<HTMLElement>("[data-passo]");

        if (!controle) {
            moverCarrossel(direcao, true);
            return;
        }

        const proximoPasso = Number(controle.dataset.passo) + direcao;
        const totalPassos = jogos[indiceAtivo] ? 4 : 1;

        if (proximoPasso >= 0 && proximoPasso < totalPassos) {
            cartoesRef.current[indiceAtivo]
                ?.querySelector<HTMLElement>(`[data-passo="${proximoPasso}"]`)
                ?.focus({ preventScroll: true });
            return;
        }

        const proximoIndice = (indiceAtivo + direcao + slots.length) % slots.length;
        const passo = direcao === 1 ? 0 : jogos[proximoIndice] ? 3 : 0;

        if (proximoIndice === indiceAtivo) {
            cartoesRef.current[proximoIndice]
                ?.querySelector<HTMLElement>(`[data-passo="${passo}"]`)
                ?.focus({ preventScroll: true });
            return;
        }

        focoPendente.current = passo;
        setIndiceAtual(proximoIndice);
    }

    return (
        <main className="background jogos-page">
            
            <section className="jogos-header">
                <Header/>
            </section>

            <section className="hero">
                <div className="hero-image-area">
                    <Image
                        src="/images/jogos/hero.png"
                        alt=""
                        fill
                        priority
                        sizes="100vw"/>
                </div>
            </section>

                <div className="cards-heading">
                    <div className="cards-line"/>
                    <span className="cards-title">JOGOS</span>
                </div>

            <section
                ref={carrosselRef}
                id="catalogo"
                className="jogos-carrossel"
                aria-label="Catálogo de jogos"
                onKeyDown={navegarCarrossel}>

                {erro && <p className="carrossel-erro" role="alert">{erro}</p>}

                <div className="area-carrossel">
                    <button
                        type="button"
                        className="seta esquerda"
                        aria-label="Anterior card"
                        onClick={() => moverCarrossel(-1)}>
                            
                        <span className="carrossel-arrow-icon" aria-hidden="true">‹</span>
                    </button>

                    <div className="carrossel" role="group" aria-label="Carrossel de jogos">
                        {slotsCarrossel.map(({ id, indice, jogo, palavras, posicao, visivel }) => (
                            <div
                                key={id}
                                id={`slot-${id}`}
                                ref={(elemento) => { cartoesRef.current[indice] = elemento; }}
                                className={`cartao-jogo${indice === indiceAtivo ? " ativo" : ""}`}
                                data-distancia={posicao}
                                data-visivel={visivel}
                                role="group"
                                aria-label={jogo ? jogo.name : `Slot ${id}`}
                                aria-hidden={!visivel}>
                                <button
                                    type="button"
                                    className="cartao-selecionar"
                                    data-passo="0"
                                    aria-label={jogo ? `Selecionar ${jogo.name}` : `Selecionar slot ${id}`}
                                    aria-pressed={indice === indiceAtivo}
                                    tabIndex={indice === indiceAtivo ? 0 : -1}
                                    onClick={() => setIndiceAtual(indice)}>
                                    {jogo && (
                                        <>
                                        {jogo.image && (
                                            <Image
                                                className="cartao-imagem"
                                                src={apiUrl(jogo.image)}
                                                alt=""
                                                fill
                                                sizes="550px"
                                                unoptimized/>
                                        )}

                                        <span className="cartao-nome" aria-hidden="true">
                                            {palavras.map((letras, palavraIndex) => (
                                                <span key={palavraIndex} className="cartao-nome-word">
                                                    {letras.map(({ letra, position }) => (
                                                        <span
                                                            key={position}
                                                            className="cartao-nome-letter"
                                                            data-letter={position <= 25 ? position : undefined}>
                                                            {letra}
                                                        </span>
                                                    ))}
                                                </span>
                                            ))}
                                        </span>
                                        </>
                                    )}
                                </button>

                                {jogo && (
                                        <span className="cartao-icones">
                                            <Link
                                                href={`/detonados/${encodeURIComponent(jogo.slug)}`}
                                                className="cartao-icone"
                                                data-passo="1"
                                                tabIndex={indice === indiceAtivo ? 0 : -1}
                                                aria-label={`Detonados de ${jogo.name}`}
                                                title="Detonados">
                                                <Image
                                                    src="/images/icons/detonados.png"
                                                    alt=""
                                                    width={55}
                                                    height={55}/>
                                            </Link>

                                            <Link
                                                href={`/builds/${encodeURIComponent(jogo.slug)}`}
                                                className="cartao-icone"
                                                data-passo="2"
                                                tabIndex={indice === indiceAtivo ? 0 : -1}
                                                aria-label={`Builds de ${jogo.name}`}
                                                title="Builds">
                                                <Image
                                                    src="/images/icons/builds.png"
                                                    alt=""
                                                    width={80}
                                                    height={80}/>
                                            </Link>

                                            <Link
                                                href={`/pos-game/${encodeURIComponent(jogo.slug)}`}
                                                className="cartao-icone"
                                                data-passo="3"
                                                tabIndex={indice === indiceAtivo ? 0 : -1}
                                                aria-label={`Pós-game de ${jogo.name}`}
                                                title="Pós-game">
                                                <Image
                                                    src="/images/icons/pos-game.png"
                                                    alt=""
                                                    width={55}
                                                    height={55}/>
                                            </Link>
                                        </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="seta direita"
                        aria-label="Próximo card"
                        onClick={() => moverCarrossel(1)}>
                            
                        <span className="carrossel-arrow-icon" aria-hidden="true">›</span>
                    </button>
                </div>
            </section>

            <section className="footer-container">
                <Footer/>
            </section>
        </main>
    );
}
