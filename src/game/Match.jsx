import { useEffect, useRef, useState } from 'react'
import { createMatch, step, W, H, MATCH_SECONDS, DIFFICULTIES } from './engine'
import { draw } from './render'
import * as sound from './sound'
import { match as text } from '../content/portfolio'

const MOVE_KEYS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
}
const SHOOT_KEYS = ['KeyX', 'Space', 'KeyJ']
const PASS_KEYS = ['KeyZ', 'KeyK']
const JOY_RADIUS = 40

const hudOf = (s) => ({
  score: s.score.join('-'),
  minute: Math.min(90, Math.floor((s.time / MATCH_SECONDS) * 90)),
  phase: s.phase,
})
const isTouch = () => window.matchMedia('(pointer: coarse)').matches

export default function Match({ level, onExit }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const input = useRef({ keys: new Set(), joy: { x: 0, y: 0 }, shoot: false, pass: false })
  const exitRef = useRef(onExit)
  exitRef.current = onExit
  const [hud, setHud] = useState({ score: '0-0', minute: 0, phase: 'kickoff' })
  const [touch, setTouch] = useState(isTouch)
  const [muted, setMuted] = useState(sound.isMuted)

  if (!stateRef.current) stateRef.current = createMatch(level)

  // Keyboard
  useEffect(() => {
    const inp = input.current
    function down(e) {
      sound.unlock()
      if (e.code === 'Escape') return exitRef.current('menu')
      if (e.code === 'KeyM') return toggleSound()
      const known = MOVE_KEYS[e.code] || SHOOT_KEYS.includes(e.code) || PASS_KEYS.includes(e.code)
      if (!known) return
      e.preventDefault()
      if (!e.repeat) {
        if (SHOOT_KEYS.includes(e.code)) inp.shoot = true
        if (PASS_KEYS.includes(e.code)) inp.pass = true
      }
      inp.keys.add(e.code)
    }
    const up = (e) => inp.keys.delete(e.code)
    const blur = () => inp.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  // Crowd murmur for the whole match; also retry unlocking audio on the first touch.
  useEffect(() => {
    sound.unlock()
    sound.startCrowd()
    window.addEventListener('pointerdown', sound.unlock)
    return () => {
      window.removeEventListener('pointerdown', sound.unlock)
      sound.stopCrowd()
    }
  }, [])

  // Show touch controls as soon as the screen is touched, even on hybrid devices.
  useEffect(() => {
    const onTouch = () => setTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true, passive: true })
    // iOS Safari ignores user-scalable=no; block pinch zoom while playing.
    const noZoom = (e) => e.preventDefault()
    document.addEventListener('gesturestart', noZoom)
    return () => {
      window.removeEventListener('touchstart', onTouch)
      document.removeEventListener('gesturestart', noZoom)
    }
  }, [])

  // Game loop
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    const inp = input.current
    let raf = 0
    let last = performance.now()
    let lastHud = ''

    function frame(now) {
      // Clamp: rAF timestamps can precede `last`, and tab switches cause huge gaps.
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      let x = inp.joy.x
      let y = inp.joy.y
      for (const k of inp.keys) {
        const v = MOVE_KEYS[k]
        if (v) { x += v[0]; y += v[1] }
      }
      const s = stateRef.current
      const wasOver = s.phase === 'fulltime'
      step(s, dt, { x, y, shoot: inp.shoot, pass: inp.pass })
      inp.shoot = false
      inp.pass = false
      for (const e of s.events) sound.play(e)
      s.events.length = 0
      if (!wasOver) draw(ctx, s) // the final frame stays on screen under the result panel

      const h = hudOf(s)
      const key = `${h.score}|${h.minute}|${h.phase}`
      if (key !== lastHud) { lastHud = key; setHud(h) }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  function toggleSound() {
    const next = !sound.isMuted()
    sound.setMuted(next)
    setMuted(next)
  }

  function rematch() {
    stateRef.current = createMatch(level)
    setHud(hudOf(stateRef.current))
  }

  const s = stateRef.current
  const result = s.score[0] > s.score[1] ? 'win' : s.score[0] < s.score[1] ? 'loss' : 'draw'

  return (
    <div className={`match${touch ? ' touch' : ''}`}>
      <div className="stage">
        <canvas ref={canvasRef} width={W} height={H} className="matchcanvas" />
      </div>

      <button className="matchquit px" onClick={() => onExit('menu')}>« MENU</button>
      <button
        className="matchsound px"
        onClick={(e) => {
          e.currentTarget.blur() // so Space (shoot) doesn't re-trigger the button
          toggleSound()
        }}
        aria-pressed={!muted}
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      >
        {muted ? 'SOUND OFF' : 'SOUND ON'}
      </button>
      <div className="matchhud px" aria-live="polite">
        <span>{text.home}</span>
        <span className="matchscore">{hud.score}</span>
        <span>{text.away}</span>
        <span className="matchclock">{hud.minute}’</span>
        <span className="matchlevel">{DIFFICULTIES[level].label}</span>
      </div>

      {hud.phase === 'kickoff' && <div className="matchbanner px">KICK OFF</div>}
      {hud.phase === 'goal' && <div className="matchbanner px">GOAL!</div>}

      {touch ? <TouchPad input={input.current} /> : (
        <p className="matchhint px">ARROWS/WASD MOVE · X SHOOT/TACKLE · Z PASS/SWITCH · M SOUND · ESC MENU</p>
      )}

      {hud.phase === 'fulltime' && (
        <div className="fulltime">
          <div className="ftpanel">
            <p className="px ftlabel">FULL TIME · {DIFFICULTIES[level].label}</p>
            <p className="px ftscore">{text.home} {hud.score} {text.away}</p>
            <p className="px ftresult">{text.results[result]}</p>
            <div className="ftbtns">
              <button className="px ftbtn" onClick={rematch}>REMATCH</button>
              <button className="px ftbtn" onClick={() => onExit('resume')}>VIEW RESUME</button>
              <button className="px ftbtn" onClick={() => onExit('menu')}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Virtual joystick (left) and A/B buttons (right) for phones and tablets.
function TouchPad({ input }) {
  const baseRef = useRef(null)
  const thumbRef = useRef(null)

  function moveJoy(e) {
    const r = baseRef.current.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2)
    let dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy)
    if (d > JOY_RADIUS) { dx = (dx / d) * JOY_RADIUS; dy = (dy / d) * JOY_RADIUS }
    const dead = d < 8
    input.joy.x = dead ? 0 : dx / JOY_RADIUS
    input.joy.y = dead ? 0 : dy / JOY_RADIUS
    thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`
  }
  function releaseJoy() {
    input.joy.x = 0
    input.joy.y = 0
    thumbRef.current.style.transform = ''
  }
  const press = (flag) => (e) => {
    e.preventDefault()
    input[flag] = true
  }

  return (
    <div className="touchpad">
      <div
        ref={baseRef}
        className="joy"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moveJoy(e) }}
        onPointerMove={(e) => e.buttons && moveJoy(e)}
        onPointerUp={releaseJoy}
        onPointerCancel={releaseJoy}
      >
        <div ref={thumbRef} className="joythumb" />
      </div>
      <div className="padbtns">
        <button className="padbtn b px" onPointerDown={press('pass')} aria-label="Pass or switch player">B</button>
        <button className="padbtn a px" onPointerDown={press('shoot')} aria-label="Shoot or tackle">A</button>
      </div>
    </div>
  )
}
