"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Header from "../header/header";
import Footer from "../footer/footer";
import { apiFetch, apiUrl } from "../../fetch/api";
import "../../home/letter.css";
import "./catalog.css";
import "./letter.css";

type JogoCatalogo = {
    name: string;
    slug: string;
    platforms: string[];
    image: string | null;
    remake: "YES" | "NO";
    href: string;
};

const titulos = {
    detonados: ["DETO", "NADOS"],
    builds: ["BUI", "LDS"],
    "pos-game": ["PÓS", " GAME"],
};

export default function Catalog() {
    const secao = usePathname().split("/")[1];
    const partes = Object.hasOwn(titulos, secao)
        ? titulos[secao as keyof typeof titulos]
        : null;
    const [resultado, setResultado] = useState<{ secao: string; jogos: JogoCatalogo[] | null } | null>(null);
    const resultadoAtual = resultado?.secao === secao ? resultado : null;
    const jogos = resultadoAtual?.jogos ?? null;
    const erro = resultadoAtual?.jogos === null;

    useEffect(() => {
        const controller = new AbortController();

        apiFetch(`/jogos/catalogo/${encodeURIComponent(secao)}`, {
            signal: controller.signal,
        })
            .then((resposta) => {
                if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
                return resposta.json();
            })
            .then((dados: JogoCatalogo[]) => {
                if (!controller.signal.aborted) setResultado({ secao, jogos: dados });
            })
            .catch(() => {
                if (!controller.signal.aborted) setResultado({ secao, jogos: null });
            });

        return () => controller.abort();
    }, [secao]);

    if (!partes) notFound();

    const [inicio, fim] = partes;
    const titulo = inicio + fim;

    const cards = jogos?.map((jogo) => {
        let position = 0;
        const words = jogo.name.normalize("NFC").trim().split(/\s+/).map((word) =>
            Array.from(word).map((letter) => ({ letter, position: ++position }))
        );

        return { jogo, words };
    });

    return (
        <div className="catalog-page">
            <div className="catalog-header">
                <Header/>
            </div>

            <main className="catalog-content">
                <section
                    className="catalog-secao"
                    data-secao={secao}
                    aria-labelledby="catalog-secao-titulo">
                    <h1
                        id="catalog-secao-titulo"
                        className="catalog-secao-titulo"
                        aria-label={titulo}>
                        {Array.from(titulo.replace(/\s/g, "")).map((letra, index) => (
                            <span
                                key={index}
                                className={index < inicio.length
                                    ? "catalog-secao-letra"
                                    : "catalog-secao-letra catalog-secao-acento"}
                                data-letra={index + 1}
                                aria-hidden="true">
                                {letra}
                            </span>
                        ))}
                    </h1>
                </section>

                {erro && <p role="alert">Não foi possível carregar o catálogo.</p>}
                {!erro && jogos === null && <p role="status">Carregando jogos…</p>}
                {jogos?.length === 0 && <p role="status">Nenhum jogo disponível.</p>}

                {cards && cards.length > 0 && (
                    <ul className="catalog-grid">
                        {cards.map(({ jogo, words }) => (
                            <li key={jogo.slug}>
                                <Link
                                    className="catalog-card"
                                    aria-label={jogo.name}
                                    href={jogo.href}>
                                    {jogo.image && (
                                        <Image
                                            className="catalog-cover"
                                            src={apiUrl(jogo.image)}
                                            alt=""
                                            fill
                                            unoptimized/>
                                    )}

                                    <h2 className="catalog-card-name" aria-hidden="true">
                                        {words.map((letters, wordIndex) => (
                                            <span key={wordIndex} className="card-name-word">
                                                {letters.map(({ letter, position }) => (
                                                    <span
                                                        key={position}
                                                        className="card-name-letter"
                                                        data-letter={position <= 25 ? position : undefined}>
                                                        {letter}
                                                    </span>
                                                ))}
                                            </span>
                                        ))}
                                    </h2>

                                    <div className="catalog-card-badges">
                                        {jogo.platforms[0] && (
                                            <span className="catalog-badge">{jogo.platforms[0]}</span>
                                        )}
                                        {jogo.remake === "YES" && (
                                            <span className="catalog-badge catalog-badge-remake">REMAKE</span>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <div className="footer-container">
                <Footer/>
            </div>
        </div>
    );
}
