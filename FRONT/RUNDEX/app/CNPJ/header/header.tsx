"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

import './logo.css'
import './links.css'
import './glass.css'

export default function Header() {


  const logoRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
      logoRef.current?.focus();
    }, []);


  return (

    <header className="header">

      <div className="header-glass" aria-hidden="true"/>

        <Link href="/home" className="header-logo" ref={logoRef}>
            <span className="header-logo-r">R</span>
            <span className="header-logo-u">U</span>
            <span className="header-logo-n">N</span>
            <span className="header-logo-d">D</span>
            <span className="header-logo-e">E</span>
            <span className="header-logo-x">X</span>
        </Link>


        <nav className="header-links" aria-label="Navegação principal">

          <Link href="/jogos" className="header-links-jogos">
            <Image src="/images/icons/jogos.png" alt="" width={35} height={35}/>
            <span className="header-link-jogos">JOGOS</span>
          </Link>

          <Link href="/detonados" className="header-links-detonados">
            <Image src="/images/icons/detonados.png" alt="" width={35} height={35}/>
            <span className="header-link-detonados">DETONADOS</span>
          </Link>

          <Link href="/builds" className="header-links-builds">
            <Image src="/images/icons/builds.png" alt="" width={45} height={45} />
            <span className="header-link-builds">BUILDS</span>
          </Link>

          <Link href="/pos-game" className="header-links-pos-game">
            <Image src="/images/icons/pos-game.png" alt="" width={35} height={35} />
            <span className="header-link-pos-game">PÓS GAME</span>
          </Link>

        </nav>

        <div className="header-divider"/>

    </header>
  );
}