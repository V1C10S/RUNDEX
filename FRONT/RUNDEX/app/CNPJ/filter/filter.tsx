import { useId, useRef } from "react";

import "./filter.css";

type FilterProps = {
    plataformas: string[];
    plataforma: string;
    onSelecionar: (plataforma: string) => void;
};

export default function Filter({ plataformas, plataforma, onSelecionar }: FilterProps) {
    const filtroRef = useRef<HTMLDialogElement>(null);
    const id = useId();

    return (
        <>
            <button
                type="button"
                className="jogos-filtro"
                aria-haspopup="dialog"
                aria-controls={id}
                onClick={() => filtroRef.current?.showModal()}>
                Filtrar jogos
            </button>

            <dialog
                id={id}
                ref={filtroRef}
                className="jogos-filtro-popup"
                aria-labelledby={`${id}-titulo`}>
                <h2 id={`${id}-titulo`}>Filtrar jogos</h2>

                <fieldset className="jogos-filtro-opcoes">
                    <legend>Plataforma</legend>
                    {["", ...plataformas].map((nome) => (
                        <label key={nome}>
                            <input
                                type="radio"
                                name={`${id}-plataforma`}
                                value={nome}
                                checked={plataforma === nome}
                                onChange={() => onSelecionar(nome)}/>
                            {nome || "Todas as plataformas"}
                        </label>
                    ))}
                </fieldset>

                <form method="dialog">
                    <button type="submit" className="jogos-filtro-fechar">Fechar</button>
                </form>
            </dialog>
        </>
    );
}
