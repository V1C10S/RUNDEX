import Image from "next/image";

import "./footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-box">
                    <div className="footer-item footer-brand">
                        <h1 className="footer-logo">
                            <span className="footer-logo-name">RUNDEX</span>
                        </h1>

                        <p className="footer-description">

                        </p>
                    </div>

                    <div className="footer-item footer-contact">
                        <h2 className="footer-contact-title">CONTATO</h2>
                    </div>

                    <div className="footer-item footer-socials">
                        <h2 className="footer-socials-title">REDES SOCIAIS</h2>

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
