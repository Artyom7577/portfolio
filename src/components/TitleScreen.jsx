import { useEffect, useState } from 'react'
import { profile } from '../content/portfolio'
import { DIFFICULTIES } from '../game/engine'
import { Sprite } from './Sprites'

// id is either 'match' or the resume section to scroll to.
const MENU = [
  { id: 'match', label: 'KICK OFF', hint: 'PLAY MATCH' },
  { id: 'career', label: 'CAREER MODE', hint: 'EXPERIENCE' },
  { id: 'squad', label: 'SQUAD SELECT', hint: 'SKILLS' },
  { id: 'highlights', label: 'HIGHLIGHTS', hint: 'PROJECTS' },
  { id: 'contact', label: 'FRIENDLIES', hint: 'CONTACT' },
]
const LEVELS = [
  ...Object.entries(DIFFICULTIES).map(([id, d]) => ({ id, label: d.label, hint: d.hint })),
  { id: 'back', label: 'BACK', hint: '' },
]
const PANELS = {
  menu: { title: 'SELECT MODE', items: MENU },
  difficulty: { title: 'SELECT DIFFICULTY', items: LEVELS },
}

// Title screen -> mode select -> (difficulty). Calls onChoose(id, level).
export default function TitleScreen({ onChoose, hidden, startAtMenu = false }) {
  const [stage, setStage] = useState(startAtMenu ? 'menu' : 'title')
  const [kicked, setKicked] = useState(false)
  const [sel, setSel] = useState(0)

  // Reset each time the title screen is shown again.
  useEffect(() => {
    if (hidden) return
    setStage(startAtMenu ? 'menu' : 'title')
    setKicked(false)
    setSel(0)
  }, [hidden, startAtMenu])

  function start() {
    if (kicked) return
    setKicked(true)
    setTimeout(() => setStage('menu'), 700)
  }

  function goTo(next) {
    setStage(next)
    setSel(0)
  }

  function pick(item) {
    if (stage === 'menu') {
      if (item.id === 'match') goTo('difficulty')
      else onChoose(item.id)
    } else if (item.id === 'back') goTo('menu')
    else onChoose('match', item.id)
  }

  function back() {
    if (stage === 'difficulty') goTo('menu')
    else {
      setStage('title')
      setKicked(false)
    }
  }

  useEffect(() => {
    if (hidden) return
    function onKey(e) {
      // Holding Enter/Space must not skip through the title and pick a menu item.
      if (e.repeat) return
      if (stage === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          start()
        }
        return
      }
      const items = PANELS[stage].items
      if (e.key === 'ArrowDown' || e.key === 's') setSel((s) => (s + 1) % items.length)
      else if (e.key === 'ArrowUp' || e.key === 'w') setSel((s) => (s + items.length - 1) % items.length)
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        pick(items[sel])
      } else if (e.key === 'Escape') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const panel = PANELS[stage]

  return (
    <div className={`game${hidden ? ' hidden' : ''}`}>
      <div className="pitchlines">
        <div className="midline" />
        <div className="circle" />
      </div>
      <button className="skiplink px" onClick={() => onChoose('top')}>
        SKIP TO RESUME »
      </button>

      {stage === 'title' ? (
        <>
          <div className="titlebox">
            <p className="eyebrow px">{profile.role}</p>
            <h1 className="gametitle px">
              {profile.firstName}
              <br />
              {profile.lastName}
            </h1>
            <p className="subtitle px">PORTFOLIO CUP ’26</p>
            <button className="pressstart px" onClick={start}>
              PRESS START
            </button>
          </div>
          <button className={`kickball${kicked ? ' kicked' : ''}`} onClick={start} aria-label="Kick off">
            <Sprite id="ball" />
          </button>
        </>
      ) : (
        <div className="menupanel">
          <h2 className="px">{panel.title}</h2>
          {panel.items.map((m, i) => (
            <button
              key={m.id}
              className={`menuitem px${i === sel ? ' sel' : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => pick(m)}
            >
              <Sprite id="ball" className="cursor" />
              {m.label}
              <small>{m.hint}</small>
            </button>
          ))}
          <p className="menuhint px">↑↓ SELECT · ENTER CONFIRM · ESC BACK</p>
        </div>
      )}

      <p className="copyline px">© 2026 {profile.club}</p>
    </div>
  )
}
