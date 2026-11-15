"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import Header from "../CNPJ/header/header";
import Footer from "../CNPJ/footer/footer";
import { apiFetch, apiUrl } from "../fetch/api";
import { arrowTop, arrowDown, hasModifier } from "../CNPJ/key";

import './background.css'
import './hero.css'
import './search.css'
import './cards.css'
import './letter.css'

type Jogo = {
  name: string;
  slug: string;
  franchise: string;
  platforms: string[];
  parent_platforms: string[];
  image: string | null;
  remake: "YES" | "NO";
};

export default function HomePage() {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [jogos, setJogos] = useState<Jogo[]>([]);
    const [destaques, setDestaques] = useState<Jogo[]>([]);
    const [viewsugests, setViewSugests] = useState(false);
    const [activesugests, setActiveSugests] = useState(-1);
    const sugestsVisible = viewsugests && jogos.length > 0;
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const controller = new AbortController();

        apiFetch("/home/destaques", { signal: controller.signal })
            .then((resposta) => {
                if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
                return resposta.json();
            })
            .then((dados: Jogo[]) => {
                if (!controller.signal.aborted) setDestaques(dados);
            })
            .catch((erro) => {
                if (!controller.signal.aborted) {
                    console.error("Erro ao buscar imagens dos destaques:", erro);
                }
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const query = search.trim();
        if (!query) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            const params = new URLSearchParams({ q: query });
            apiFetch(`/home/search?${params}`, {
                signal: controller.signal,
            })
                .then((resposta) => {
                    if (!resposta.ok) {
                        throw new Error(`Erro HTTP ${resposta.status}`);
                    }
                    return resposta.json();
                })
                .then((dados: Jogo[]) => {
                    if (!controller.signal.aborted) setJogos(dados);
                })
                .catch((erro) => {
                    if (!controller.signal.aborted) {
                        setJogos([]);
                        console.error("Erro ao buscar jogos:", erro);
                    }
                });
        }, 250);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [search]);


    useEffect(() => {
        if (activesugests >= 0) {
            suggestionsRef.current?.children[activesugests]?.scrollIntoView({
                block: "nearest",
            });
        }
    }, [activesugests]);

    function selectGame(jogo: Jogo) {
        setSearch(jogo.name);
        setJogos([]);
        setViewSugests(false);
        setActiveSugests(-1);
        router.push(`/jogos?jogo=${encodeURIComponent(jogo.slug)}#catalogo`);
    }

    function submitSearch() {
        const jogo = jogos[activesugests] ?? jogos[0];
        if (jogo) selectGame(jogo);
    }

    const cards = [0, 1, 2].map((index) => {
        const jogo = destaques[index];
        let position = 0;

        const words = (
            jogo?.name.normalize("NFC").trim().split(/\s+/) ?? []
        ).map((word) =>
            Array.from(word).map((letter) => ({
                letter,
                position: ++position,
            }))
        );

        return {
            number: index + 1,
            jogo,
            words,
        };
    });

    function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") {
            setViewSugests(false);
            setActiveSugests(-1);
            return;
        }

        if (hasModifier(event) || !sugestsVisible) return;

        if (arrowDown(event) || arrowTop(event)) {
            event.preventDefault();

            setActiveSugests((current) =>
                arrowDown(event)
                    ? (current + 1) % jogos.length
                    : current <= 0
                        ? jogos.length - 1
                        : current - 1
            );
        } else if (
            event.key === "Enter" &&
            sugestsVisible
        ) {
            event.preventDefault();
            submitSearch();
        }
    }


    return (
        <main className="background">
        
            <section className="header" ref={headerRef}>
                <Header/>
            </section>


            <section className="hero">

                <div className="hero-image-area">
                    <Image
                        src="/images/home/hero.png"
                        alt=""
                        fill
                        priority
                        sizes="100vw"/>
                </div>
            
                 <div className="hero-content">
                    <h1 className="hero-title">

                        <span className="word-1">
                            <span className="hero-letter hero-letter-01">O</span>
                        </span>{" "}

                        <span className="word-2">
                            <span className="hero-letter hero-letter-u-02">U</span>
                            <span className="hero-letter hero-letter-n-03">N</span>
                            <span className="hero-letter hero-letter-i-04">I</span>
                            <span className="hero-letter hero-letter-v-05">V</span>
                            <span className="hero-letter hero-letter-e-06">E</span>
                            <span className="hero-letter hero-letter-r-07">R</span>
                            <span className="hero-letter hero-letter-s-08">S</span>
                            <span className="hero-letter hero-letter-o-09">O</span>
                        </span>{" "}

                        <span className="word-3">
                            <span className="hero-letter hero-letter-d-10">D</span>
                            <span className="hero-letter hero-letter-o-11">O</span>
                            <span className="hero-letter hero-letter-s-12">S</span>
                        </span>{" "}

                        <span className="word-4">
                            <span className="hero-letter hero-letter-g-13">G</span>
                            <span className="hero-letter hero-letter-a-14">A</span>
                            <span className="hero-letter hero-letter-m-15">M</span>
                            <span className="hero-letter hero-letter-e-16">E</span>
                            <span className="hero-letter hero-letter-s-17">S</span>
                        </span>{" "}

                        <span className="word-5">
                            <span className="hero-letter hero-letter-n-18">N</span>
                            <span className="hero-letter hero-letter-a-19">A</span>
                        </span>{" "}

                        <span className="word-6">
                            <span className="hero-letter hero-letter-p-20">P</span>
                            <span className="hero-letter hero-letter-a-21">A</span>
                            <span className="hero-letter hero-letter-l-22">L</span>
                            <span className="hero-letter hero-letter-m-23">M</span>
                            <span className="hero-letter hero-letter-a-24">A</span>
                        </span>{" "}

                        <span className="word-7">
                            <span className="hero-letter hero-letter-d-25">D</span>
                            <span className="hero-letter hero-letter-a-26">A</span>
                        </span>{" "}

                        <span className="word-8">
                            <span className="hero-letter hero-letter-s-27">S</span>
                            <span className="hero-letter hero-letter-u-28">U</span>
                            <span className="hero-letter hero-letter-a-29">A</span>
                        </span>{" "}

                        <span className="word-9">
                            <span className="hero-letter hero-letter-m-30">M</span>
                            <span className="hero-letter hero-letter-a-31">Ã</span>
                            <span className="hero-letter hero-letter-o-32">O</span>
                        </span>

                    </h1>

                    <h2>Explore jogos, descubra estratégias e prepare a melhor rota para essa jornada</h2>
                 </div>

                <div className="hero-search">
                    <div className="hero-search-bar">

                        <input
                        ref={searchRef}
                        type="search"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-controls="game-titles"
                        aria-expanded={sugestsVisible}
                        aria-activedescendant={
                            sugestsVisible && jogos[activesugests]
                                ? `game-option-${jogos[activesugests].slug}`
                                : undefined
                        }
                        value={search}
                        aria-label="Buscar jogos"
                        placeholder="BUSQUE POR JOGOS"
                        onFocus={() => setViewSugests(true)}
                        onBlur={() => setViewSugests(false)}
                        onKeyDown={handleSearchKeyDown}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setJogos([]);
                            setViewSugests(true);
                            setActiveSugests(-1);}}/>

                        {sugestsVisible && (
                            <ul
                                id="game-titles"
                                ref={suggestionsRef}
                                className="hero-search-suggestions"
                                role="listbox"
                                aria-label="Jogos encontrados">
                                
                                {jogos.map((jogo, index) => (
                                    <li
                                        id={`game-option-${jogo.slug}`}
                                        key={jogo.slug}
                                        role="option"
                                        aria-selected={index === activesugests}
                                        tabIndex={-1}
                                        onPointerDown={(event) => event.preventDefault()}
                                        onClick={() => selectGame(jogo)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                selectGame(jogo);
                                            }}}>

                                        {jogo.name}
                                    </li>
                                ))}
                            </ul>
                        )}

                    </div>
                    <button type="button" className="hero-search-button" aria-label="Buscar jogo" onClick={submitSearch}/>                      
                </div>
            </section>


            <section className="cards">
                <div className="cards-content">
                    <div className="cards-heading">
                        <div className="cards-line"/>
                        <span className="cards-title">DESTAQUES</span>
                    </div>

                    <div className="cards-list" ref={cardsRef}>
                        {cards.map((card) => {
                            const jogo = card.jogo;
                            const className = `card-${card.number}`;

                            if (!jogo) {
                                return <div key={card.number} className={className} aria-hidden="true"/>;
                            }

                            return (
                                <Link
                                    key={card.number}
                                    className={className}
                                    href={`/detonados/${encodeURIComponent(jogo.slug)}`}
                                    aria-label={`Detonado de ${jogo.name}`}>
                                    <h1 className="card-name" aria-label={jogo.name}>
                                        {card.words.map((letters, wordIndex) => (
                                            <span
                                                key={wordIndex}
                                                className="card-name-word"
                                                aria-hidden="true">
                                                {letters.map(({ letter, position }) => (

                                                    <span
                                                        key={position}
                                                        className="card-name-letter"
                                                        data-letter={
                                                            position <= 26 ? position : undefined
                                                        }>
                                                                        
                                                        {letter}
                                                    </span>

                                                ))}
                                            </span>
                                        ))}
                                    </h1>

                                    <div className="card-top">
                                        <div className="card-image">
                                            {jogo.image && (
                                                <Image
                                                    src={apiUrl(jogo.image)}
                                                    alt=""
                                                    width={550}
                                                    height={496}
                                                    unoptimized/>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-bottom">
                                        <div className="cardB-left">
                                            <span className="card-number" aria-hidden="true">
                                                {String(card.number).padStart(2, "0")}
                                            </span>
                                        </div>

                                        <div className="cardB-right">
                                            <div className="card-badges">
                                                {jogo.platforms[0] && (
                                                    <span className="badge badge-platform">
                                                        {jogo.platforms[0]}
                                                    </span>
                                                )}

                                                {jogo.remake === "YES" && (
                                                    <span className="badge badge-remake">
                                                        REMAKE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>


            <section className="footer-container">
                <Footer/>
            </section>

    </main>
  );
}
