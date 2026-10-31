'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { COMMANDS, resolve, complete, age } from './lib';
import { me, projects, experience, skills, languages, hobbies, links } from './content';

const BANNER = String.raw`
 _____   ___   _   _   _       _____  __   __
|  ___| |_ _| | \ | | | |     | ____| \ \ / /
| |_     | |  |  \| | | |     |  _|    \ V /
|  _|    | |  | |\  | | |___  | |___    | |
|_|     |___| |_| \_| |_____| |_____|   |_|
`;

const PC = String.raw`
 .--------.
 | >_     |
 |        |
 '--------'
  _|____|_
 [________]
`;

// One shared request, so repeated `projecten` calls don't hit GitHub's 60/hour anonymous limit.
let reposPromise;
const getRepos = () =>
  (reposPromise ??= fetch(`https://api.github.com/users/${me.github}/repos?sort=updated&per_page=10`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((repos) => repos.filter((r) => !r.fork)));

function Repos() {
  const [repos, setRepos] = useState(null);
  useEffect(() => {
    getRepos().then(setRepos, () => {
      reposPromise = undefined; // allow a retry next time
      setRepos('error');
    });
  }, []);
  const gh = <a href={`https://github.com/${me.github}`} target="_blank" rel="noreferrer">github.com/{me.github}</a>;
  if (repos === null) return <p className="dim">repos ophalen...</p>;
  if (repos === 'error') return <p className="err">Kon GitHub niet bereiken. Kijk op {gh}</p>;
  if (!repos.length) return <p className="dim">Nog geen publieke repos. Volg {gh}</p>;
  return (
    <ul>
      {repos.map((r) => (
        <li key={r.id}>
          ▸ <a href={r.html_url} target="_blank" rel="noreferrer">{r.name}</a>
          {r.language && <span className="dim"> [{r.language}]</span>}
          {r.description && <> - {r.description}</>}
        </li>
      ))}
    </ul>
  );
}

const bar = (n) => (
  <span className="hi" role="img" aria-label={`${n} van 10`}>
    {'█'.repeat(n) + '░'.repeat(10 - n)}
  </span>
);

const OUTPUT = {
  help: (C) => (
    <>
      <p>Beschikbare commando&apos;s:</p>
      <div className="grid">
        {COMMANDS.map(([n, d]) => (
          <Fragment key={n}>{C(n)}<span className="dim">{d}</span></Fragment>
        ))}
      </div>
      <p className="dim">Tip: Tab vult aan, ↑/↓ bladert door je geschiedenis.</p>
    </>
  ),
  over: (C) => (
    <>
      <h2>{me.name}</h2>
      <p className="dim">{age(me.birth)} jaar · {me.location}</p>
      {me.bio.map((p) => <p key={p}>{p}</p>)}
      <p className="dim">Meer weten? Probeer {C('ervaring')} of {C('skills')}.</p>
    </>
  ),
  projecten: () => (
    <>
      <h2>Projecten</h2>
      {projects.length > 0 && (
        <ul>
          {projects.map((p) => (
            <li key={p.name}>
              ▸ <a href={p.link} target="_blank" rel="noreferrer">{p.name}</a>
              {p.tech && <span className="dim"> [{p.tech}]</span>} - {p.desc}
            </li>
          ))}
        </ul>
      )}
      <p className="dim">Recent op GitHub:</p>
      <Repos />
    </>
  ),
  ervaring: () => (
    <>
      <h2>Opleiding &amp; werk</h2>
      <ul>
        {experience.map((e) => (
          <li key={e.role}>
            ▸ <span className="hi">{e.role}</span>
            {e.place && <> @ {e.place}</>} <span className="dim">({e.when})</span>
          </li>
        ))}
      </ul>
    </>
  ),
  skills: () => (
    <>
      <h2>Skills</h2>
      <div className="grid">
        {skills.map(([n, l]) => <Fragment key={n}><span>{n}</span>{bar(l)}</Fragment>)}
      </div>
      <h2>Talen</h2>
      <div className="grid">
        {languages.map(([n, l]) => <Fragment key={n}><span>{n}</span><span className="dim">{l}</span></Fragment>)}
      </div>
    </>
  ),
  hobbies: () => (
    <>
      <h2>Hobbies &amp; fun facts</h2>
      <ul>{hobbies.map((h) => <li key={h}>▸ {h}</li>)}</ul>
    </>
  ),
  contact: () => (
    <>
      <h2>Contact</h2>
      <div className="grid">
        {links.map(([label, text, href]) => (
          <Fragment key={label}>
            <span className="dim">{label}</span>
            {href ? (
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{text}</a>
            ) : (
              <span>{text}</span>
            )}
          </Fragment>
        ))}
      </div>
    </>
  ),
  neofetch: () => {
    const rows = [
      ['OS', `Finley OS v${age(me.birth)}`],
      ['Locatie', me.location],
      ['Opleiding', 'MBO 4 Smart ICT Engineer'],
      ['Uptime', `${age(me.birth)} jaar`],
      ['Shell', 'nieuwsgierigheid'],
      ['Hardware', 'Raspberry Pi, IoT, cyberdecks'],
      ['Talen', languages.map(([n]) => n).join(', ')],
    ];
    return (
      <div className="neo">
        <pre className="hi" aria-hidden="true">{PC}</pre>
        <div>
          <p className="hi">finley@portfolio</p>
          <p className="dim">----------------</p>
          <div className="grid">
            {rows.map(([k, v]) => <Fragment key={k}><span className="hi">{k}</span><span>{v}</span></Fragment>)}
          </div>
        </div>
      </div>
    );
  },
  sudo: () => <p className="err">Leuk geprobeerd. Je hebt geen root-rechten op Finley.</p>,
};

const PS1 = (
  <span className="ps1">finley<span className="host">@portfolio</span>:~$</span>
);

// Only auto-focus with a mouse; on phones it would pop the keyboard on every tap.
const focusInput = (el) => matchMedia('(pointer: fine)').matches && el?.focus();

export default function Home() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [hist, setHist] = useState(-1); // steps back from the newest history entry
  const inputRef = useRef(null);
  const promptRef = useRef(null);
  const outRef = useRef(null);
  const nextId = useRef(0);

  const print = (...nodes) => setLines((l) => [...l, ...nodes.map((node) => ({ id: nextId.current++, node }))]);

  const C = (n) => <button className="cmd" onClick={() => run(n)}>{n}</button>;

  function run(raw) {
    const cmd = resolve(raw);
    const echo = <p>{PS1} {raw}</p>;
    if (cmd === 'clear') setLines([]);
    else if (cmd === null) print(echo);
    else if (cmd === 'unknown')
      print(echo, <p className="err">commando niet gevonden: {raw.trim().split(/\s+/)[0]}. Typ {C('help')}.</p>);
    else print(echo, OUTPUT[cmd](C));
    if (raw.trim()) setHistory((h) => [...h, raw.trim()]);
    setHist(-1);
    setInput('');
    focusInput(inputRef.current);
  }

  function onKey(e) {
    if (e.key === 'Enter') run(input);
    else if (e.key === 'Tab') {
      e.preventDefault();
      setInput(complete(input));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const i = e.key === 'ArrowUp' ? Math.min(hist + 1, history.length - 1) : Math.max(hist - 1, -1);
      setHist(i);
      setInput(i < 0 ? '' : history[history.length - 1 - i]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  useEffect(() => {
    const boot = [
      <p className="dim">FINLEY-BIOS v{age(me.birth)}.0 · geheugen OK</p>,
      <p className="dim">hardware detecteren... raspberry pi, cyberdeck, soldeerbout [OK]</p>,
      <pre className="banner" aria-label={me.name}>{BANNER}</pre>,
      <p>Welkom op mijn portfolio! Typ een commando of klik er een aan.</p>,
      OUTPUT.help(C),
    ];
    setLines([]);
    const timers = boot.map((n, i) => setTimeout(() => print(n), i * 220));
    focusInput(inputRef.current);
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch size, not `lines`, so output that loads later (GitHub repos) also scrolls into view.
  useEffect(() => {
    const ro = new ResizeObserver(() => promptRef.current?.scrollIntoView({ block: 'end' }));
    ro.observe(outRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <main className="term">
      <div className="bar" aria-hidden="true">
        <i /><i /><i /><span>finley@portfolio: ~</span>
      </div>
      <div className="screen" onClick={() => !getSelection().toString() && focusInput(inputRef.current)}>
        <div className="out" ref={outRef} role="log" aria-live="polite">
          {lines.map((l) => <div className="line" key={l.id}>{l.node}</div>)}
        </div>
        <label className="prompt" ref={promptRef}>
          {PS1}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            aria-label="Typ een commando"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            enterKeyHint="go"
          />
        </label>
      </div>
      <nav className="chips" aria-label="Commando's">
        {COMMANDS.filter(([n]) => n !== 'help').map(([n]) => (
          <button key={n} onClick={() => run(n)}>{n}</button>
        ))}
      </nav>
    </main>
  );
}
