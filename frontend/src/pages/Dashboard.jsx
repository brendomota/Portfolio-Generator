import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { THEMES } from '../services/themes'

export default function Dashboard() {
  const navigate = useNavigate()
  const login = localStorage.getItem('login') || 'usuário'
  const portfolioUrl = `${window.location.origin}/portfolio/${login}`

  const [arquivo, setArquivo] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [curriculoId, setCurriculoId] = useState(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [previewFoto, setPreviewFoto] = useState(null)
  const [previewFundo, setPreviewFundo] = useState(null)
  const [previewFavicon, setPreviewFavicon] = useState(null)
  // Always hold the latest base64 — survives PDF re-uploads
  const [fotoBase64, setFotoBase64] = useState(null)
  const [fundoBase64, setFundoBase64] = useState(null)
  const [faviconBase64, setFaviconBase64] = useState(null)
  const [temaSelecionado, setTemaSelecionado] = useState('roxo')

  const [campos, setCampos] = useState({
    nomeExtraido: '',
    emailExtraido: '',
    linkedinExtraido: '',
    githubExtraido: '',
    localizacaoExtraida: '',
    resumoExtraido: '',
    skillsExtraidas: '',
    skillsInterpessoaisExtraidas: '',
    idiomasExtraidos: '',
    experienciasExtraidas: '',
    educacaoExtraida: '',
    projetosExtraidos: '',
  })

  useEffect(() => { buscarCurriculo() }, [])

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleFotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreviewFoto(URL.createObjectURL(file))
    const b64 = await fileToBase64(file)
    setFotoBase64(b64)
  }

  async function handleFundoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreviewFundo(URL.createObjectURL(file))
    const b64 = await fileToBase64(file)
    setFundoBase64(b64)
  }

  async function handleFaviconChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreviewFavicon(URL.createObjectURL(file))
    const b64 = await fileToBase64(file)
    setFaviconBase64(b64)
  }

  function preencherCampos(curriculo) {
    setCurriculoId(curriculo.id)
    if (curriculo.fotoPerfil) { setPreviewFoto(curriculo.fotoPerfil); setFotoBase64(curriculo.fotoPerfil) }
    if (curriculo.imagemFundo) { setPreviewFundo(curriculo.imagemFundo); setFundoBase64(curriculo.imagemFundo) }
    if (curriculo.favicon) { setPreviewFavicon(curriculo.favicon); setFaviconBase64(curriculo.favicon) }
    if (curriculo.temaFundo) setTemaSelecionado(curriculo.temaFundo)
    setCampos({
      nomeExtraido: curriculo.nomeExtraido || '',
      emailExtraido: curriculo.emailExtraido || '',
      linkedinExtraido: curriculo.linkedinExtraido || '',
      githubExtraido: curriculo.githubExtraido || '',
      localizacaoExtraida: curriculo.localizacaoExtraida || '',
      resumoExtraido: curriculo.resumoExtraido || '',
      skillsExtraidas: curriculo.skillsExtraidas || '',
      skillsInterpessoaisExtraidas: curriculo.skillsInterpessoaisExtraidas || '',
      idiomasExtraidos: curriculo.idiomasExtraidos || '',
      experienciasExtraidas: curriculo.experienciasExtraidas || '',
      educacaoExtraida: curriculo.educacaoExtraida || '',
      projetosExtraidos: curriculo.projetosExtraidos || '',
    })
  }

  async function buscarCurriculo() {
    try {
      const resposta = await api.get('/curriculo/')
      const meus = resposta.data.filter(c => c.usuario?.login === login)
      if (meus.length > 0) preencherCampos(meus[meus.length - 1])
    } catch { }
  }

  function handleCampo(e) {
    setCampos({ ...campos, [e.target.name]: e.target.value })
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!arquivo) return
    setErro(''); setSucesso(''); setEnviando(true)
    const formData = new FormData()
    formData.append('arquivoPdf', arquivo)
    formData.append('conteudoTexto', 'Currículo de ' + login)
    try {
      const usuarios = await api.get('/usuario/')
      const usuarioAtual = usuarios.data.find(u => u.login === login)
      if (!usuarioAtual) throw new Error()
      formData.append('usuarioId', usuarioAtual.id)
      const resposta = await api.post('/curriculo/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      preencherCampos(resposta.data)

      // Re-apply existing images to the new resume record so they are not lost
      if (fotoBase64 || fundoBase64 || faviconBase64) {
        const patch = {}
        if (fotoBase64) patch.fotoPerfil = fotoBase64
        if (fundoBase64) patch.imagemFundo = fundoBase64
        if (faviconBase64) patch.favicon = faviconBase64
        await api.patch(`/curriculo/${resposta.data.id}`, patch)
      }

      setSucesso('Currículo processado com sucesso pela IA! Revise os dados abaixo.')
    } catch {
      setErro('Erro ao processar o currículo. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleSalvar(e) {
    e.preventDefault()
    if (!curriculoId) return
    setSalvando(true); setErro(''); setSucesso('')
    try {
      const payload = { ...campos }
      if (fotoBase64) payload.fotoPerfil = fotoBase64
      if (fundoBase64) payload.imagemFundo = fundoBase64
      if (faviconBase64) payload.favicon = faviconBase64
      payload.temaFundo = temaSelecionado
      await api.patch(`/curriculo/${curriculoId}`, payload)
      // Notify portfolio tab to refresh immediately
      localStorage.setItem('portfolio_updated', Date.now().toString())
      setSucesso('Dados salvos com sucesso!')
    } catch {
      setErro('Erro ao salvar as alterações.')
    } finally {
      setSalvando(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('login')
    navigate('/login')
  }

  function copiarLink() {
    navigator.clipboard.writeText(portfolioUrl)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2000)
  }

  function abrirPortfolio() {
    window.open(portfolioUrl, '_blank')
  }

  const temDados = !!curriculoId

  return (
    <div className="min-vh-100 d-flex flex-column text-white" style={{
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    }}>
      <style>{`
        .dashboard-input,
        .dashboard-input:focus {
          background: rgba(0,0,0,0.35) !important;
          border: 1px solid rgba(0,0,0,0.4) !important;
          box-shadow: inset 2px 3px 10px rgba(0,0,0,0.7), inset -1px -1px 4px rgba(255,255,255,0.04) !important;
          color: #fff !important;
          outline: none;
        }
      `}</style>

      {/* Navbar — igual ao da Home */}
      <nav className="navbar px-4" style={{ backgroundColor: 'transparent', background: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="fw-bold fs-5 text-white">🚀 PortfólioPro</span>
        <div className="d-flex align-items-center gap-3">
          <span className="text-light small">Olá, <strong>{login}</strong></span>
          {temDados && (
            <button className="btn btn-outline-light btn-sm" onClick={abrirPortfolio}>
              Ver portfólio ↗
            </button>
          )}
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Sair</button>
        </div>
      </nav>

      <div className="container py-4 flex-grow-1">

        {/* Link em destaque — centralizado */}
        {temDados && (
          <div className="mb-4 text-center py-4">
            <div>
              <p className="text-light opacity-75 small mb-1">Dashboard de</p>
              <h3 className="text-white fw-bold mb-1">{campos.nomeExtraido || login}</h3>
              <p className="text-light opacity-75 small mb-2">Seu portfólio público:</p>
              <p className="text-info fw-semibold small mb-3">{portfolioUrl}</p>
              <div className="d-flex justify-content-center gap-2">
                <button className="btn btn-sm btn-outline-light" onClick={copiarLink}>
                  {linkCopiado ? '✅ Copiado!' : '📋 Copie seu link'}
                </button>
                <button className="btn btn-sm btn-primary" onClick={abrirPortfolio}>
                  🌐 Abrir ↗
                </button>
              </div>
            </div>
          </div>
        )}

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        {/* Upload */}
        <div className="card border-0 mb-4" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12) !important', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="card-body">
            <h5 className="card-title fw-bold text-white">📄 Upload de Currículo</h5>
            <p className="card-text text-light opacity-75 small">
              Nossa IA irá extrair automaticamente seus dados. Você pode revisar e editar tudo depois.
            </p>
            <form onSubmit={handleUpload} className="d-flex gap-3 align-items-end flex-wrap">
              <div className="flex-grow-1">
                <label className="form-label small text-light">Selecione o arquivo PDF</label>
                <input className="form-control form-control-sm" type="file" accept=".pdf"
                  onChange={e => setArquivo(e.target.files[0])} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={enviando || !arquivo}>
                {enviando
                  ? <><span className="spinner-border spinner-border-sm me-2" />Processando IA...</>
                  : '🚀 Enviar e gerar portfólio'}
              </button>
            </form>
          </div>
        </div>

        {/* Personalização visual — antes do formulário de edição */}
        {temDados && (
          <div className="card border-0 mb-4" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12) !important', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="card-body">
              <h5 className="card-title fw-bold text-white">🖼️ Personalização visual</h5>
              <p className="text-light opacity-75 small mb-3">Adicione foto de perfil e imagem de fundo para o seu portfólio.</p>
              <div className="row g-3">
                {/* Tema de fundo */}
                <div className="col-12">
                  <label className="form-label small text-light">Tema de fundo do portfólio</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {THEMES.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setTemaSelecionado(t.id)}
                        style={{
                          background: t.gradient,
                          width: 64,
                          height: 40,
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: temaSelecionado === t.id ? '3px solid #fff' : '3px solid transparent',
                          boxShadow: temaSelecionado === t.id ? '0 0 0 2px #6366f1' : 'none',
                          transition: 'all 0.15s',
                        }}
                        title={t.nome}
                      />
                    ))}
                  </div>
                  <p className="text-light opacity-50 small mt-1">
                    Selecionado: <strong className="text-white">{THEMES.find(t => t.id === temaSelecionado)?.nome}</strong>
                  </p>
                </div>

                {/* Foto e fundo */}
                <div className="col-md-6">
                  <label className="form-label small text-light">
                    Foto de perfil <span className="opacity-50">— quadrada, 400×400px ideal, máx. 2MB</span>
                  </label>
                  <input className="form-control form-control-sm" type="file" accept="image/*" onChange={handleFotoChange} />
                  {previewFoto && (
                    <img src={previewFoto} alt="preview" className="mt-2 rounded-circle border border-primary"
                      style={{ width: 72, height: 72, objectFit: 'cover' }} />
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-light">
                    Imagem de fundo <span className="opacity-50">— 1920×1080px ideal, máx. 5MB</span>
                  </label>
                  <input className="form-control form-control-sm" type="file" accept="image/*" onChange={handleFundoChange} />
                  {previewFundo && (
                    <img src={previewFundo} alt="preview fundo" className="mt-2 rounded border border-secondary w-100"
                      style={{ height: 72, objectFit: 'cover' }} />
                  )}
                </div>

                {/* Favicon */}
                <div className="col-md-6">
                  <label className="form-label small text-light">
                    Ícone da aba (favicon) <span className="opacity-50">— PNG/ICO, máx. 512×512px, 200KB</span>
                  </label>
                  <input className="form-control form-control-sm" type="file" accept="image/png,image/x-icon,image/svg+xml"
                    onChange={handleFaviconChange} />
                  {previewFavicon && (
                    <img src={previewFavicon} alt="favicon preview" className="mt-2 rounded border border-secondary"
                      style={{ width: 40, height: 40, objectFit: 'contain', background: '#333', padding: 4 }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editable fields */}
        {temDados && (
          <div className="card border-0" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12) !important', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="card-body">
              <h5 className="card-title fw-bold text-white">✏️ Revise e edite seus dados</h5>
              <p className="text-light opacity-75 small mb-4">Ajuste qualquer informação que a IA tenha extraído incorretamente.</p>

              <form onSubmit={handleSalvar}>
                <div className="row g-3">

                  {/* Dados básicos */}
                  <div className="col-md-6">
                    <label className="form-label small text-light">Nome</label>
                    <input className="form-control form-control-sm text-white border-0 dashboard-input"                       name="nomeExtraido" value={campos.nomeExtraido} onChange={handleCampo} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-light">Email</label>
                    <input className="form-control form-control-sm text-white border-0 dashboard-input"                       name="emailExtraido" value={campos.emailExtraido} onChange={handleCampo} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-light">LinkedIn</label>
                    <input className="form-control form-control-sm text-white border-0 dashboard-input"                       name="linkedinExtraido" value={campos.linkedinExtraido} onChange={handleCampo} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-light">GitHub</label>
                    <input className="form-control form-control-sm text-white border-0 dashboard-input"                       name="githubExtraido" value={campos.githubExtraido} onChange={handleCampo} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-light">Localização</label>
                    <input className="form-control form-control-sm text-white border-0 dashboard-input"                       name="localizacaoExtraida" value={campos.localizacaoExtraida} onChange={handleCampo} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-light">Resumo profissional</label>
                    <textarea className="form-control form-control-sm text-white border-0 dashboard-input"                       rows={3} name="resumoExtraido" value={campos.resumoExtraido} onChange={handleCampo} />
                  </div>

                  {/* Skills com preview */}
                  <div className="col-12">
                    <label className="form-label small text-light">Skills Técnicas <span className="opacity-50">(separadas por vírgula)</span></label>
                    <input className="form-control form-control-sm text-white border-0 dashboard-input"                       name="skillsExtraidas" value={campos.skillsExtraidas} onChange={handleCampo} />
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {campos.skillsExtraidas?.split(',').filter(s => s.trim()).map((s, i) => (
                        <span key={i} className="badge bg-primary">{s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-light">Soft Skills <span className="opacity-50">(separadas por vírgula)</span></label>
                    <input className="form-control form-control-sm text-white border-0 dashboard-input"                       name="skillsInterpessoaisExtraidas" value={campos.skillsInterpessoaisExtraidas} onChange={handleCampo} />
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {campos.skillsInterpessoaisExtraidas?.split(',').filter(s => s.trim()).map((s, i) => (
                        <span key={i} className="badge bg-success">{s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-light">Idiomas <span className="opacity-50">(separados por vírgula)</span></label>
                    <input className="form-control form-control-sm text-white border-0 dashboard-input"                       name="idiomasExtraidos" value={campos.idiomasExtraidos} onChange={handleCampo} />
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {campos.idiomasExtraidos?.split(',').filter(s => s.trim()).map((s, i) => (
                        <span key={i} className="badge bg-warning text-dark">{s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  {/* Textos longos */}
                  <div className="col-12">
                    <label className="form-label small text-light">Experiências</label>
                    <textarea className="form-control form-control-sm text-white border-0 dashboard-input"                       rows={4} name="experienciasExtraidas" value={campos.experienciasExtraidas} onChange={handleCampo} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-light">Educação</label>
                    <textarea className="form-control form-control-sm text-white border-0 dashboard-input"                       rows={3} name="educacaoExtraida" value={campos.educacaoExtraida} onChange={handleCampo} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-light">Projetos</label>
                    <textarea className="form-control form-control-sm text-white border-0 dashboard-input"                       rows={4} name="projetosExtraidos" value={campos.projetosExtraidos} onChange={handleCampo} />
                  </div>

                </div>

                <div className="d-flex gap-3 mt-4 justify-content-center">
                  <button type="submit" className="btn btn-primary" disabled={salvando}>
                    {salvando ? <><span className="spinner-border spinner-border-sm me-2" />Salvando...</> : '💾 Salvar alterações'}
                  </button>
                  <button type="button" className="btn btn-outline-light" onClick={abrirPortfolio}>
                    🌐 Ver portfólio ↗
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center py-3 small" style={{ color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        PortfólioPro — UNESP 2026 — Grupo X: Brendo, Gabriel, Gustavo, João Vítor, Rafael
      </footer>
    </div>
  )
}
