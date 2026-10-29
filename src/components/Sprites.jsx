import { PLAYER, BALL, PALETTE } from '../game/pixels'

// Colors for the SVG symbols. Player colors come from CSS variables so each
// <Player> on the resume pitch can wear its own kit.
const SVG_COLORS = {
  hair: `var(--hair,${PALETTE.hair})`,
  skin: 'var(--skin,#E0AC69)',
  kit: `var(--kit,${PALETTE.red})`,
  kit2: `var(--kit2,${PALETTE.white})`,
  shorts: `var(--shorts,${PALETTE.white})`,
  dark: PALETTE.dark,
  boot: PALETTE.boot,
  white: PALETTE.white,
}

const rects = (pixels) =>
  pixels.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={SVG_COLORS[c]} />)

// Rendered once near the root; <Sprite> references these symbols by id.
export function SpriteDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="pl" viewBox="0 0 12 18" shapeRendering="crispEdges">{rects(PLAYER)}</symbol>
        <symbol id="ball" viewBox="0 0 10 10" shapeRendering="crispEdges">{rects(BALL)}</symbol>
      </defs>
    </svg>
  )
}

export function Sprite({ id, className }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}
