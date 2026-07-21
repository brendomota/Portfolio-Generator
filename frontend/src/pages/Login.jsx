import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

// Esta página renderiza DENTRO do <Outlet> do AuthLayout
// (cabeçalho, navegação e rodapé vêm do layout fixo)

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
    <div className="bg-white border border-[rgba(0,0,0,0.175)] rounded-md shadow-[0_0.5rem_1rem_rgba(0,0,0,0.15)] p-6" style={{ width: '100%', maxWidth: 420 }}>
        <h2 className="text-center font-bold text-[2rem] leading-[1.2] mb-1 text-[#212529]">🚀 PortfólioPro</h2>
        <p className="text-center text-[#6c757d] mb-6">Entre na sua conta</p>

        {erro && <div className="bg-[#f8d7da] text-[#842029] border border-[#f5c2c7] rounded-md p-4 mb-4">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Login</label>
            <input
              className="block w-full px-3 py-1.5 text-base leading-normal text-[#212529] bg-white border border-[#dee2e6] rounded-md transition focus:outline-none focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]"
              name="login"
              value={form.login}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Senha</label>
            <input
              className="block w-full px-3 py-1.5 text-base leading-normal text-[#212529] bg-white border border-[#dee2e6] rounded-md transition focus:outline-none focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-md border border-[#0d6efd] text-base leading-normal cursor-pointer transition bg-[#0d6efd] text-white hover:bg-[#0b5ed7] hover:border-[#0a58ca] focus:outline-none focus:shadow-[0_0_0_0.25rem_rgba(49,132,253,0.5)] disabled:opacity-[0.65] disabled:cursor-not-allowed"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      <p className="text-center mt-4 mb-0">
        Não tem conta?{' '}
        <Link to="/cadastro" className="text-[#0d6efd] hover:underline">Cadastre-se</Link>
      </p>
    </div>
  )
}
