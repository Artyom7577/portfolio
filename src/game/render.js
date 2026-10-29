import { W, H, FIELD, GOAL } from './engine'
import { MINI_FRAMES, MINI_W, MINI_H, PALETTE as C } from './pixels'

const GRASS = ['#1F7B31', '#2A943D']
const LINE = 'rgba(248,248,248,0.85)'

const KITS = [
  { kit: C.red, kit2: C.white, shorts: C.white }, // visitor
  { kit: C.sky, kit2: C.navy, shorts: C.navy }, // CPU
]
const KEEPER_KITS = [
  { kit: C.gold, kit2: C.navy, shorts: C.navy },
  { kit: C.charcoal, kit2: C.gold, shorts: C.charcoal },
]
const SKINS = ['#E0AC69', '#C68642', '#8D5524', '#F1C27D']

// Pre-render each kit/skin/frame combination to a tiny canvas once.
const spriteCache = new Map()
function sprite(colors, frame) {
  const key = `${colors.kit}${colors.kit2}${colors.skin}${frame}`
  let c = spriteCache.get(key)
  if (c) return c
  c = document.createElement('canvas')
  c.width = MINI_W
  c.height = MINI_H
  const g = c.getContext('2d')
  const palette = { hair: C.hair, dark: C.dark, boot: C.boot, ...colors }
  for (const [x, y, w, h, k] of MINI_FRAMES[frame]) {
    g.fillStyle = palette[k]
    g.fillRect(x, y, w, h)
  }
  spriteCache.set(key, c)
  return c
}

const rect = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), w, h)
}

function pixelCircle(ctx, cx, cy, r) {
  ctx.fillStyle = LINE
  for (let a = 0; a < 360; a += 2) {
    const t = (a * Math.PI) / 180
    ctx.fillRect(Math.round(cx + r * Math.cos(t)), Math.round(cy + r * Math.sin(t)), 1, 1)
  }
}

function drawGoal(ctx, lineX, side) {
  const x = side < 0 ? lineX - GOAL.depth : lineX + 1
  const h = GOAL.y1 - GOAL.y0
  rect(ctx, x, GOAL.y0, GOAL.depth, h, 'rgba(10,10,46,0.35)')
  for (let y = GOAL.y0 + 2; y < GOAL.y1; y += 3) rect(ctx, x, y, GOAL.depth, 1, 'rgba(248,248,248,0.3)')
  for (let i = 2; i < GOAL.depth; i += 3) rect(ctx, x + i, GOAL.y0, 1, h, 'rgba(248,248,248,0.3)')
  rect(ctx, x, GOAL.y0 - 1, GOAL.depth + 1, 2, C.white)
  rect(ctx, x, GOAL.y1, GOAL.depth + 1, 2, C.white)
}

function drawPitch(ctx) {
  for (let x = 0; x < W; x += 20) rect(ctx, x, 0, 20, H, GRASS[(x / 20) % 2])

  const { x0, x1, y0, y1 } = FIELD
  rect(ctx, x0, y0, x1 - x0 + 1, 1, LINE)
  rect(ctx, x0, y1, x1 - x0 + 1, 1, LINE)
  rect(ctx, x0, y0, 1, y1 - y0, LINE)
  rect(ctx, x1, y0, 1, y1 - y0, LINE)
  rect(ctx, W / 2, y0, 1, y1 - y0, LINE)
  pixelCircle(ctx, W / 2, H / 2, 22)
  rect(ctx, W / 2 - 1, H / 2 - 1, 3, 3, LINE)

  // Penalty boxes and spots.
  const boxW = 40
  const boxY0 = H / 2 - 40
  const boxY1 = H / 2 + 40
  for (const [lineX, dir] of [[x0, 1], [x1, -1]]) {
    const inner = lineX + dir * boxW
    rect(ctx, Math.min(lineX, inner), boxY0, boxW, 1, LINE)
    rect(ctx, Math.min(lineX, inner), boxY1, boxW, 1, LINE)
    rect(ctx, inner, boxY0, 1, boxY1 - boxY0, LINE)
    rect(ctx, lineX + dir * 28, H / 2, 1, 1, LINE)
  }
  drawGoal(ctx, x0, -1)
  drawGoal(ctx, x1, 1)
}

function drawPlayer(ctx, p, index, s) {
  const kit = p.role === 'gk' ? KEEPER_KITS[p.team] : KITS[p.team]
  const colors = { ...kit, skin: SKINS[(index * 3 + p.team) % SKINS.length] }
  const moving = Math.hypot(p.vx, p.vy) > 4
  const frame = moving ? Math.floor(p.run * 8) % 2 : 0
  const x = Math.round(p.x - MINI_W / 2)
  const y = Math.round(p.y - MINI_H + 1)

  rect(ctx, x + 1, p.y, 5, 1, 'rgba(0,0,0,0.3)') // shadow
  if (p.slide > 0) {
    // Sliding: draw the sprite lying on its side.
    ctx.save()
    ctx.translate(Math.round(p.x), Math.round(p.y - 3))
    ctx.rotate((p.face.x >= 0 ? -1 : 1) * Math.PI / 2)
    ctx.drawImage(sprite(colors, 1), -MINI_W / 2, -MINI_H / 2)
    ctx.restore()
  } else {
    ctx.drawImage(sprite(colors, frame), x, y)
  }

  if (index === s.controlled && s.phase !== 'fulltime') {
    // Pointer above the visitor's active player.
    const cx = Math.round(p.x)
    const top = y - 6
    rect(ctx, cx - 2, top, 5, 1, C.gold)
    rect(ctx, cx - 1, top + 1, 3, 1, C.gold)
    rect(ctx, cx, top + 2, 1, 1, C.gold)
  }
}

function drawBall(ctx, b) {
  const x = Math.round(b.x - 2)
  const y = Math.round(b.y - 2)
  rect(ctx, x + 1, y + 4, 4, 1, 'rgba(0,0,0,0.35)')
  rect(ctx, x + 1, y, 2, 1, C.white)
  rect(ctx, x, y + 1, 4, 2, C.white)
  rect(ctx, x + 1, y + 3, 2, 1, C.white)
  rect(ctx, x + 1, y + 1, 1, 1, C.dark)
  rect(ctx, x + 2, y + 2, 1, 1, C.dark)
}

// The pitch never changes, so it's painted once and blitted every frame.
let pitch = null
function pitchImage() {
  if (!pitch) {
    pitch = document.createElement('canvas')
    pitch.width = W
    pitch.height = H
    drawPitch(pitch.getContext('2d'))
  }
  return pitch
}

export function draw(ctx, s) {
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(pitchImage(), 0, 0)
  // Draw back-to-front so lower players overlap higher ones.
  const order = s.players.map((p, i) => i).sort((a, b) => s.players[a].y - s.players[b].y)
  let ballDrawn = false
  for (const i of order) {
    const p = s.players[i]
    if (!ballDrawn && s.ball.y < p.y) { drawBall(ctx, s.ball); ballDrawn = true }
    drawPlayer(ctx, p, i, s)
  }
  if (!ballDrawn) drawBall(ctx, s.ball)
}
