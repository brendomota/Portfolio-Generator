import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#212529] text-white text-center">
      <h1 className="text-[5rem] leading-[1.2] font-bold text-[#0d6efd]">404</h1>
      <h2 className="text-[2rem] leading-[1.2] mb-4">Página não encontrada</h2>
      <p className="text-[#6c757d] mb-6">
        A página que você procura não existe ou foi movida.
      </p>
      <button
        className="inline-flex items-center justify-center px-6 py-1.5 rounded-md text-base leading-normal cursor-pointer transition bg-[#0d6efd] border border-[#0d6efd] text-white hover:bg-[#0b5ed7] hover:border-[#0a58ca]"
        onClick={() => navigate('/')}
      >
        Voltar ao início
      </button>
    </div>
  )
}
