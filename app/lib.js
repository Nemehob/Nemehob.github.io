// [Dutch name, English name, help group]. Both names always work; help shows the current language's.
export const COMMANDS = [
  ['over', 'about', 'main'],
  ['projecten', 'projects', 'main'],
  ['ervaring', 'experience', 'main'],
  ['skills', 'skills', 'main'],
  ['hobbies', 'hobbies', 'main'],
  ['contact', 'contact', 'main'],
  ['cv', 'cv', 'main'],
  ['email', 'email', 'main'],
  ['github', 'github', 'main'],
  ['neofetch', 'neofetch', 'main'],
  ['raad', 'guess', 'extra'],
  ['theme', 'theme', 'extra'],
  ['lang', 'lang', 'extra'],
  ['history', 'history', 'extra'],
  ['echo', 'echo', 'extra'],
  ['date', 'date', 'extra'],
  ['pwd', 'pwd', 'extra'],
  ['uname', 'uname', 'extra'],
  ['hostname', 'hostname', 'extra'],
  ['help', 'help', 'extra'],
  ['clear', 'clear', 'extra'],
  ['exit', 'exit', 'extra'],
];

// [Dutch name, English name]
export const THEMES = [['standaard', 'default'], ['groen', 'green'], ['amber', 'amber'], ['licht', 'light']];

const ALIASES = {
  '?': 'help', ls: 'help', hulp: 'help',
  whoami: 'over',
  cls: 'clear',
  logout: 'exit',
  mail: 'email',
  fun: 'hobbies',
  thema: 'theme',
  taal: 'lang', language: 'lang',
};

const LOOKUP = new Map([...Object.entries(ALIASES), ...COMMANDS.flatMap(([nl, en]) => [[nl, nl], [en, nl]])]);

const pick = (pair, lang) => pair[lang === 'en' ? 1 : 0];
export const names = (lang) => COMMANDS.map((c) => pick(c, lang));
export const nameOf = (key, lang) => pick(COMMANDS.find((c) => c[0] === key), lang);
export const themeName = (key, lang) => pick(THEMES.find((t) => t[0] === key), lang);
export const themeKey = (word) => THEMES.find((t) => t.includes(word.trim().toLowerCase()))?.[0];

// Returns null for empty input, else { cmd: command key or 'unknown', word as typed, args: the rest }.
export function parse(input) {
  const line = input.trim();
  if (!line) return null;
  const word = line.split(/\s+/)[0];
  return { cmd: LOOKUP.get(word.toLowerCase()) ?? 'unknown', word, args: line.slice(word.length).trim() };
}

export function matches(partial, lang) {
  const p = partial.trimStart().toLowerCase();
  return p && !/\s/.test(p) ? names(lang).filter((n) => n.startsWith(p)) : [];
}

// Like bash: only completes when exactly one command matches.
export function complete(partial, lang) {
  const hits = matches(partial, lang);
  return hits.length === 1 ? hits[0] : partial;
}

function distance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

// Closest command for "did you mean", allowing at most 2 typos and fewer than half the letters wrong.
export function suggest(word, lang) {
  let best;
  let bestD = 3;
  for (const n of names(lang)) {
    const d = distance(word.toLowerCase(), n);
    if (d < bestD && d < n.length / 2) [best, bestD] = [n, d];
  }
  return best;
}

// First real paragraph of a README: skips headings, images, badges, HTML, lists and code.
export function readmeSummary(md, max = 200) {
  const para = md.split(/\n\s*\n/).map((p) => p.trim()).find((p) => p && !/^[#!<[|`>-]/.test(p)) ?? '';
  const text = para.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Parsed as local date parts so the birthday doesn't shift a day in other time zones.
export function age(birth, now = new Date()) {
  const [y, m, d] = birth.split('-').map(Number);
  const hadBirthday = now.getMonth() + 1 > m || (now.getMonth() + 1 === m && now.getDate() >= d);
  return now.getFullYear() - y - (hadBirthday ? 0 : 1);
}
