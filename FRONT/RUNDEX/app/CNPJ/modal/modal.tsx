"use client";

import { useEffect, useRef } from "react";
import "./modal.css";

const visitaKey = "rundex-first-viagem";

export default function Modal() {
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        let visitou = false;
        try {
            visitou = localStorage.getItem(visitaKey) === "sim";
        } catch {" "}

        const modal = modalRef.current;
        if (visitou || !modal) return;

        const frame = requestAnimationFrame(() => {
            if (!modal.open) modal.showModal();
        });

        return () => {
            cancelAnimationFrame(frame);
            modal.close();
        };
    }, []);

    function fechar() {
        try {
            localStorage.setItem(visitaKey, "sim");
        } catch {" "}

        modalRef.current?.close();
    }

    return (
        <>
        <button
            type="button"
            id="home-orientacoes"
            className="boas-vindas-abrir"
            data-key-down="home-destaque-1"
            aria-label="Abrir orientações"
            aria-haspopup="dialog"
            aria-controls="boas-vindas-modal"
            onClick={() => {
                const modal = modalRef.current;
                if (modal && !modal.open) modal.showModal();
            }}>
            <span aria-hidden="true">?</span>
        </button>
        <dialog
            id="boas-vindas-modal"
            ref={modalRef}
            className="boas-vindas-modal"
            aria-labelledby="boas-vindas-titulo"
            onCancel={(event) => { event.preventDefault(); fechar(); }}>

            <h2 id="boas-vindas-titulo">BEM-VINDO AO RUNDEX!</h2>
            <p className="boas-vindas-mensagem">
                É um prazer ter você aqui! Obrigado por escolher o RUNDEX para acompanhar suas
                aventuras, esperamos que cada guia ajude você a aproveitar ainda mais seus jogos favoritos.
            </p>

            
            <p className="boas-vindas-texto">
                Na nossa página inicial, use a barra de busca para encontrar um jogo e acessá-lo no carrossel,
                ou escolha um dos destaques, que mudam diariamente, para abrir seu detonado.
            </p>
            <p className="boas-vindas-texto">
                Você também pode navegar pelo RUNDEX usando as setas do teclado para passar entre
                os botões, enquanto a página acompanha o item selecionado, e pressionar Enter
                para abrir a opção desejada.
            </p>
            <p className="boas-vindas-texto">
                No menu superior, você pode acessar Jogos, Detonados, Builds e Pós-Game, além de
                clicar no nome RUNDEX para voltar à página inicial.
            </p>

            <p className="boas-vindas-texto">
                Em Detonados, acompanhe a jornada do jogo por capítulos, desde o início até o
                Champion, com orientações para encontrar o caminho e avançar pela história, em
                Builds, prepare sua equipe com sugestões de Pokémon, golpes e estratégias para
                enfrentar os principais treinadores e desafios, e em Pós-Game, descubra o que fazer
                depois da campanha, explore novas aventuras e saiba onde encontrar Pokémon lendários
                e outros encontros especiais.
            </p>

            <button type="button" className="boas-vindas-botao" onClick={fechar} autoFocus>
                Entendi
            </button>
        </dialog>
        </>
    );
}
