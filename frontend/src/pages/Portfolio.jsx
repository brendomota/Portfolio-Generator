import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Portfolio() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [curriculo, setCurriculo] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function buscar() {
      try {
        const resposta = await api.get('/curriculo/')
        const todos = resposta.data
        const meus = todos.filter(c => c.usuario?.login === username)
        if (meus.length > 0) setCurriculo(meus[meus.length - 1])
      } catch {
        // Will show not found state
      } finally {
        setCarregando(false)
      }
    }
    buscar()
  }, [username])

  if (carregando) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
        <div className="spinner-border text-primary me-3" />
        <span>Carregando portfólio...</span>
      </div>
    )
  }

  if (!curriculo) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white">
        <h2>Portfólio não encontrado</h2>
        <p className="text-muted">O usuário <strong>{username}</strong> ainda não gerou um portfólio.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>Voltar ao início</button>
      </div>
    )
  }

  const skills = curriculo.skillsExtraidas?.split(',').map(s => s.trim()).filter(Boolean) || []
  const skillsInter = curriculo.skillsInterpessoaisExtraidas?.split(',').map(s => s.trim()).filter(Boolean) || []
  const idiomas = curriculo.idiomasExtraidos?.split(',').map(s => s.trim()).filter(Boolean) || []

  return (
    <div className="bg-dark text-white min-vh-100">
      {/* Header with background image + fade effect */}
      <header style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background image */}
        {curriculo.imagemFundo && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${curriculo.imagemFundo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
          }} />
        )}

        {/* Fade gradient at the bottom — blends into the dark page background */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(to bottom, transparent, #212529)',
          pointerEvents: 'none',
        }} />

        {/* Header content */}
        <div className="container text-center py-5" style={{ position: 'relative', zIndex: 1 }}>
          {/* Profile photo or initial avatar */}
          {curriculo.fotoPerfil ? (
            <img
              src={curriculo.fotoPerfil}
              alt="Foto de perfil"
              className="rounded-circle border border-3 border-primary mb-3"
              style={{ width: 100, height: 100, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: 100, height: 100, fontSize: 40 }}
            >
              {curriculo.nomeExtraido?.[0] || '?'}
            </div>
          )}

          <h1 className="display-5 fw-bold">{curriculo.nomeExtraido}</h1>
          {curriculo.localizacaoExtraida && (
            <p className="mb-2" style={{ color: '#C5CBD3' }}>📍 {curriculo.localizacaoExtraida}</p>
          )}
          <div className="d-flex justify-content-center gap-3 flex-wrap mt-2">
            {curriculo.emailExtraido && (
              <a href={`mailto:${curriculo.emailExtraido}`} className="text-info text-decoration-none">
                ✉️ {curriculo.emailExtraido}
              </a>
            )}
            {curriculo.linkedinExtraido && (
              <a href={`https://${curriculo.linkedinExtraido}`} target="_blank" rel="noreferrer" className="text-info text-decoration-none">
                💼 LinkedIn
              </a>
            )}
            {curriculo.githubExtraido && (
              <a href={`https://${curriculo.githubExtraido}`} target="_blank" rel="noreferrer" className="text-info text-decoration-none">
                🐙 GitHub
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container py-5">
        <div className="row g-4">
          {/* Left column */}
          <div className="col-lg-4">
            {/* Resumo */}
            {curriculo.resumoExtraido && (
              <div className="card border-0 mb-4" style={{ backgroundColor: '#C5CBD3', color: '#0D2035' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold">Sobre mim</h5>
                  <p className="card-text">{curriculo.resumoExtraido}</p> 
                </div>
              </div>
            )}

            {/* Skills técnicas */}
            {skills.length > 0 && (
              <div className="card border-0 mb-4" style={{ backgroundColor: '#C5CBD3', color: '#0D2035' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold">Skills Técnicas</h5>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {skills.map((s, i) => (
                      <span key={i} className="badge bg-primary">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Skills interpessoais */}
            {skillsInter.length > 0 && (
              <div className="card border-0 mb-4" style={{ backgroundColor: '#C5CBD3', color: '#0D2035' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold">Soft Skills</h5>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {skillsInter.map((s, i) => (
                      <span key={i} className="badge bg-success">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Idiomas */}
            {idiomas.length > 0 && (
              <div className="card border-0 mb-4" style={{ backgroundColor: '#C5CBD3', color: '#0D2035' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold">Idiomas</h5>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {idiomas.map((s, i) => (
                      <span key={i} className="badge bg-warning text-dark">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="col-lg-8">
            {/* Experiências */}
            {curriculo.experienciasExtraidas && (
              <div className="mb-4">
                <h4 className="fw-bold border-bottom pb-2 mb-3" style={{ color: '#ffffff', borderColor: '#B0B5BA' }}>💼 Experiências</h4>
                {curriculo.experienciasExtraidas.split(',').map((exp, i) => (
                  <div key={i} className="card border-0 mb-3" style={{ backgroundColor: '#C5CBD3', color: '#0D2035' }}>
                    <div className="card-body">
                      <p className="mb-0">{exp.trim()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Educação */}
            {curriculo.educacaoExtraida && (
              <div className="mb-4">
                <h4 className="fw-bold border-bottom pb-2 mb-3" style={{ color: '#ffffff', borderColor: '#B0B5BA' }}>🎓 Educação</h4>
                {curriculo.educacaoExtraida.split(',').map((edu, i) => (
                  <div key={i} className="card border-0 mb-3" style={{ backgroundColor: '#C5CBD3', color: '#0D2035' }}>
                    <div className="card-body">
                      <p className="mb-0">{edu.trim()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projetos */}
            {curriculo.projetosExtraidos && (
              <div className="mb-4">
                <h4 className="fw-bold border-bottom pb-2 mb-3" style={{ color: '#ffffff', borderColor: '#B0B5BA' }}>🚀 Projetos</h4>
                <div className="row g-3">
                  {curriculo.projetosExtraidos.split('.').filter(p => p.trim().length > 10).map((proj, i) => (
                    <div key={i} className="col-md-6">
                      <div className="card border-0 h-100" style={{ backgroundColor: '#C5CBD3', color: '#0D2035' }}>
                        <div className="card-body">
                          <p className="card-text">{proj.trim()}.</p>
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

      <footer className="border-top border-secondary text-center py-4 text-secondary small">
        <span className="fw-semibold text-light">⚡ Gerado em segundos com PortfólioPro</span>
        <br />
        <span className="opacity-50">portfoiliopro.com.br</span>
      </footer>
    </div>
  )
}
