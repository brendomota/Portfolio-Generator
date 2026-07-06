import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white text-center">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h2 className="mb-3">Página não encontrada</h2>
      <p className="text-secondary mb-4">
        A página que você procura não existe ou foi movida.
      </p>
      <button className="btn btn-primary px-4" onClick={() => navigate('/')}>
        Voltar ao início
      </button>
    </div>
  )
}
