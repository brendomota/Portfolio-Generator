import { Outlet, useNavigate } from 'react-router-dom'

// Layout fixo (template) das telas de autenticação, exigido pelo enunciado:
// Cabeçalho + navegação em cima, conteúdo variável no <Outlet>, rodapé embaixo.
// O React Router renderiza a página filha (Login ou Cadastro) dentro do <Outlet>.
export default function AuthLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark">
      {/* Cabeçalho + menu de navegação (fixos) */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3">
        <span
          className="text-white fw-bold fs-5"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          🚀 PortfólioPro
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/')}>
          ← Voltar
        </button>
      </div>

      {/* Conteúdo (variável): aqui entra a página filha da rota */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <Outlet />
      </div>

      {/* Rodapé (fixo) */}
      <footer className="text-secondary text-center py-3 small">
        PortfólioPro — UNESP 2026 — Grupo X: Brendo, Gabriel, Gustavo, João Vítor, Rafael
      </footer>
    </div>
  )
}
