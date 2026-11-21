import { Suspense } from "react";
import Catalog from "../CNPJ/catalog/catalog";

export const metadata = { title: "Pós-game | RUNDEX" };

export default function PosGameCatalogPage() {
    return (
        <Suspense fallback={<p role="status">Carregando catálogo…</p>}>
            <Catalog />
        </Suspense>
    );
}
