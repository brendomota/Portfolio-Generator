import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand fw-bold fs-4">🚀 PortfólioPro</span>
        <div>
          <button className="btn btn-outline-light me-2" onClick={() => navigate('/login')}>
            Entrar
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/cadastro')}>
            Criar conta
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow-1 d-flex align-items-center bg-dark text-white">
        <div className="container text-center py-5">
          <h1 className="display-4 fw-bold mb-3">
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

          {/* Features */}
          <div className="row mt-5 g-4">
            <div className="col-md-4">
              <div className="card bg-secondary border-0 text-white h-100 p-4">
                <div className="fs-1 mb-3">📄</div>
                <h5 className="fw-bold">Upload de PDF</h5>
                <p className="text-light">Envie seu currículo e deixa a IA trabalhar por você.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-secondary border-0 text-white h-100 p-4">
                <div className="fs-1 mb-3">🤖</div>
                <h5 className="fw-bold">Extração por IA</h5>
                <p className="text-light">Dados estruturados automaticamente: skills, experiências, projetos.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-secondary border-0 text-white h-100 p-4">
                <div className="fs-1 mb-3">🌐</div>
                <h5 className="fw-bold">Portfólio público</h5>
                <p className="text-light">URL única para compartilhar com recrutadores.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-dark text-secondary text-center py-3 small border-top border-secondary">
        PortfólioPro — UNESP 2026 — Grupo X: Brendo, Gabriel, Gustavo, João Vítor, Rafael
      </footer>
    </div>
  )
}
