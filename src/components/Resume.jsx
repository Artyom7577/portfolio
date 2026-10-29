import { profile, career, squad, bench, highlights, education, certificates } from '../content/portfolio'
import { Sprite } from './Sprites'

function SectionHead({ title, sub }) {
  return (
    <div className="sechead">
      <h2 className="px">{title}</h2>
      <span className="px">{sub}</span>
    </div>
  )
}

function Player({ p }) {
  const style = { '--kit': p.kit, '--kit2': p.kit2, '--skin': p.skin, '--shorts': p.shorts }
  return (
    <button className="player" style={style} type="button">
      <Sprite id="pl" className="sprite" />
      <b>{p.name}</b>
      <i>{p.position}</i>
      <span className="statcard" role="tooltip">
        <span className="cardname px">{p.name}</span>
        {p.note}
      </span>
    </button>
  )
}

export default function Resume({ onPlay }) {
  const ext = { target: '_blank', rel: 'noopener noreferrer' }
  return (
    <div className="pro" id="top">
      <nav className="scoreboard">
        <span className="px who">{profile.short}</span>
        <a className="px" href="#career">CAREER</a>
        <a className="px" href="#squad">SQUAD</a>
        <a className="px" href="#highlights">HIGHLIGHTS</a>
        <a className="px" href="#academy">ACADEMY</a>
        <a className="px" href="#trophies">TROPHIES</a>
        <a className="px" href="#contact">CONTACT</a>
        <button className="coin px" onClick={onPlay}>● INSERT COIN</button>
      </nav>

      <main className="promain">
        <section className="intro">
          <h2>{profile.headline}</h2>
          <p>{profile.summary}</p>
          <div className="tags">
            {profile.tags.map((t, i) => (
              <span key={t} className={`tag${i % 2 ? ' alt' : ''}`}>{t}</span>
            ))}
          </div>
        </section>

        <section id="career">
          <SectionHead title="CAREER MODE" sub="FIXTURES & RESULTS" />
          {career.map((job) => (
            <article className="card fixture" key={job.club + job.dates}>
              <header>
                <span className="px club">{job.club}</span>
                <span className="px date">{job.dates}</span>
              </header>
              <div className="cardbody">
                <p className="role">{job.role}</p>
                <p className="loc">{job.location}</p>
                <ul>{job.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
              </div>
            </article>
          ))}
        </section>

        <section id="squad">
          <SectionHead title="SQUAD SELECT" sub="FORMATION: 4-3-3" />
          <div className="pitch">
            {squad.map((row, i) => (
              <div key={row.line}>
                <p className="rowlabel">{row.line}</p>
                <div className={`pitchrow${i === 0 ? ' toprow' : ''}`}>
                  {row.players.map((p) => <Player key={p.name} p={p} />)}
                </div>
              </div>
            ))}
          </div>
          <p className="formhint">Hover or tap a player to see the scouting report.</p>
          <p className="benchnote"><strong>On the bench:</strong> {bench.join(', ')}.</p>
        </section>

        <section id="highlights">
          <SectionHead title="HIGHLIGHTS" sub="MATCH OF THE DAY" />
          {highlights.map((h) => (
            <article className="card matchcard" key={h.name}>
              <header>
                <span className="px club">{h.name}</span>
                <span className="px date">{h.tagline}</span>
              </header>
              <div className="cardbody">
                <div className="statline">
                  {h.stats.map((s) => (
                    <div className="stat" key={s.label}>
                      <b>{s.value}</b>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
                <ul>{h.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                <div className="chips">{h.stack.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
                <div className="btnrow">
                  {h.live && <a className="btn primary" href={h.live} {...ext}>WATCH LIVE »</a>}
                  {h.repo && <a className="btn" href={h.repo} {...ext}>GITHUB</a>}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section id="academy">
          <SectionHead title="ACADEMY" sub="YOUTH DEVELOPMENT" />
          {education.map((e) => (
            <div className="edu" key={e.degree}>
              <b>{e.school}</b> <span className="edudate">{e.dates}</span>
              <br />
              {e.degree}
              {e.extras && (
                <>
                  <br />
                  {e.extras}
                </>
              )}
            </div>
          ))}
        </section>

        <section id="trophies">
          <SectionHead title="TROPHY CABINET" sub="CERTIFICATES" />
          <div className="trophies">
            {certificates.map((c) => {
              const body = (
                <>
                  <span className="px cup">{c.status ? '⚽' : '🏆'}</span>
                  <b>{c.name}</b>
                  <span>{c.issuer} • {c.date}</span>
                  {c.skills && <span>{c.skills}</span>}
                  <span className="px verify">{c.status ?? 'VERIFY »'}</span>
                </>
              )
              if (c.url) {
                return <a className="trophy" href={c.url} key={c.name} {...ext}>{body}</a>
              }
              return <div className="trophy pending" key={c.name}>{body}</div>
            })}
          </div>
        </section>

        <section id="contact">
          <SectionHead title="FRIENDLIES" sub="ARRANGE A MATCH" />
          <div className="btnrow">
            <a className="btn primary" href={`mailto:${profile.email}`}>EMAIL ME</a>
            <a className="btn" href={profile.gitlab} {...ext}>GITLAB</a>
            <a className="btn" href={profile.linkedin} {...ext}>LINKEDIN</a>
            <a className="btn" href={profile.leetcode} {...ext}>LEETCODE</a>
            <a className="btn" href={profile.github} {...ext}>GITHUB</a>
            {profile.resumePdf && <a className="btn" href={profile.resumePdf} download>MATCH PROGRAM (PDF)</a>}
          </div>
        </section>
      </main>

      <footer className="sitefooter px">
        {profile.firstName} {profile.lastName}
        <br />
        PIXELS HAND-PLACED • 16-BIT FOOTBALL FOREVER
      </footer>
    </div>
  )
}
