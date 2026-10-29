// Colors shared by the resume sprites, the match renderer and the content kits.
// The CSS tokens in styles/site.css use the same values.
export const PALETTE = {
  red: '#D82800', gold: '#F8D800', sky: '#58B8F8', navy: '#101040', white: '#F8F8F8',
  charcoal: '#3C3C46', dark: '#1A1A2E', boot: '#141414', hair: '#3B2412',
}

// Pixel maps shared by the SVG sprites (resume page) and the canvas (match).
// Each entry is [x, y, w, h, colorKey]; colorKey is resolved by whoever draws it.

// 12x18 footballer used on the Squad Select pitch.
export const PLAYER = [
  [4, 0, 4, 1, 'hair'], [3, 1, 6, 1, 'hair'],
  [3, 2, 6, 3, 'skin'], [3, 2, 1, 1, 'hair'],
  [4, 3, 1, 1, 'dark'], [7, 3, 1, 1, 'dark'],
  [5, 5, 2, 1, 'skin'],
  [2, 6, 8, 5, 'kit'], [5, 6, 2, 5, 'kit2'],
  [1, 6, 1, 3, 'kit'], [10, 6, 1, 3, 'kit'],
  [1, 9, 1, 1, 'skin'], [10, 9, 1, 1, 'skin'],
  [2, 11, 8, 2, 'shorts'],
  [3, 13, 2, 2, 'skin'], [7, 13, 2, 2, 'skin'],
  [3, 15, 2, 2, 'kit2'], [7, 15, 2, 2, 'kit2'],
  [2, 17, 3, 1, 'boot'], [7, 17, 3, 1, 'boot'],
]

// 10x10 ball used in the title screen and menus.
export const BALL = [
  [3, 0, 4, 1, 'dark'], [1, 1, 8, 8, 'white'],
  [0, 3, 1, 4, 'dark'], [9, 3, 1, 4, 'dark'], [3, 9, 4, 1, 'dark'],
  [1, 1, 2, 2, 'dark'], [7, 1, 2, 2, 'dark'],
  [1, 7, 2, 2, 'dark'], [7, 7, 2, 2, 'dark'], [4, 4, 2, 2, 'dark'],
]

// 7x11 in-match footballer, two running frames.
const MINI_BODY = [
  [1, 0, 5, 1, 'hair'],
  [1, 1, 5, 2, 'skin'], [2, 2, 1, 1, 'dark'], [4, 2, 1, 1, 'dark'],
  [0, 3, 7, 4, 'kit'], [3, 3, 1, 4, 'kit2'],
  [0, 6, 1, 1, 'skin'], [6, 6, 1, 1, 'skin'],
  [1, 7, 5, 1, 'shorts'],
]
export const MINI_FRAMES = [
  [...MINI_BODY,
    [1, 8, 2, 1, 'skin'], [4, 8, 2, 1, 'skin'],
    [1, 9, 2, 1, 'kit2'], [4, 9, 2, 1, 'kit2'],
    [1, 10, 2, 1, 'boot'], [4, 10, 2, 1, 'boot']],
  [...MINI_BODY,
    [0, 8, 2, 1, 'skin'], [5, 8, 2, 1, 'skin'],
    [0, 9, 2, 1, 'kit2'], [5, 9, 2, 1, 'kit2'],
    [0, 10, 2, 1, 'boot'], [5, 10, 2, 1, 'boot']],
]
export const MINI_W = 7
export const MINI_H = 11
