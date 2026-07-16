import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getTheme } from '../services/themes'

export default function Portfolio() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [curriculo, setCurriculo] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const buscar = useCallback(async () => {
    try {
      const resposta = await api.get(`/curriculo/publico/${username}`)
      setCurriculo(resposta.data)
    } catch {
      setCurriculo(null)
    } finally {
      setCarregando(false)
    }
  }, [username])

  // Reset state when navigating to a different portfolio
  useEffect(() => {
    setCurriculo(null)
    setCarregando(true)
  }, [username])

  // Initial load
  useEffect(() => {
    buscar()
  }, [buscar])

  // Poll every 4 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(buscar, 4000)
    return () => clearInterval(interval)
  }, [buscar])

  // Instant refresh when dashboard triggers a save event via localStorage
  useEffect(() => {
    function onStorageChange(e) {
      if (e.key === 'portfolio_updated') buscar()
    }
    window.addEventListener('storage', onStorageChange)
    return () => window.removeEventListener('storage', onStorageChange)
  }, [buscar])

  // Must be before any conditional return — React rules of hooks
  useEffect(() => {
    if (!curriculo) return
    if (curriculo.favicon) {
      let link = document.querySelector("link[rel~='icon']")
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
      link.href = curriculo.favicon
    }
    if (curriculo.nomeExtraido) document.title = `${curriculo.nomeExtraido} | Portfólio`
  }, [curriculo])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#212529] text-white">
        <div className="inline-block w-8 h-8 align-text-bottom rounded-full border-[0.25em] border-current border-r-transparent animate-[spin_0.75s_linear_infinite] text-[#0d6efd] mr-4" />
        <span>Carregando portfólio...</span>
      </div>
    )
  }

  if (!curriculo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#212529] text-white">
        <h2 className="text-[2rem] leading-[1.2] mb-2">Portfólio não encontrado</h2>
        <p className="text-[#6c757d] mb-4">O usuário <strong>{username}</strong> ainda não gerou um portfólio.</p>
        <button
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-base leading-normal cursor-pointer transition bg-[#0d6efd] border border-[#0d6efd] text-white hover:bg-[#0b5ed7] hover:border-[#0a58ca] mt-4"
          onClick={() => navigate('/')}
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  const skills = curriculo.skillsExtraidas?.split(',').map(s => s.trim()).filter(Boolean) || []
  const skillsInter = curriculo.skillsInterpessoaisExtraidas?.split(',').map(s => s.trim()).filter(Boolean) || []
  const idiomas = curriculo.idiomasExtraidos?.split(',').map(s => s.trim()).filter(Boolean) || []
  const tema = getTheme(curriculo.temaFundo)

  const glass = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    color: '#f0f4f8',
  }

  // Extract last color from theme gradient to use as fade target
  const fadeColor = tema.gradient.match(/#[0-9a-f]{6}/gi)?.slice(-1)[0] || '#0f0c29'

  return (
    <div className="text-white min-h-screen" style={{ background: tema.gradient }}>
      {/* Header with background image + fade effect */}
      <header style={{ position: 'relative', overflow: 'hidden', minHeight: 340 }}>
        {/* Background image */}
        {curriculo.imagemFundo ? (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${curriculo.imagemFundo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.45)',
          }} />
        ) : (
          // Fallback: use theme gradient as header background when no image
          <div style={{ position: 'absolute', inset: 0, background: tema.gradient, opacity: 0.6 }} />
        )}

        {/* Strong fade — top layer darkens image, bottom merges into page */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, ${fadeColor}cc 55%, ${fadeColor} 100%)`,
          pointerEvents: 'none',
        }} />

        {/* Header content */}
        <div className="container-bs text-center py-12" style={{ position: 'relative', zIndex: 1 }}>
          {/* Profile photo or initial avatar */}
          {curriculo.fotoPerfil ? (<div className="w-full flex justify-center">
            <img
              src={curriculo.fotoPerfil}
              alt="Foto de perfil"
              className="rounded-full mb-4"
              style={{
                width: 140,
                height: 140,
                objectFit: 'cover',
                border: `3px solid rgba(255,255,255,0.12)`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            /></div>
          ) : (
            <div
              className="rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                width: 140,
                height: 140,
                fontSize: 56,
                background: 'rgba(255,255,255,0.15)',
                border: '3px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {curriculo.nomeExtraido?.[0] || '?'}
            </div>
          )}

          <h1 className="text-[3rem] leading-[1.2] font-bold mb-2" style={{ color: '#f0f4f8' }}>{curriculo.nomeExtraido}</h1>
          {curriculo.localizacaoExtraida && (
            <p className="mb-2" style={{ color: 'rgba(240,244,248,0.75)' }}>📍 {curriculo.localizacaoExtraida}</p>
          )}
          <div className="flex justify-center gap-4 flex-wrap mt-2">
            {curriculo.linkedinExtraido && (
              <a href={curriculo.linkedinExtraido.startsWith('http') ? curriculo.linkedinExtraido : `https://${curriculo.linkedinExtraido}`} target="_blank" rel="noreferrer" style={{ color: '#a5d8ff' }} className="no-underline">
                💼 LinkedIn
              </a>
            )}
            {curriculo.emailExtraido && (
              <a href={`mailto:${curriculo.emailExtraido}`} style={{ color: '#a5d8ff' }} className="no-underline">
                ✉️ {curriculo.emailExtraido}
              </a>
            )}
            {curriculo.githubExtraido && (
              <a href={curriculo.githubExtraido.startsWith('http') ? curriculo.githubExtraido : `https://${curriculo.githubExtraido}`} target="_blank" rel="noreferrer" style={{ color: '#a5d8ff' }} className="no-underline">
                🐙 GitHub
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container-bs py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-4">
            {/* Resumo */}
            {curriculo.resumoExtraido && (
              <div className="rounded-md mb-6" style={glass}>
                <div className="p-4">
                  <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2">Sobre mim</h5>
                  <p>{curriculo.resumoExtraido}</p>
                </div>
              </div>
            )}

            {/* Skills técnicas */}
            {skills.length > 0 && (
              <div className="rounded-md mb-6" style={glass}>
                <div className="p-4">
                  <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2">Skills Técnicas</h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((s, i) => (
                      <span key={i} className="inline-block px-[0.65em] py-[0.35em] text-[0.75em] font-bold leading-none text-center whitespace-nowrap align-baseline rounded-md bg-[#0d6efd] text-white">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Skills interpessoais */}
            {skillsInter.length > 0 && (
              <div className="rounded-md mb-6" style={glass}>
                <div className="p-4">
                  <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2">Soft Skills</h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillsInter.map((s, i) => (
                      <span key={i} className="inline-block px-[0.65em] py-[0.35em] text-[0.75em] font-bold leading-none text-center whitespace-nowrap align-baseline rounded-md bg-[#198754] text-white">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Idiomas */}
            {idiomas.length > 0 && (
              <div className="rounded-md mb-6" style={glass}>
                <div className="p-4">
                  <h5 className="font-bold text-[1.25rem] leading-[1.2] mb-2">Idiomas</h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {idiomas.map((s, i) => (
                      <span key={i} className="inline-block px-[0.65em] py-[0.35em] text-[0.75em] font-bold leading-none text-center whitespace-nowrap align-baseline rounded-md bg-[#ffc107] text-[#212529]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-8">
            {/* Experiências */}
            {curriculo.experienciasExtraidas && (
              <div className="mb-6">
                <h4 className="font-bold text-[1.5rem] leading-[1.2] border-b pb-2 mb-4" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>💼 Experiências</h4>
                {curriculo.experienciasExtraidas.split(',').map((exp, i) => (
                  <div key={i} className="rounded-md mb-4" style={glass}>
                    <div className="p-4">
                      <p className="mb-0">{exp.trim()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Educação */}
            {curriculo.educacaoExtraida && (
              <div className="mb-6">
                <h4 className="font-bold text-[1.5rem] leading-[1.2] border-b pb-2 mb-4" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>🎓 Educação</h4>
                {curriculo.educacaoExtraida.split(',').map((edu, i) => (
                  <div key={i} className="rounded-md mb-4" style={glass}>
                    <div className="p-4">
                      <p className="mb-0">{edu.trim()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projetos */}
            {curriculo.projetosExtraidos && (
              <div className="mb-6">
                <h4 className="font-bold text-[1.5rem] leading-[1.2] border-b pb-2 mb-4" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>🚀 Projetos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curriculo.projetosExtraidos.split('.').filter(p => p.trim().length > 10).map((proj, i) => (
                    <div key={i}>
                      <div className="rounded-md h-full" style={glass}>
                        <div className="p-4">
                          <p>{proj.trim()}.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-[#6c757d] text-center py-6 text-[#6c757d] text-sm">
        <span className="font-semibold text-[#f8f9fa]">⚡ Gerado em segundos com PortfólioPro</span>
        <br />
        <span className="opacity-50">portfoiliopro.com.br</span>
      </footer>
    </div>
  )
}
