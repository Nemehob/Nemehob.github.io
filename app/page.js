'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { COMMANDS, THEMES, parse, complete, matches, suggest, nameOf, themeKey, themeName, readmeSummary, age } from './lib';
import { me, links, projects, TEXT } from './content';

const ext = { target: '_blank', rel: 'noreferrer' };

const BANNER = String.raw` _____  ___   _   _   _       _____  __   __
|  ___| |_ _| | \ | | | |     | ____| \ \ / /
| |_     | |  |  \| | | |     |  _|    \ V /
|  _|    | |  | |\  | | |___  | |___    | |
|_|     |___| |_| \_| |_____| |_____|   |_|`;

const TUX = String.raw`    .--.
   |o_o |
   |:_/ |
  //   \ \
 (|     | )
/'\_   _/'\
\___)=(___/`;

// The 8 normal ANSI terminal colours, like the colour bar at the bottom of real neofetch.
const ANSI = ['#3b3b3b', '#c50f1f', '#13a10e', '#c19c00', '#0037da', '#881798', '#3a96dd', '#cccccc'];

// localStorage can throw (private mode, blocked storage); the site just forgets the setting then.
const load = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

// One shared request, so repeated commands don't hit GitHub's 60/hour anonymous limit.
let reposPromise;
const getRepos = () =>
  (reposPromise ??= fetch(`https://api.github.com/users/${me.github}/repos?sort=updated&per_page=100`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((repos) => repos.filter((r) => !r.fork)));
const forgetRepos = () => { reposPromise = undefined; }; // allow a retry next time

const ghLink = <a href={`https://github.com/${me.github}`} {...ext}>github.com/{me.github}</a>;

const Table = ({ rows }) => (
  <div className="grid">
    {rows.map(([a, b], i) => <Fragment key={i}><span>{a}</span><span>{b}</span></Fragment>)}
  </div>
);

function Repos({ t }) {
  const [repos, setRepos] = useState(null);
  useEffect(() => {
    getRepos().then(setRepos, () => { forgetRepos(); setRepos('error'); });
  }, []);
  if (repos === null) return <p className="dim">{t.ui.loading}</p>;
  if (repos === 'error') return <p>{t.ui.ghError} {ghLink}</p>;
  if (!repos.length) return <p>{t.ui.noRepos} {ghLink}</p>;
  return (
    <Table
      rows={repos.slice(0, 10).map((r) => [
        <a href={r.html_url} {...ext}>{r.name}</a>,
        <>{r.description}{r.language && <span className="dim"> ({r.language})</span>}</>,
      ])}
    />
  );
}

function Repo({ name, t }) {
  const [repo, setRepo] = useState(null);
  useEffect(() => {
    getRepos()
      .then(async (repos) => {
        const r = repos.find((x) => x.name.toLowerCase() === name.toLowerCase());
        if (!r) return 'missing';
        const md = await fetch(`https://api.github.com/repos/${me.github}/${r.name}/readme`, {
          headers: { Accept: 'application/vnd.github.raw' },
        }).then((x) => (x.ok ? x.text() : ''), () => '');
        return { r, readme: readmeSummary(md) };
      })
      .then(setRepo, () => { forgetRepos(); setRepo('error'); });
  }, [name]);
  if (repo === null) return <p className="dim">{t.ui.loading}</p>;
  if (repo === 'error') return <p>{t.ui.ghError} {ghLink}</p>;
  if (repo === 'missing') return <p>{t.ui.repoMissing} {name}</p>;
  const { r, readme } = repo;
  const f = t.ui.repo;
  return (
    <Table
      rows={[
        [f.name, <a href={r.html_url} {...ext}>{r.name}</a>],
        r.description && [f.about, r.description],
        r.language && [f.language, r.language],
        [f.stars, r.stargazers_count],
        [f.updated, new Date(r.pushed_at).toLocaleDateString(t.locale)],
        readme && ['readme', readme],
      ].filter(Boolean)}
    />
  );
}

// Commands that only print something. Each gets { t: texts, l: language, args, history }.
const OUTPUT = {
  help: ({ t, l }) =>
    ['main', 'extra'].map((g) => (
      <Fragment key={g}>
        <p className={g === 'extra' ? 'dim gap' : 'dim'}>{t.ui.groups[g]}</p>
        <Table rows={COMMANDS.filter((c) => c[2] === g).map((c) => [nameOf(c[0], l), t.help[c[0]]])} />
      </Fragment>
    )),
  over: ({ t }) => (
    <>
      <p>{me.name}, {t.ui.age(age(me.birth))}.</p>
      {t.bio.map((p) => <p key={p}>{p}</p>)}
    </>
  ),
  projecten: ({ t, l }) => (
    <>
      {projects.length > 0 && <Table rows={projects.map((p) => [<a href={p.link} {...ext}>{p.name}</a>, p[l]])} />}
      <Repos t={t} />
    </>
  ),
  ervaring: ({ t }) => <Table rows={t.experience} />,
  skills: ({ t }) => <Table rows={t.skills} />,
  hobbies: ({ t }) => <ul>{t.hobbies.map((h) => <li key={h}>- {h}</li>)}</ul>,
  contact: () => (
    <Table
      rows={links.map(([label, text, href]) => [
        label,
        href ? <a href={href} {...(href.startsWith('http') ? ext : {})}>{text}</a> : text,
      ])}
    />
  ),
  cv: (ctx) =>
    ['over', 'ervaring', 'skills', 'contact'].map((k) => (
      <div className="block" key={k}>
        <p className="dim">## {nameOf(k, ctx.l)}</p>
        {OUTPUT[k](ctx)}
      </div>
    )),
  github: ({ t, args }) => (args ? <Repo name={args} t={t} /> : <><p>{t.ui.repoUsage}</p><Repos t={t} /></>),
  neofetch: ({ t }) => (
    <div className="neofetch">
      <pre aria-hidden="true">{TUX}</pre>
      <div>
        <p className="user">finley@portfolio</p>
        <p>----------------</p>
        {[[t.ui.name, me.name], ['Uptime', t.ui.age(age(me.birth))], ...t.sysinfo].map(([k, v]) => (
          <p key={k}><span className="user">{k}</span>: {v}</p>
        ))}
        <p aria-hidden="true">
          {ANSI.map((c) => <span key={c} style={{ background: c }}>{'   '}</span>)}
        </p>
      </div>
    </div>
  ),
  history: ({ history }) => <Table rows={history.map((h, i) => [i + 1, h])} />,
  echo: ({ args }) => <p>{args}</p>,
  date: ({ t }) => <p>{new Date().toLocaleString(t.locale, { dateStyle: 'full', timeStyle: 'medium' })}</p>,
  pwd: () => <p>/home/finley</p>,
  uname: () => <p>Linux</p>,
  hostname: () => <p>portfolio</p>,
};

const PS1 = (
  <span><span className="user">finley@portfolio</span>:<span className="path">~</span>$</span>
);

export default function Home() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [hist, setHist] = useState(-1); // steps back from the newest history entry, -1 = not browsing
  const [lang, setLang] = useState('nl');
  const [theme, setTheme] = useState('standaard');
  const [loggedOut, setLoggedOut] = useState(false);
  const game = useRef(null); // { n, tries } while `raad` is running
  const lastKeyWasTab = useRef(false);
  const inputRef = useRef(null);
  const promptRef = useRef(null);
  const outRef = useRef(null);
  const nextId = useRef(0);

  const t = TEXT[lang];
  const print = (...nodes) => setLines((l) => [...l, ...nodes.map((node) => ({ id: nextId.current++, node }))]);
  const done = complete(input, lang);
  const ghost = input && done !== input ? done.slice(input.trimStart().length) : '';

  // `l` is passed in because a language switch hasn't reached `lang` yet within the same event.
  function show(raw, hist, l = lang) {
    const t = TEXT[l];
    const echo = <p>{PS1} {raw}</p>;
    const out = (node) => print(echo, <div className="block">{node}</div>);
    const p = parse(raw);
    if (!p) return print(echo);
    const { cmd, word, args } = p;
    switch (cmd) {
      case 'clear':
        return setLines([]);
      case 'exit':
        setLines([]);
        setLoggedOut(true);
        return print(<p>{t.ui.logout}</p>, <p className="dim">{t.ui.pressKey}</p>);
      case 'email':
        location.href = `mailto:${me.email}`;
        return out(<p>{t.ui.email}</p>);
      case 'theme': {
        const key = themeKey(args);
        if (!key) return out(<p>{t.ui.themes}: {THEMES.map((th) => themeName(th[0], l)).join(', ')}</p>);
        setTheme(key);
        save('theme', key);
        return out(<p>{t.ui.themeSet}: {themeName(key, l)}</p>);
      }
      case 'lang': {
        const next = args.toLowerCase();
        if (next !== 'nl' && next !== 'en') return out(<p>{t.ui.langUsage}</p>);
        setLang(next);
        save('lang', next);
        return out(<p>{TEXT[next].ui.langSet}</p>);
      }
      case 'raad':
        game.current = { n: 1 + Math.floor(Math.random() * 100), tries: 0 };
        return out(<p>{t.ui.gameStart}</p>);
      case 'unknown': {
        const s = suggest(word, l);
        return out(<p>{word}: {t.ui.notFound}{s && <><br />{t.ui.didYouMean}: {s}?</>}</p>);
      }
      default:
        return out(OUTPUT[cmd]({ t, l, args, history: hist }));
    }
  }

  // While `raad` runs, numbers and "stop" go to the game; everything else still works as a command.
  function guess(raw) {
    const g = game.current;
    const w = raw.trim().toLowerCase();
    if (!g || !(w === 'stop' || /^\d+$/.test(w))) return false;
    const say = (text) => print(<p>{PS1} {raw}</p>, <p className="block">{text}</p>);
    if (w === 'stop') {
      game.current = null;
      say(t.ui.stopped(g.n));
    } else if (++g.tries && Number(w) === g.n) {
      game.current = null;
      say(t.ui.won(g.tries));
    } else say(Number(w) < g.n ? t.ui.higher : t.ui.lower);
    return true;
  }

  function run(raw) {
    const next = raw.trim() ? [...history, raw.trim()] : history;
    if (!guess(raw)) show(raw, next);
    setHistory(next);
    setHist(-1);
    setInput('');
  }

  function boot(l) {
    const t = TEXT[l];
    const when = new Date().toLocaleString(t.locale, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    let start = nameOf('over', l);
    try {
      start = decodeURIComponent(location.hash.slice(1)) || start; // nemehob.github.io/#contact runs `contact`
    } catch {}
    setLines([]);
    print(<pre className="banner block" aria-label={me.name}>{BANNER}</pre>, <p className="dim">{t.ui.lastLogin}: {when}</p>);
    show(start, [], l);
    print(<p className="dim block">{t.ui.hint}</p>);
  }

  function onKey(e) {
    const el = e.target;
    const tab = e.key === 'Tab';
    if (e.key === 'Enter') run(input);
    else if (tab) {
      e.preventDefault();
      if (done !== input) setInput(done);
      else if (lastKeyWasTab.current) {
        const m = matches(input, lang);
        if (m.length > 1) print(<p>{PS1} {input}</p>, <p className="block pre">{m.join('  ')}</p>);
      }
    } else if (e.key === 'ArrowRight' && ghost && el.selectionStart === input.length) {
      e.preventDefault();
      setInput(done);
    } else if (e.key === 'ArrowUp' || (e.key === 'ArrowDown' && hist >= 0)) {
      e.preventDefault();
      const i = e.key === 'ArrowUp' ? Math.min(hist + 1, history.length - 1) : hist - 1;
      setHist(i);
      setInput(i < 0 ? '' : history[history.length - 1 - i]);
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setLines([]);
    } else if (e.ctrlKey && e.key === 'c' && el.selectionStart === el.selectionEnd) {
      // With text selected, Ctrl+C still copies.
      e.preventDefault();
      print(<p>{PS1} {input}^C</p>);
      game.current = null;
      setInput('');
      setHist(-1);
    }
    lastKeyWasTab.current = tab;
  }

  useEffect(() => {
    const l = load('lang') === 'en' ? 'en' : 'nl';
    // shortcut: a saved theme applies after first paint, so it can flash the default once; add an inline <head> script if that bothers anyone.
    setTheme(themeKey(load('theme') ?? '') ?? 'standaard');
    setLang(l);
    boot(l);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  // Don't autofocus on phones: it would pop the keyboard before anyone asked for it.
  useEffect(() => {
    if (!loggedOut && matchMedia('(pointer: fine)').matches) inputRef.current?.focus();
  }, [loggedOut]);

  useEffect(() => {
    if (!loggedOut) return;
    const login = () => { setLoggedOut(false); boot(lang); };
    // Wait a tick, so the Enter that ran `exit` doesn't log straight back in.
    const id = setTimeout(() => {
      addEventListener('keydown', login, { once: true });
      addEventListener('pointerdown', login, { once: true });
    });
    return () => {
      clearTimeout(id);
      removeEventListener('keydown', login);
      removeEventListener('pointerdown', login);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedOut]);

  // Watch size, not `lines`, so output that loads later (GitHub repos) also scrolls into view.
  useEffect(() => {
    const ro = new ResizeObserver(() => promptRef.current?.scrollIntoView({ block: 'end' }));
    ro.observe(outRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <main onClick={() => !getSelection().toString() && inputRef.current?.focus()}>
      <div ref={outRef} role="log" aria-live="polite">
        {lines.map((l) => <Fragment key={l.id}>{l.node}</Fragment>)}
      </div>
      {!loggedOut && (
        <label className="prompt" ref={promptRef}>
          {PS1}
          <span className="field">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); setHist(-1); }}
              onKeyDown={onKey}
              aria-label={lang === 'en' ? 'Type a command' : 'Typ een commando'}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              enterKeyHint="go"
            />
            {ghost && (
              <span className="ghost" aria-hidden="true"><span className="hidden">{input}</span>{ghost}</span>
            )}
          </span>
        </label>
      )}
    </main>
  );
}
