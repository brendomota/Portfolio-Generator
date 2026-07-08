import { useNavigate } from 'react-router-dom'
import { Rocket, FileText, Bot, Globe2 } from 'lucide-react'

export default function Home() {
    const navigate = useNavigate()

    return (
        <div className="home-page min-vh-100 d-flex flex-column text-white">
            <div className="home-gradient home-gradient-one" />
            <div className="home-gradient home-gradient-two" />

            <nav className="home-nav navbar navbar-dark px-4">
        <span className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2">
          🚀 PortfólioPro
        </span>

                <div>
                    <button
                        className="btn btn-outline-light me-2"
                        onClick={() => navigate('/login')}
                    >
                        Entrar
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/cadastro')}
                    >
                        Criar conta
                    </button>
                </div>
            </nav>

            <main className="home-hero flex-grow-1 d-flex align-items-center">
                <div className="container text-center py-5 home-content">
                    <h1 className="display-4 fw-bold mb-3 text-white">
                        Crie seu portfólio profissional em segundos
                    </h1>

                    <p className="lead text-secondary mb-4">
                        Faça o upload do seu currículo em PDF e nossa Inteligência Artificial
                        extrai automaticamente suas experiências, habilidades e projetos —
                        gerando um portfólio bonito e pronto para compartilhar.
                    </p>

                    <button
                        className="btn btn-primary btn-lg px-5 py-3"
                        onClick={() => navigate('/cadastro')}
                    >
                        Comece agora - é grátis!
                    </button>

                    <div className="row mt-5 g-4">
                        <div className="col-md-4">
                            <div className="home-feature-card h-100">
                                <div className="home-feature-icon">
                                    <FileText size={28} strokeWidth={1.9} />
                                </div>

                                <h5 className="fw-bold mb-2">Upload de PDF</h5>

                                <p>
                                    Envie seu currículo e deixe a inteligência artificial organizar tudo
                                    para você.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="home-feature-card h-100">
                                <div className="home-feature-icon">
                                    <Bot size={28} strokeWidth={1.9} />
                                </div>

                                <h5 className="fw-bold mb-2">Extração por IA</h5>

                                <p>
                                    Experiências, habilidades e projetos são identificados e estruturados
                                    automaticamente.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="home-feature-card h-100">
                                <div className="home-feature-icon">
                                    <Globe2 size={28} strokeWidth={1.9} />
                                </div>

                                <h5 className="fw-bold mb-2">Portfólio público</h5>

                                <p>
                                    Receba uma página profissional com uma URL pronta para compartilhar com
                                    recrutadores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="home-footer text-secondary text-center py-3 small">
                PortfólioPro — UNESP 2026 — Grupo X: Brendo, Gabriel, Gustavo, João
                Vítor, Rafael
            </footer>
        </div>
    )
}