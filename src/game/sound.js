// 16-bit style sound effects, synthesized with Web Audio (no audio files to load).
// Browsers only allow audio after a user gesture; the match starts from a click, and
// unlock() is called again on the first key/touch in case the context starts suspended.

const STORAGE_KEY = 'hfc-sound'
const MASTER_VOLUME = 0.35
const CROWD_VOLUME = 0.035

let ctx = null
let master = null
let noise = null
let crowd = null
let muted = readMuted()

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'off'
  } catch {
    return false
  }
}

function audio() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = muted ? 0 : MASTER_VOLUME
  master.connect(ctx.destination)
  // One second of white noise, reused by every noisy effect.
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return ctx
}

export function unlock() {
  const c = audio()
  if (c && c.state === 'suspended') c.resume()
}

export const isMuted = () => muted

export function setMuted(value) {
  muted = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'off' : 'on')
  } catch {
    // Private mode or blocked storage: the setting just isn't remembered.
  }
  if (master) master.gain.setTargetAtTime(value ? 0 : MASTER_VOLUME, ctx.currentTime, 0.02)
}

// A single oscillator note with a quick attack and exponential release.
function tone({ type = 'square', from, to = from, at = 0, dur, vol = 0.5 }) {
  const t = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t)
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  env.gain.setValueAtTime(0.0001, t)
  env.gain.exponentialRampToValueAtTime(vol, t + 0.005)
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(env).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

// Band-passed noise burst: kicks, slides, the crowd.
function hiss({ freq, q = 1, at = 0, dur, vol = 0.5, attack = 0.005, sweepTo }) {
  const t = ctx.currentTime + at
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const env = ctx.createGain()
  src.buffer = noise
  src.loop = true
  filter.type = 'bandpass'
  filter.Q.value = q
  filter.frequency.setValueAtTime(freq, t)
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t + dur)
  env.gain.setValueAtTime(0.0001, t)
  env.gain.exponentialRampToValueAtTime(vol, t + attack)
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(env).connect(master)
  src.start(t)
  src.stop(t + dur + 0.02)
}

// Referee whistle: a high sine with a fast trill.
function whistle(at, dur) {
  const t = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const trill = ctx.createOscillator()
  const depth = ctx.createGain()
  const env = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 2600
  trill.frequency.value = 32
  depth.gain.value = 140
  trill.connect(depth).connect(osc.frequency)
  env.gain.setValueAtTime(0.0001, t)
  env.gain.exponentialRampToValueAtTime(0.22, t + 0.02)
  env.gain.setValueAtTime(0.22, t + dur - 0.04)
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(env).connect(master)
  for (const o of [osc, trill]) {
    o.start(t)
    o.stop(t + dur + 0.02)
  }
}

const EFFECTS = {
  pass: () => tone({ from: 880, to: 660, dur: 0.06, vol: 0.25 }),
  shot: () => {
    hiss({ freq: 1800, q: 0.8, dur: 0.08, vol: 0.6 })
    tone({ from: 420, to: 110, dur: 0.16, vol: 0.35 })
  },
  slide: () => hiss({ freq: 600, sweepTo: 2400, q: 1.5, dur: 0.22, vol: 0.35 }),
  tackle: () => {
    tone({ from: 260, dur: 0.06, vol: 0.3 })
    tone({ from: 196, at: 0.07, dur: 0.09, vol: 0.3 })
  },
  bounce: () => tone({ type: 'triangle', from: 180, to: 90, dur: 0.06, vol: 0.4 }),
  kickoff: () => whistle(0, 0.45),
  goal: ({ team }) => {
    if (team === 0) {
      // Rising fanfare and a roaring crowd.
      ;[523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
        tone({ from: f, at: i * 0.09, dur: i === 5 ? 0.4 : 0.1, vol: 0.28 }))
      hiss({ freq: 900, q: 0.6, dur: 1.8, vol: 0.45, attack: 0.25 })
    } else {
      // Sad trombone for Bug City.
      ;[392, 370, 349].forEach((f, i) => tone({ type: 'triangle', from: f, at: i * 0.22, dur: 0.2, vol: 0.4 }))
      tone({ type: 'triangle', from: 330, to: 300, at: 0.66, dur: 0.5, vol: 0.4 })
    }
  },
  fulltime: () => {
    whistle(0, 0.25)
    whistle(0.35, 0.25)
    whistle(0.7, 0.8)
    hiss({ freq: 900, q: 0.6, at: 0.7, dur: 2, vol: 0.3, attack: 0.3 })
  },
}

export function play(event) {
  if (muted || !audio() || ctx.state !== 'running') return
  EFFECTS[event.type]?.(event)
}

// Low stadium murmur under the whole match.
export function startCrowd() {
  if (!audio() || crowd) return
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const env = ctx.createGain()
  src.buffer = noise
  src.loop = true
  filter.type = 'bandpass'
  filter.frequency.value = 500
  filter.Q.value = 0.7
  env.gain.setValueAtTime(0.0001, ctx.currentTime)
  env.gain.exponentialRampToValueAtTime(CROWD_VOLUME, ctx.currentTime + 1)
  src.connect(filter).connect(env).connect(master)
  src.start()
  crowd = { src, env }
}

export function stopCrowd() {
  if (!crowd) return
  const { src, env } = crowd
  crowd = null
  env.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15)
  src.stop(ctx.currentTime + 0.6)
}
