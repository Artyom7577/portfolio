import { useEffect, useRef, useState } from 'react'
import { SpriteDefs } from './components/Sprites'
import TitleScreen from './components/TitleScreen'
import Resume from './components/Resume'
import Match from './game/Match'

// Screens: 'title' (title + mode select), 'match', or 'resume'.
// '#play' opens the match directly; any other #section link skips to the resume.
function initialScreen() {
  const hash = window.location.hash
  if (hash === '#play') return 'match'
  return hash ? 'resume' : 'title'
}

export default function App() {
  const [screen, setScreen] = useState(initialScreen)
  const [menuFirst, setMenuFirst] = useState(false)
  const [level, setLevel] = useState('rookie')
  const [wipe, setWipe] = useState(false)
  const busy = useRef(false)

  useEffect(() => {
    document.body.style.overflow = screen === 'resume' ? '' : 'hidden'
  }, [screen])

  // Ignore new transitions while one is running (double clicks, repeated Esc).
  function transition(next, then) {
    if (busy.current) return
    busy.current = true
    setWipe(true)
    setTimeout(() => {
      setScreen(next)
      then?.()
    }, 300)
    setTimeout(() => {
      setWipe(false)
      busy.current = false
    }, 650)
  }

  function choose(id, nextLevel) {
    if (id === 'match') {
      if (nextLevel) setLevel(nextLevel)
      return transition('match')
    }
    transition('resume', () => {
      setTimeout(() => {
        const target = document.getElementById(id)
        if (target) target.scrollIntoView()
        else window.scrollTo(0, 0)
      }, 0)
    })
  }

  function leaveMatch(to) {
    if (window.location.hash === '#play') history.replaceState(null, '', ' ')
    if (to === 'resume') return choose('top')
    setMenuFirst(true)
    transition('title')
  }

  return (
    <>
      <SpriteDefs />
      <Resume onPlay={() => { setMenuFirst(false); transition('title') }} />
      <TitleScreen hidden={screen !== 'title'} startAtMenu={menuFirst} onChoose={choose} />
      {screen === 'match' && <Match level={level} onExit={leaveMatch} />}
      <div className={`wipe${wipe ? ' go' : ''}`} />
    </>
  )
}
