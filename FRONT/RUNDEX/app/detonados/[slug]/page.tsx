import { Suspense } from "react";

import Header from "../../CNPJ/header/header";
import Footer from "../../CNPJ/footer/footer";
import Rollback from "../../CNPJ/rollback/rollback";
import Detonado from "../../CNPJ/detonado/detonado";
import "../../CNPJ/catalog/letter.css";
import "./detonado.css";
import "./hero.css";

export const metadata = {
    title: "Detonado | RUNDEX",
};

export default function DetonadoPage() {
    const rollback = <Rollback href="/detonados" label="Voltar aos detonados" />;
    return (
        <div className="detonado-page">
            <section className="detonado-header">
                <Header />
            </section>

            <main>
                <Suspense fallback={
                    <div className="detonado-content">
                        <div className="detonado-nav">{rollback}</div>
                        <p role="status">Carregando detonado…</p>
                    </div>
                }>
                    <Detonado rollback={rollback} />
                </Suspense>
            </main>

            <section className="footer-container">
                <Footer />
            </section>
        </div>
    );
}
