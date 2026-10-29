// Match simulation: 3-a-side top-down football on a landscape pitch.
// Pure logic, no DOM. Team 0 is the visitor (attacks right), team 1 the CPU.

export const W = 320
export const H = 180
export const FIELD = { x0: 16, x1: 304, y0: 14, y1: 170 }
export const GOAL = { y0: 68, y1: 112, depth: 10 }
export const MATCH_SECONDS = 90

// CPU strength per difficulty. Everything on the visitor's side stays the same.
//   cpu / cpuKeeper: run speeds    keeperReach: how far the CPU keeper can grab
//   steal: CPU tackle chance per second when next to the ball carrier
//   shotSpread: CPU shot inaccuracy (px)    think: seconds between CPU decisions
//   shootChance: odds the CPU shoots when in range    protect: seconds you're
//   safe from CPU tackles right after winning the ball
export const DIFFICULTIES = {
  rookie: { label: 'ROOKIE', hint: 'EASY', cpu: 46, cpuKeeper: 38, keeperReach: 7, steal: 0.45,
    shotSpread: 36, think: 0.75, shootChance: 0.3, protect: 1.0 },
  pro: { label: 'PRO', hint: 'NORMAL', cpu: 53, cpuKeeper: 49, keeperReach: 8, steal: 0.95,
    shotSpread: 25, think: 0.52, shootChance: 0.42, protect: 0.7 },
  legend: { label: 'LEGEND', hint: 'HARD', cpu: 64, cpuKeeper: 66, keeperReach: 12, steal: 2.2,
    shotSpread: 12, think: 0.35, shootChance: 0.55, protect: 0.3 },
}

const SPEED = { user: 72, mate: 56, gk: 60, slide: 120 }
const SHOT_POWER = 270
const FRICTION = 1.3 // velocity decays by e^(-FRICTION * t)
const REACH = 6
const BOUNCE_SOUND_SPEED = 40 // slower rebounds off the boards stay silent
const KEEPER_REACH = 11 // the visitor's keeper
const TACKLE_RANGE = 8
const STEAL_RATE = { mate: 1.1, user: 0.9 } // chance per second while in range
const L = FIELD.x1 - FIELD.x0
const Wd = FIELD.y1 - FIELD.y0

// Formation as fractions: fx = distance from own goal line, fy = across the pitch.
const FORMATION = [
  { role: 'gk', fx: 0.02, fy: 0.5 },
  { role: 'def', fx: 0.25, fy: 0.36 },
  { role: 'fwd', fx: 0.43, fy: 0.64 },
]
const KICKOFF_SLOT = 2

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const len = (x, y) => Math.hypot(x, y)
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
function norm(x, y) {
  const l = Math.hypot(x, y)
  return l > 0 ? { x: x / l, y: y / l } : { x: 0, y: 0 }
}

// Index of the player nearest the ball among those passing `ok`, or -1.
function nearest(s, ok) {
  let best = -1
  let bestD = Infinity
  s.players.forEach((p, i) => {
    if (!ok(p, i)) return
    const d = dist(p, s.ball)
    if (d < bestD) { best = i; bestD = d }
  })
  return { index: best, d: bestD }
}

const emit = (s, type, extra) => s.events.push({ type, ...extra })

const attackDir = (team) => (team === 0 ? 1 : -1)
const ownLineX = (team) => (team === 0 ? FIELD.x0 : FIELD.x1)
const targetLineX = (team) => (team === 0 ? FIELD.x1 : FIELD.x0)

function homeOf(p) {
  const f = FORMATION[p.slot]
  return {
    x: p.team === 0 ? FIELD.x0 + f.fx * L : FIELD.x1 - f.fx * L,
    y: FIELD.y0 + f.fy * Wd,
  }
}

export function createMatch(level = 'pro') {
  const players = []
  for (const team of [0, 1]) {
    FORMATION.forEach((f, slot) => {
      players.push({ team, slot, role: f.role, x: 0, y: 0, vx: 0, vy: 0, face: { x: attackDir(team), y: 0 },
        cooldown: 0, slide: 0, think: 0, hold: 0, run: 0 })
    })
  }
  // events: things that happened this step (kicks, goals, whistles) for the UI to react to, e.g. with sound.
  const s = { players, ball: null, score: [0, 0], time: 0, phase: 'kickoff', timer: 0, events: [],
    controlled: KICKOFF_SLOT, switchLock: 0, kickoffTeam: 0, lastGoal: null,
    level, cfg: DIFFICULTIES[level] || DIFFICULTIES.pro }
  kickOff(s, 0)
  return s
}

function kickOff(s, team) {
  for (const p of s.players) {
    Object.assign(p, homeOf(p), { vx: 0, vy: 0, cooldown: 0, slide: 0, think: 0.5, hold: 0, protect: 0 })
    p.face = { x: attackDir(p.team), y: 0 }
  }
  const taker = s.players.find((p) => p.team === team && p.slot === KICKOFF_SLOT)
  taker.x = W / 2 - attackDir(team) * 6
  taker.y = H / 2
  s.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, owner: s.players.indexOf(taker) }
  if (team === 0) s.controlled = s.ball.owner
  s.phase = 'kickoff'
  s.timer = 1.2
  s.kickoffTeam = team
}

// input: { x, y } movement in [-1, 1], plus one-shot { shoot, pass } flags.
export function step(s, dt, input) {
  s.timer -= dt
  if (s.phase === 'fulltime') return
  if (s.phase === 'goal') {
    moveBall(s, dt)
    if (s.timer <= 0) kickOff(s, s.kickoffTeam)
    return
  }
  if (s.phase === 'kickoff') {
    if (s.timer > 0) return
    s.phase = 'play'
    emit(s, 'kickoff')
  }

  s.time += dt
  if (s.time >= MATCH_SECONDS) {
    s.time = MATCH_SECONDS
    s.phase = 'fulltime'
    emit(s, 'fulltime')
    return
  }

  s.switchLock -= dt
  for (const p of s.players) {
    p.cooldown = Math.max(0, p.cooldown - dt)
    p.slide = Math.max(0, p.slide - dt)
    p.think -= dt
    p.hold -= dt
    p.protect -= dt
  }

  pickControlled(s)
  s.players.forEach((p, i) => {
    if (i === s.controlled) userControl(s, p, i, input)
    else if (p.role === 'gk') keeper(s, p, i)
    else outfield(s, p, i)
  })

  for (const p of s.players) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    if (len(p.vx, p.vy) > 4) {
      p.run += dt
      if (p.slide <= 0) p.face = norm(p.vx, p.vy)
    }
  }
  separate(s)
  for (const p of s.players) {
    p.x = clamp(p.x, FIELD.x0 + 1, FIELD.x1 - 1)
    p.y = clamp(p.y, FIELD.y0 + 2, FIELD.y1 - 1)
  }

  if (s.ball.owner != null) carryBall(s)
  else {
    moveBall(s, dt)
    pickUp(s)
  }
  tackles(s, dt)
  checkGoal(s)
}

// ---------- control ----------

function pickControlled(s) {
  const b = s.ball
  const owner = b.owner != null ? s.players[b.owner] : null
  if (owner && owner.team === 0) {
    if (owner.role !== 'gk') s.controlled = b.owner
    return
  }
  if (s.switchLock > 0 || s.players[s.controlled].slide > 0) return
  // Hysteresis: the current player keeps control unless another is clearly closer.
  const other = nearest(s, (p, i) => p.team === 0 && p.role !== 'gk' && i !== s.controlled)
  if (other.index >= 0 && other.d < dist(s.players[s.controlled], b) - 12) s.controlled = other.index
}

function userControl(s, p, i, input) {
  const mv = len(input.x, input.y) > 1 ? norm(input.x, input.y) : { x: input.x, y: input.y }
  const hasBall = s.ball.owner === i

  if (p.slide > 0) {
    p.vx = p.face.x * SPEED.slide
    p.vy = p.face.y * SPEED.slide
  } else {
    p.vx = mv.x * SPEED.user
    p.vy = mv.y * SPEED.user
  }

  if (input.shoot) {
    if (hasBall) shoot(s, p, mv.y)
    else if (p.slide <= 0 && p.cooldown <= 0) {
      if (len(mv.x, mv.y) > 0.1) p.face = norm(mv.x, mv.y)
      p.slide = 0.28
      p.cooldown = 0.5
      emit(s, 'slide')
    }
  }
  if (input.pass) {
    if (hasBall) pass(s, p, i)
    else switchPlayer(s)
  }

  // A sliding tackle wins the ball outright.
  const owner = s.ball.owner != null ? s.players[s.ball.owner] : null
  if (p.slide > 0 && owner && owner.team !== 0 && dist(p, owner) < TACKLE_RANGE + 4) {
    if (owner.role === 'gk') return
    owner.cooldown = 0.6
    gainBall(s, i)
    emit(s, 'tackle')
  }
}

function switchPlayer(s) {
  const { index } = nearest(s, (p, i) => p.team === 0 && p.role !== 'gk' && i !== s.controlled)
  if (index >= 0) {
    s.controlled = index
    s.switchLock = 0.6
  }
}

// ---------- AI ----------

function seek(p, tx, ty, speed) {
  const dx = tx - p.x
  const dy = ty - p.y
  const d = len(dx, dy)
  if (d < 2) { p.vx = 0; p.vy = 0; return }
  const k = (speed * Math.min(1, d / 10)) / d
  p.vx = dx * k
  p.vy = dy * k
}

function chaserOf(s, team) {
  if (team === 0) return s.controlled
  return nearest(s, (p) => p.team === team && p.role !== 'gk').index
}

function outfield(s, p, i) {
  const b = s.ball
  const owner = b.owner != null ? s.players[b.owner] : null
  const speed = p.team === 0 ? SPEED.mate : s.cfg.cpu

  if (b.owner === i) return dribble(s, p, i)

  const ownBall = owner && owner.team === p.team
  if (!ownBall && chaserOf(s, p.team) === i) {
    return seek(p, b.x + b.vx * 0.15, b.y + b.vy * 0.15, speed)
  }

  // Hold shape, drifting toward the ball and pushing up when in possession.
  const home = homeOf(p)
  const tx = home.x + (b.x - W / 2) * 0.55 + (ownBall ? attackDir(p.team) * 34 : 0)
  const ty = home.y * 0.7 + b.y * 0.3
  seek(p, clamp(tx, FIELD.x0 + 10, FIELD.x1 - 10), ty, speed * 0.85)
}

// CPU (and the visitor's teammates if they ever end up on the ball).
function dribble(s, p, i) {
  const goalX = targetLineX(p.team)
  const toGoal = Math.abs(goalX - p.x)
  const pressured = s.players.some((q) => q.team !== p.team && dist(p, q) < 16)

  if (p.think <= 0) {
    p.think = p.team === 1 ? s.cfg.think : 0.35
    if (toGoal < 100 && Math.random() < s.cfg.shootChance) return shoot(s, p, (Math.random() - 0.5) * 1.6)
    if (pressured && Math.random() < 0.45) return pass(s, p, i)
  }
  const weave = Math.sin(s.time * 1.8 + p.slot) * 30
  seek(p, goalX, H / 2 + weave, (p.team === 0 ? SPEED.mate : s.cfg.cpu) * 0.92)
}

function keeper(s, p, i) {
  const b = s.ball
  if (b.owner === i) {
    p.vx = 0
    p.vy = 0
    if (p.hold <= 0) pass(s, p, i)
    return
  }
  const lineX = ownLineX(p.team) + attackDir(p.team) * 6
  const danger = Math.abs(b.x - ownLineX(p.team)) < 70
  const tx = lineX + (danger ? attackDir(p.team) * 8 : 0)
  seek(p, tx, clamp(b.y, GOAL.y0 + 2, GOAL.y1 - 2), p.team === 0 ? SPEED.gk : s.cfg.cpuKeeper)
}

// Push overlapping players apart so they don't stack on one spot.
function separate(s) {
  const ps = s.players
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i]
      const b = ps[j]
      const d = dist(a, b)
      if (d >= 6 || d === 0) continue
      const push = (6 - d) / 2
      const n = norm(a.x - b.x, a.y - b.y)
      a.x += n.x * push
      a.y += n.y * push
      b.x -= n.x * push
      b.y -= n.y * push
    }
  }
}

// ---------- ball ----------

function kick(s, p, dir, power) {
  const b = s.ball
  b.owner = null
  b.x = p.x + dir.x * 6
  b.y = p.y + dir.y * 6
  b.vx = dir.x * power
  b.vy = dir.y * power
  p.cooldown = 0.35
}

// aim in [-1, 1] picks a spot across the goal mouth.
function shoot(s, p, aim) {
  const gx = targetLineX(p.team)
  const half = (GOAL.y1 - GOAL.y0) / 2
  const spread = p.team === 1 ? s.cfg.shotSpread : 12
  const gy = H / 2 + clamp(aim, -1, 1) * (half - 4) + (Math.random() - 0.5) * spread
  kick(s, p, norm(gx - p.x, gy - p.y), SHOT_POWER)
  emit(s, 'shot')
}

function pass(s, p, i) {
  // Prefer a teammate ahead of the passer and in the direction they're facing.
  let best = null
  let bestScore = -Infinity
  s.players.forEach((q, j) => {
    if (q.team !== p.team || j === i || q.role === 'gk') return
    const d = norm(q.x - p.x, q.y - p.y)
    const progress = (q.x - p.x) * attackDir(p.team)
    const marked = s.players.some((o) => o.team !== p.team && dist(o, q) < 14)
    const score = (d.x * p.face.x + d.y * p.face.y) * 40 + progress * 0.3 - (marked ? 25 : 0)
    if (score > bestScore) { bestScore = score; best = q }
  })
  if (!best) return shoot(s, p, 0)
  const tx = best.x + best.vx * 0.3
  const ty = best.y + best.vy * 0.3
  const d = len(tx - p.x, ty - p.y)
  kick(s, p, norm(tx - p.x, ty - p.y), Math.min(280, FRICTION * d + 60))
  emit(s, 'pass')
}

function carryBall(s) {
  const b = s.ball
  const p = s.players[b.owner]
  // A keeper holds the ball on the pitch side, never toward their own net.
  const fx = p.role === 'gk' ? attackDir(p.team) : p.face.x
  b.x = p.x + fx * 5
  b.y = clamp(p.y + p.face.y * 3, FIELD.y0 + 1, FIELD.y1 - 1)
  // Outside the goal mouth the ball can't be carried past the end lines.
  if (b.y <= GOAL.y0 || b.y >= GOAL.y1) b.x = clamp(b.x, FIELD.x0, FIELD.x1)
  b.vx = p.vx
  b.vy = p.vy
}

function moveBall(s, dt) {
  const b = s.ball
  b.x += b.vx * dt
  b.y += b.vy * dt
  const f = Math.exp(-FRICTION * dt * (s.phase === 'goal' ? 3 : 1))
  b.vx *= f
  b.vy *= f

  if (s.phase === 'goal') {
    // Stay inside the net.
    b.x = clamp(b.x, FIELD.x0 - GOAL.depth + 2, FIELD.x1 + GOAL.depth - 2)
    b.y = clamp(b.y, GOAL.y0 + 2, GOAL.y1 - 2)
    return
  }
  if (b.y < FIELD.y0 + 1 || b.y > FIELD.y1 - 1) {
    b.y = clamp(b.y, FIELD.y0 + 1, FIELD.y1 - 1)
    if (Math.abs(b.vy) > BOUNCE_SOUND_SPEED) emit(s, 'bounce')
    b.vy *= -0.6
  }
  const inMouth = b.y > GOAL.y0 && b.y < GOAL.y1
  if (!inMouth && (b.x < FIELD.x0 || b.x > FIELD.x1)) {
    b.x = clamp(b.x, FIELD.x0, FIELD.x1)
    if (Math.abs(b.vx) > BOUNCE_SOUND_SPEED) emit(s, 'bounce')
    b.vx *= -0.6
  }
}

function pickUp(s) {
  const b = s.ball
  const speed = len(b.vx, b.vy)
  const { index: best } = nearest(s, (p) => {
    if (p.cooldown > 0) return false
    const isKeeper = p.role === 'gk' && Math.abs(p.x - ownLineX(p.team)) < 40
    if (!isKeeper && speed > 210) return false
    const keeperReach = p.team === 0 ? KEEPER_REACH : s.cfg.keeperReach
    return dist(p, b) < (isKeeper ? keeperReach : REACH)
  })
  if (best >= 0) gainBall(s, best)
}

// Every change of possession goes through here.
function gainBall(s, i) {
  const p = s.players[i]
  s.ball.owner = i
  p.think = 0.4
  if (p.role === 'gk') p.hold = 0.7
  // Brief immunity from tackles: generous for the visitor, short for the CPU
  // so the ball doesn't ping-pong between two players every frame.
  p.protect = p.team === 0 ? s.cfg.protect : 0.25
}

function tackles(s, dt) {
  const b = s.ball
  if (b.owner == null) return
  const ownerIndex = b.owner
  const owner = s.players[ownerIndex]
  if (owner.role === 'gk' || owner.protect > 0) return
  s.players.forEach((q, j) => {
    if (b.owner !== ownerIndex) return // already stolen this frame
    if (q.team === owner.team || q.role === 'gk' || q.cooldown > 0) return
    if (dist(q, owner) > TACKLE_RANGE) return
    const rate = q.team === 1 ? s.cfg.steal : j === s.controlled ? STEAL_RATE.user : STEAL_RATE.mate
    if (Math.random() < rate * dt) {
      owner.cooldown = 0.6
      gainBall(s, j)
      emit(s, 'tackle')
    }
  })
}

function checkGoal(s) {
  const b = s.ball
  if (b.y <= GOAL.y0 || b.y >= GOAL.y1) return
  let scorer = null
  if (b.x > FIELD.x1 + 1) scorer = 0
  else if (b.x < FIELD.x0 - 1) scorer = 1
  if (scorer == null) return
  s.score[scorer]++
  s.lastGoal = scorer
  emit(s, 'goal', { team: scorer })
  s.phase = 'goal'
  s.timer = 2
  s.kickoffTeam = 1 - scorer
  if (b.owner != null) {
    b.vx = attackDir(scorer) * 60
    b.vy = 0
    b.owner = null
  }
}
