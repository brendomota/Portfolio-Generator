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
      // O backend identifica o dono do currículo pelo Bearer Token (não precisamos
      // mais descobrir/enviar o usuarioId — ver CurriculoController.saveCurriculo)
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

  // Classes reaproveitadas nos inputs/textareas do formulário de edição
  const dashInput = "block w-full px-2 py-1 text-sm rounded text-white border-0 dashboard-input transition"

  return (
    <div className="min-h-screen flex flex-col text-white" style={{
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
      <nav className="flex flex-wrap items-center justify-between py-2 px-6" style={{ backgroundColor: 'transparent', background: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="font-bold text-xl text-white">🚀 PortfólioPro</span>
        <div className="flex items-center gap-4">
          <span className="text-[#f8f9fa] text-sm">Olá, <strong>{login}</strong></span>
          {temDados && (
            <button className="inline-flex items-center justify-center px-2 py-1 text-sm rounded cursor-pointer transition text-white border border-white bg-transparent hover:bg-white hover:text-black" onClick={abrirPortfolio}>
              Ver portfólio ↗
            </button>
          )}
          <button className="inline-flex items-center justify-center px-2 py-1 text-sm rounded cursor-pointer transition text-[#dc3545] border border-[#dc3545] bg-transparent hover:bg-[#dc3545] hover:text-white" onClick={handleLogout}>Sair</button>
        </div>
      </nav>

      <div className="container-bs py-6 flex-1">

        {/* Link em destaque — centralizado */}
        {temDados && (
          <div className="mb-6 text-center py-6">
            <div>
              <p className="text-[#f8f9fa] opacity-75 text-sm mb-1">Dashboard de</p>
              <h3 className="text-white font-bold text-[1.75rem] leading-[1.2] mb-1">{campos.nomeExtraido || login}</h3>
              <p className="text-[#f8f9fa] opacity-75 text-sm mb-2">Seu portfólio público:</p>
              <p className="text-[#0dcaf0] font-semibold text-sm mb-4">{portfolioUrl}</p>
              <div className="flex justify-center gap-2">
                <button className="inline-flex items-center justify-center px-2 py-1 text-sm rounded cursor-pointer transition text-white border border-white bg-transparent hover:bg-white hover:text-black" onClick={copiarLink}>
                  {linkCopiado ? '✅ Copiado!' : '📋 Copie seu link'}
                </button>
                <button className="inline-flex items-center justify-center px-2 py-1 text-sm rounded cursor-pointer transition bg-[#0d6efd] border border-[#0d6efd] text-white hover:bg-[#0b5ed7] hover:border-[#0a58ca]" onClick={abrirPortfolio}>
                  🌐 Abrir ↗
                </button>
              </div>
            </div>
          </div>
        )}

        {erro && <div className="bg-[#f8d7da] text-[#842029] border border-[#f5c2c7] rounded-md p-4 mb-4">{erro}</div>}
        {sucesso && <div className="bg-[#d1e7dd] text-[#0f5132] border border-[#badbcc] rounded-md p-4 mb-4">{sucesso}</div>}

        {/* Upload */}
        <div className="rounded-md mb-6" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12) !important', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="p-4">
            <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2 text-white">📄 Upload de Currículo</h5>
            <p className="text-[#f8f9fa] opacity-75 text-sm mb-4">
              Nossa IA irá extrair automaticamente seus dados. Você pode revisar e editar tudo depois.
            </p>
            <form onSubmit={handleUpload} className="flex gap-4 items-end flex-wrap">
              <div className="flex-1">
                <label className="block text-sm text-[#f8f9fa] mb-2">Selecione o arquivo PDF</label>
                <input className="block w-full px-2 py-1 text-sm rounded text-[#212529] bg-white border border-[#dee2e6] transition file:mr-3 file:border-0 file:border-r file:border-r-[#dee2e6] file:bg-[#e9ecef] file:px-2 file:py-1 file:text-[#212529]" type="file" accept=".pdf"
                  onChange={e => setArquivo(e.target.files[0])} required />
              </div>
              <button type="submit" className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-base leading-normal cursor-pointer transition bg-[#0d6efd] border border-[#0d6efd] text-white hover:bg-[#0b5ed7] hover:border-[#0a58ca] disabled:opacity-[0.65] disabled:cursor-not-allowed" disabled={enviando || !arquivo}>
                {enviando
                  ? <><span className="inline-block w-4 h-4 align-text-bottom rounded-full border-[0.2em] border-current border-r-transparent animate-[spin_0.75s_linear_infinite] mr-2" />Processando IA...</>
                  : '🚀 Enviar e gerar portfólio'}
              </button>
            </form>
          </div>
        </div>

        {/* Personalização visual — antes do formulário de edição */}
        {temDados && (
          <div className="rounded-md mb-6" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12) !important', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="p-4">
              <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2 text-white">🖼️ Personalização visual</h5>
              <p className="text-[#f8f9fa] opacity-75 text-sm mb-4">Adicione foto de perfil e imagem de fundo para o seu portfólio.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tema de fundo */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-[#f8f9fa] mb-2">Tema de fundo do portfólio</label>
                  <div className="flex flex-wrap gap-2 mt-1">
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
                  <p className="text-[#f8f9fa] opacity-50 text-sm mt-1">
                    Selecionado: <strong className="text-white">{THEMES.find(t => t.id === temaSelecionado)?.nome}</strong>
                  </p>
                </div>

                {/* Foto e fundo */}
                <div>
                  <label className="block text-sm text-[#f8f9fa] mb-2">
                    Foto de perfil <span className="opacity-50">— quadrada, 400×400px ideal, máx. 2MB</span>
                  </label>
                  <input className="block w-full px-2 py-1 text-sm rounded text-[#212529] bg-white border border-[#dee2e6] transition file:mr-3 file:border-0 file:border-r file:border-r-[#dee2e6] file:bg-[#e9ecef] file:px-2 file:py-1 file:text-[#212529]" type="file" accept="image/*" onChange={handleFotoChange} />
                  {previewFoto && (
                    <img src={previewFoto} alt="preview" className="mt-2 rounded-full border border-[#0d6efd]"
                      style={{ width: 72, height: 72, objectFit: 'cover' }} />
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#f8f9fa] mb-2">
                    Imagem de fundo <span className="opacity-50">— 1920×1080px ideal, máx. 5MB</span>
                  </label>
                  <input className="block w-full px-2 py-1 text-sm rounded text-[#212529] bg-white border border-[#dee2e6] transition file:mr-3 file:border-0 file:border-r file:border-r-[#dee2e6] file:bg-[#e9ecef] file:px-2 file:py-1 file:text-[#212529]" type="file" accept="image/*" onChange={handleFundoChange} />
                  {previewFundo && (
                    <img src={previewFundo} alt="preview fundo" className="mt-2 rounded-md border border-[#6c757d] w-full"
                      style={{ height: 72, objectFit: 'cover' }} />
                  )}
                </div>

                {/* Favicon */}
                <div>
                  <label className="block text-sm text-[#f8f9fa] mb-2">
                    Ícone da aba (favicon) <span className="opacity-50">— PNG/ICO, máx. 512×512px, 200KB</span>
                  </label>
                  <input className="block w-full px-2 py-1 text-sm rounded text-[#212529] bg-white border border-[#dee2e6] transition file:mr-3 file:border-0 file:border-r file:border-r-[#dee2e6] file:bg-[#e9ecef] file:px-2 file:py-1 file:text-[#212529]" type="file" accept="image/png,image/x-icon,image/svg+xml"
                    onChange={handleFaviconChange} />
                  {previewFavicon && (
                    <img src={previewFavicon} alt="favicon preview" className="mt-2 rounded-md border border-[#6c757d]"
                      style={{ width: 40, height: 40, objectFit: 'contain', background: '#333', padding: 4 }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editable fields */}
        {temDados && (
          <div className="rounded-md" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12) !important', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="p-4">
              <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2 text-white">✏️ Revise e edite seus dados</h5>
              <p className="text-[#f8f9fa] opacity-75 text-sm mb-6">Ajuste qualquer informação que a IA tenha extraído incorretamente.</p>

              <form onSubmit={handleSalvar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Dados básicos */}
                  <div>
                    <label className="block text-sm text-[#f8f9fa] mb-2">Nome</label>
                    <input className={dashInput} name="nomeExtraido" value={campos.nomeExtraido} onChange={handleCampo} />
                  </div>
                  <div>
                    <label className="block text-sm text-[#f8f9fa] mb-2">Email</label>
                    <input className={dashInput} name="emailExtraido" value={campos.emailExtraido} onChange={handleCampo} />
                  </div>
                  <div>
                    <label className="block text-sm text-[#f8f9fa] mb-2">LinkedIn</label>
                    <input className={dashInput} name="linkedinExtraido" value={campos.linkedinExtraido} onChange={handleCampo} />
                  </div>
                  <div>
                    <label className="block text-sm text-[#f8f9fa] mb-2">GitHub</label>
                    <input className={dashInput} name="githubExtraido" value={campos.githubExtraido} onChange={handleCampo} />
                  </div>
                  <div>
                    <label className="block text-sm text-[#f8f9fa] mb-2">Localização</label>
                    <input className={dashInput} name="localizacaoExtraida" value={campos.localizacaoExtraida} onChange={handleCampo} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#f8f9fa] mb-2">Resumo profissional</label>
                    <textarea className={dashInput} rows={3} name="resumoExtraido" value={campos.resumoExtraido} onChange={handleCampo} />
                  </div>

                  {/* Skills com preview */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#f8f9fa] mb-2">Skills Técnicas <span className="opacity-50">(separadas por vírgula)</span></label>
                    <input className={dashInput} name="skillsExtraidas" value={campos.skillsExtraidas} onChange={handleCampo} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campos.skillsExtraidas?.split(',').filter(s => s.trim()).map((s, i) => (
                        <span key={i} className="inline-block px-[0.65em] py-[0.35em] text-[0.75em] font-bold leading-none text-center whitespace-nowrap align-baseline rounded-md bg-[#0d6efd] text-white">{s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#f8f9fa] mb-2">Soft Skills <span className="opacity-50">(separadas por vírgula)</span></label>
                    <input className={dashInput} name="skillsInterpessoaisExtraidas" value={campos.skillsInterpessoaisExtraidas} onChange={handleCampo} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campos.skillsInterpessoaisExtraidas?.split(',').filter(s => s.trim()).map((s, i) => (
                        <span key={i} className="inline-block px-[0.65em] py-[0.35em] text-[0.75em] font-bold leading-none text-center whitespace-nowrap align-baseline rounded-md bg-[#198754] text-white">{s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#f8f9fa] mb-2">Idiomas <span className="opacity-50">(separados por vírgula)</span></label>
                    <input className={dashInput} name="idiomasExtraidos" value={campos.idiomasExtraidos} onChange={handleCampo} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campos.idiomasExtraidos?.split(',').filter(s => s.trim()).map((s, i) => (
                        <span key={i} className="inline-block px-[0.65em] py-[0.35em] text-[0.75em] font-bold leading-none text-center whitespace-nowrap align-baseline rounded-md bg-[#ffc107] text-[#212529]">{s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  {/* Textos longos */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#f8f9fa] mb-2">Experiências</label>
                    <textarea className={dashInput} rows={4} name="experienciasExtraidas" value={campos.experienciasExtraidas} onChange={handleCampo} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#f8f9fa] mb-2">Educação</label>
                    <textarea className={dashInput} rows={3} name="educacaoExtraida" value={campos.educacaoExtraida} onChange={handleCampo} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#f8f9fa] mb-2">Projetos</label>
                    <textarea className={dashInput} rows={4} name="projetosExtraidos" value={campos.projetosExtraidos} onChange={handleCampo} />
                  </div>

                </div>

                <div className="flex gap-4 mt-6 justify-center">
                  <button type="submit" className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-base leading-normal cursor-pointer transition bg-[#0d6efd] border border-[#0d6efd] text-white hover:bg-[#0b5ed7] hover:border-[#0a58ca] disabled:opacity-[0.65] disabled:cursor-not-allowed" disabled={salvando}>
                    {salvando ? <><span className="inline-block w-4 h-4 align-text-bottom rounded-full border-[0.2em] border-current border-r-transparent animate-[spin_0.75s_linear_infinite] mr-2" />Salvando...</> : '💾 Salvar alterações'}
                  </button>
                  <button type="button" className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-base leading-normal cursor-pointer transition text-white border border-white bg-transparent hover:bg-white hover:text-black" onClick={abrirPortfolio}>
                    🌐 Ver portfólio ↗
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center py-4 text-sm" style={{ color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        PortfólioPro — UNESP 2026 — Grupo X: Brendo, Gabriel, Gustavo, João Vítor, Rafael
      </footer>
    </div>
  )
}
