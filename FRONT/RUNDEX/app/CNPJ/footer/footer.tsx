import Image from "next/image";

import "./footer.css";

export default function Footer() {
    return (

        <footer className="footer">
            
            <div className="footer-content">
                <div className="footer-box">
                    <div className="footer-item footer-brand">
                        <h2 className="footer-title">RUNDEX</h2>

                        <p className="footer-description">Explore jogos, descubra estratégias e encontre sua próxima aventura</p>
                    </div>

                    <div className="footer-item footer-contact">
                        <h2 className="footer-title">CONTATO</h2>
                        <p className="footer-contact-email">contato@rundex.com</p>
                    </div>

                    <div className="footer-item footer-socials">
                        <h2 className="footer-title">REDES SOCIAIS</h2>

                        <div className="footer-socials-icons">
                            <Image src="/images/footer/facebook.png" alt="" width={35} height={35} className="footer-social-icon"/>
                            <Image src="/images/footer/x.png" alt="" width={35} height={35} className="footer-social-icon"/>
                            <Image src="/images/footer/whatsapp.png" alt="" width={35} height={35} className="footer-social-icon"/>
                            <Image src="/images/footer/linkedin.png" alt="" width={35} height={35} className="footer-social-icon"/>
                            <Image src="/images/footer/instagram.png" alt="" width={35} height={35} className="footer-social-icon"/>
                            <Image src="/images/footer/github.png" alt="" width={35} height={35} className="footer-social-icon"/>
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    );
}
