import { Suspense } from "react";
import Catalog from "../CNPJ/catalog/catalog";
import "../[catalog]/letter.css";

export const metadata = { title: "Pós-game | RUNDEX" };

export default function PosGameCatalogPage() {
    return (
        <Suspense fallback={<p role="status">Carregando catálogo…</p>}>
            <Catalog />
        </Suspense>
    );
}
