import { Suspense } from "react";
import Catalog from "../CNPJ/catalog/catalog";

import './letter.css'

const secoes = ["detonados", "builds", "pos-game"] as const;

export const metadata = {
    title: "Catálogo | RUNDEX",
};

export function generateStaticParams() {
    return secoes.map((catalog) => ({ catalog }));
}

export default function CatalogPage() {
    return (
        <Suspense fallback={<p role="status">Carregando catálogo…</p>}>
            <Catalog/>
        </Suspense>
    );
}
