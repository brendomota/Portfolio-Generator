import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

// Esta página renderiza DENTRO do <Outlet> do AuthLayout
// (cabeçalho, navegação e rodapé vêm do layout fixo)

export default function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', email: '', password: '', role: 'USER' })
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
      await api.post('/auth/register', form)
      navigate('/login')
    } catch {
      setErro('Não foi possível criar a conta. O login pode já estar em uso.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="card shadow p-4" style={{ width: '100%', maxWidth: 420 }}>
        <h2 className="text-center fw-bold mb-1 text-dark">🚀 PortfólioPro</h2>
        <p className="text-center text-muted mb-4">Crie sua conta grátis</p>

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
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
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
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

      <p className="text-center mt-3 mb-0">
        Já tem conta?{' '}
        <Link to="/login">Entrar</Link>
      </p>
    </div>
  )
}
