import { useNavigate } from 'react-router-dom'
import { Rocket, FileText, Bot, Globe2 } from 'lucide-react'

export default function Home() {
    const navigate = useNavigate()

    return (
        <div className="home-page min-h-screen flex flex-col text-white">
            <div className="home-gradient home-gradient-one" />
            <div className="home-gradient home-gradient-two" />

            <nav className="home-nav flex flex-wrap items-center justify-between py-2 px-6">
        <span className="font-bold text-2xl flex items-center gap-2">
          🚀 PortfólioPro
        </span>

                <div>
                    <button
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-base leading-normal cursor-pointer transition text-white border border-white bg-transparent hover:bg-white hover:text-black mr-2"
                        onClick={() => navigate('/login')}
                    >
                        Entrar
                    </button>

                    <button
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-base leading-normal cursor-pointer transition bg-[#0d6efd] border border-[#0d6efd] text-white hover:bg-[#0b5ed7] hover:border-[#0a58ca]"
                        onClick={() => navigate('/cadastro')}
                    >
                        Criar conta
                    </button>
                </div>
            </nav>

            <main className="home-hero flex-1 flex items-center">
                <div className="container-bs text-center py-12 home-content">
                    <h1 className="text-[3.5rem] leading-[1.2] font-bold mb-4 text-white">
                        Crie seu portfólio profissional em segundos
                    </h1>

                    <p className="text-xl font-light text-[#6c757d] mb-6">
                        Faça o upload do seu currículo em PDF e nossa Inteligência Artificial
                        extrai automaticamente suas experiências, habilidades e projetos —
                        gerando um portfólio bonito e pronto para compartilhar.
                    </p>

                    <button
                        className="inline-flex items-center justify-center rounded-lg text-xl leading-normal cursor-pointer transition bg-[#0d6efd] border border-[#0d6efd] text-white hover:bg-[#0b5ed7] hover:border-[#0a58ca] px-12 py-4"
                        onClick={() => navigate('/cadastro')}
                    >
                        Comece agora - é grátis!
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <div>
                            <div className="home-feature-card h-full">
                                <div className="home-feature-icon">
                                    <FileText size={28} strokeWidth={1.9} />
                                </div>

                                <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2">Upload de PDF</h5>

                                <p className="mb-4">
                                    Envie seu currículo e deixe a inteligência artificial organizar tudo
                                    para você.
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="home-feature-card h-full">
                                <div className="home-feature-icon">
                                    <Bot size={28} strokeWidth={1.9} />
                                </div>

                                <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2">Extração por IA</h5>

                                <p className="mb-4">
                                    Experiências, habilidades e projetos são identificados e estruturados
                                    automaticamente.
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="home-feature-card h-full">
                                <div className="home-feature-icon">
                                    <Globe2 size={28} strokeWidth={1.9} />
                                </div>

                                <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2">Portfólio público</h5>

                                <p className="mb-4">
                                    Receba uma página profissional com uma URL pronta para compartilhar com
                                    recrutadores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="home-footer text-[#6c757d] text-center py-4 text-sm">
                PortfólioPro — UNESP 2026 — Grupo X: Brendo, Gabriel, Gustavo, João
                Vítor, Rafael
            </footer>
        </div>
    )
}
