export const THEMES = [
  {
    id: 'roxo',
    nome: 'Roxo Cósmico',
    preview: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  },
  {
    id: 'oceano',
    nome: 'Oceano Profundo',
    preview: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
  },
  {
    id: 'floresta',
    nome: 'Floresta Negra',
    preview: 'linear-gradient(135deg, #0a0f0d, #1a2e1a, #0d3b2a)',
    background: 'linear-gradient(135deg, #0a0f0d, #1a2e1a, #0d3b2a)',
  },
  {
    id: 'aurora',
    nome: 'Aurora Boreal',
    preview: 'linear-gradient(135deg, #0d0d2b, #1a1a4e, #0d3b3b, #1a4e1a)',
    background: 'linear-gradient(135deg, #0d0d2b, #1a1a4e, #0d3b3b, #1a4e1a)',
  },
  {
    id: 'vulcao',
    nome: 'Vulcão',
    preview: 'linear-gradient(135deg, #1a0000, #3d0000, #7a1500)',
    background: 'linear-gradient(135deg, #1a0000, #3d0000, #7a1500)',
  },
  {
    id: 'quartzo',
    nome: 'Quartzo Rosa',
    preview: 'linear-gradient(135deg, #1a0a1a, #3d1a3d, #6b2d5e)',
    background: 'linear-gradient(135deg, #1a0a1a, #3d1a3d, #6b2d5e)',
  },
  {
    id: 'meia-noite',
    nome: 'Meia-noite',
    preview: 'linear-gradient(135deg, #0a0a0a, #1a1a1a, #2a2a2a)',
    background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a, #2a2a2a)',
  },
  {
    id: 'dourado',
    nome: 'Dourado Imperial',
    preview: 'linear-gradient(135deg, #0d0900, #2a1f00, #4a3500)',
    background: 'linear-gradient(135deg, #0d0900, #2a1f00, #4a3500)',
  },
]

export function getTheme(id) {
  return THEMES.find(t => t.id === id) || THEMES[0]
}
