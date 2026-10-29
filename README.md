# Hayrapetyan FC — a 16-bit football portfolio

The personal portfolio of **Artyom Hayrapetyan**, a backend software engineer working with Java, distributed
systems and high-volume data platforms. It's styled as a retro football game: you can play a short match against
**Bug City** or skip straight to the résumé.

## What's inside

| Screen | What it shows |
|---|---|
| **Title screen** | Press start, then pick a mode: Kick Off, Career Mode, Squad Select, Highlights or Friendlies |
| **Kick Off** | A playable pixel-art match on three difficulties: Rookie (easy), Pro (normal) and Legend (hard) |
| **Career Mode** | Work experience: Polixis, Picsart Academy, European University of Armenia, UpWork |
| **Squad Select** | Skills arranged as a 4-3-3 team; hover or tap a player for the scouting report |
| **Highlights** | Featured projects, each with stats, tech stack and repo links |
| **Academy** | Education: Yerevan State University (Master's and Bachelor's), Picsart Academy |
| **Trophy Cabinet** | Certificates with verification links, plus certifications in progress |
| **Friendlies** | Contact links: email, GitHub, GitLab, LinkedIn, LeetCode and a downloadable CV |

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | Arrow keys or WASD | Joystick |
| Shoot / tackle | X, Space or J | A button |
| Pass / switch player | Z or K | B button |
| Leave the match | Esc | — |

Links you can share: `/#play` opens the match directly, and any section anchor (`/#career`, `/#highlights`,
`/#trophies`, …) opens the résumé at that section.

## Tech

React 18 and Vite 6, with no other runtime dependencies. The game engine, renderer and pixel sprites are written by
hand in plain JavaScript (`src/game/`).

## Run it locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build
```

`dist/` is a static site and can be hosted anywhere: GitHub Pages, Netlify, Vercel, Cloudflare Pages or S3.

## Editing the content

All text lives in **`src/content/portfolio.js`**. You never need to touch the components to update the site:

- `profile`: name, headline, summary, tags and contact links. `resumePdf` points to `public/resume.pdf`; set it
  to `''` to hide the download button.
- `career`: jobs, newest first.
- `squad` / `bench`: the 4-3-3 skills formation and the extra tools listed on the bench.
- `highlights`: project cards. `repo` and `live` are optional; when one is missing, its button is hidden.
- `education`: a list of schools; `extras` is optional.
- `certificates`: each one needs a `url` to its verification page. An entry with a `status`
  (for example `'IN TRAINING'`) and no `url` is shown as in progress.
- `match`: team names and the result messages shown after the final whistle.

## Project structure

```
src/
├── content/portfolio.js   # all portfolio text
├── components/            # title screen, résumé page, sprites
├── game/                  # match engine, renderer, pixel art
└── styles/                # site and match styles
public/                    # favicon and resume.pdf
```

## Contact

- Email: artyom.hayrapetyan0001@gmail.com
- LinkedIn: [artyom-hayrapetyan](https://www.linkedin.com/in/artyom-hayrapetyan/)
- GitHub: [Artyom7577](https://github.com/Artyom7577)
- GitLab: [artyom.hayrapetyan](https://gitlab.com/artyom.hayrapetyan)
- LeetCode: [artyomhayrapetyan1](https://leetcode.com/u/artyomhayrapetyan1/)
