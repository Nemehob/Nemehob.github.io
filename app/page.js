'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { COMMANDS, resolve, complete, age } from './lib';
import { me, bio, projects, experience, skills, sysinfo, hobbies, links } from './content';

const ext = { target: '_blank', rel: 'noreferrer' };

const TUX = String.raw`    .--.
   |o_o |
   |:_/ |
  //   \ \
 (|     | )
/'\_   _/'\
\___)=(___/`;

// The 8 normal ANSI terminal colours, like the colour bar at the bottom of real neofetch.
const ANSI = ['#3b3b3b','#c50f1f', '#13a10e', '#c19c00', '#0037da', '#881798', '#3a96dd', '#cccccc'];

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
  const gh = <a href={`https://github.com/${me.github}`} {...ext}>github.com/{me.github}</a>;
  if (repos === null) return <p className="dim">laden...</p>;
  if (repos === 'error') return <p>kon GitHub niet bereiken, kijk op {gh}</p>;
  if (!repos.length) return <p>nog geen publieke repos, zie {gh}</p>;
  return (
    <Table
      rows={repos.map((r) => [
        <a href={r.html_url} {...ext}>{r.name}</a>,
        <>{r.description}{r.language && <span className="dim"> ({r.language})</span>}</>,
      ])}
    />
  );
}

const Table = ({ rows }) => (
  <div className="grid">
    {rows.map(([a, b], i) => <Fragment key={i}><span>{a}</span><span>{b}</span></Fragment>)}
  </div>
);

const OUTPUT = {
  help: () => <Table rows={COMMANDS} />,
  over: () => (
    <>
      <p>{me.name}, {age(me.birth)} jaar.</p>
      {bio.map((p) => <p key={p}>{p}</p>)}
    </>
  ),
  projecten: () => (
    <>
      {projects.length > 0 && <Table rows={projects.map((p) => [<a href={p.link} {...ext}>{p.name}</a>, p.desc])} />}
      <Repos />
    </>
  ),
  ervaring: () => <Table rows={experience} />,
  skills: () => <Table rows={skills} />,
  neofetch: () => (
    <div className="neofetch">
      <pre aria-hidden="true">{TUX}</pre>
      <div>
        <p className="user">finley@portfolio</p>
        <p>----------------</p>
        {[['Naam', me.name], ['Uptime', `${age(me.birth)} jaar`], ...sysinfo].map(([k, v]) => (
          <p key={k}><span className="user">{k}</span>: {v}</p>
        ))}
        <p aria-hidden="true">
          {ANSI.map((c) => <span key={c} style={{ background: c }}>{'   '}</span>)}
        </p>
      </div>
    </div>
  ),
  hobbies: () => <ul>{hobbies.map((h) => <li key={h}>- {h}</li>)}</ul>,
  contact: () => (
    <Table
      rows={links.map(([label, text, href]) => [
        label,
        href ? <a href={href} {...(href.startsWith('http') ? ext : {})}>{text}</a> : text,
      ])}
    />
  ),
};

const PS1 = (
  <span><span className="user">finley@portfolio</span>:<span className="path">~</span>$</span>
);

export default function Home() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [hist, setHist] = useState(-1); // steps back from the newest history entry, -1 = not browsing
  const inputRef = useRef(null);
  const promptRef = useRef(null);
  const outRef = useRef(null);
  const nextId = useRef(0);

  const print = (...nodes) => setLines((l) => [...l, ...nodes.map((node) => ({ id: nextId.current++, node }))]);

  function show(raw) {
    const cmd = resolve(raw);
    const echo = <p>{PS1} {raw}</p>;
    if (cmd === 'clear') setLines([]);
    else if (cmd === null) print(echo);
    else if (cmd === 'unknown') print(echo, <p className="block">{raw.trim().split(/\s+/)[0]}: opdracht niet gevonden</p>);
    else print(echo, <div className="block">{OUTPUT[cmd]()}</div>);
  }

  function run(raw) {
    show(raw);
    if (raw.trim()) setHistory((h) => [...h, raw.trim()]);
    setHist(-1);
    setInput('');
  }

  function onKey(e) {
    if (e.key === 'Enter') run(input);
    else if (e.key === 'Tab') {
      e.preventDefault();
      setInput(complete(input));
    } else if (e.key === 'ArrowUp' || (e.key === 'ArrowDown' && hist >= 0)) {
      e.preventDefault();
      const i = e.key === 'ArrowUp' ? Math.min(hist + 1, history.length - 1) : hist - 1;
      setHist(i);
      setInput(i < 0 ? '' : history[history.length - 1 - i]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  useEffect(() => {
    const when = new Date().toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    setLines([]);
    print(<p className="dim">laatst ingelogd: {when}</p>);
    show('over');
    print(<p className="dim block">typ &apos;help&apos; voor alle commando&apos;s</p>);
    // Don't autofocus on phones: it would pop the keyboard before anyone asked for it.
    if (matchMedia('(pointer: fine)').matches) inputRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch size, not `lines`, so output that loads later (GitHub repos) also scrolls into view.
  useEffect(() => {
    const ro = new ResizeObserver(() => promptRef.current?.scrollIntoView({ block: 'end' }));
    ro.observe(outRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <main onClick={() => !getSelection().toString() && inputRef.current.focus()}>
      <div ref={outRef} role="log" aria-live="polite">
        {lines.map((l) => <Fragment key={l.id}>{l.node}</Fragment>)}
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
    </main>
  );
}
