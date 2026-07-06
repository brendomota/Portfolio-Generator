import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const resposta = await api.post('/auth/login', form)
      localStorage.setItem('token', resposta.data.token)
      localStorage.setItem('login', form.login)
      navigate('/dashboard')
    } catch {
      setErro('Login ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark">
      {/* Top bar */}
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

      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: 420 }}>
        <h2 className="text-center fw-bold mb-1 text-dark">🚀 PortfólioPro</h2>
        <p className="text-center text-muted mb-4">Entre na sua conta</p>

        {erro && <div className="alert alert-danger">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Login</label>
            <input
              className="form-control"
              name="login"
              value={form.login}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Não tem conta?{' '}
          <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
      </div>
    </div>
  )
}
