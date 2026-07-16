import { Outlet, useNavigate } from 'react-router-dom'

// Layout fixo (template) das telas de autenticação, exigido pelo enunciado:
// Cabeçalho + navegação em cima, conteúdo variável no <Outlet>, rodapé embaixo.
// O React Router renderiza a página filha (Login ou Cadastro) dentro do <Outlet>.
export default function AuthLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-[#212529]">
      {/* Cabeçalho + menu de navegação (fixos) */}
      <div className="flex justify-between items-center px-6 py-4">
        <span
          className="text-white font-bold text-xl"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          🚀 PortfólioPro
        </span>
        <button
          className="inline-flex items-center justify-center border border-white text-white bg-transparent hover:bg-white hover:text-black px-2 py-1 text-sm rounded transition cursor-pointer"
          onClick={() => navigate('/')}
        >
          ← Voltar
        </button>
      </div>

      {/* Conteúdo (variável): aqui entra a página filha da rota */}
      <div className="flex-1 flex items-center justify-center">
        <Outlet />
      </div>

      {/* Rodapé (fixo) */}
      <footer className="text-[#6c757d] text-center py-4 text-sm">
        PortfólioPro — UNESP 2026 — Grupo X: Brendo, Gabriel, Gustavo, João Vítor, Rafael
      </footer>
    </div>
  )
}
