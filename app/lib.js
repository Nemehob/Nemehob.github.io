export const COMMANDS = [
  ['over', 'wie ik ben'],
  ['projecten', 'mijn GitHub-projecten'],
  ['ervaring', 'school en werk'],
  ['skills', 'waar ik goed in ben'],
  ['hobbies', 'wat ik verder doe'],
  ['contact', 'hoe je me bereikt'],
  ['neofetch', 'alles in het kort'],
  ['help', 'deze lijst'],
  ['clear', 'scherm leegmaken'],
];

const ALIASES = {
  '?': 'help', ls: 'help', hulp: 'help',
  about: 'over', whoami: 'over',
  projects: 'projecten',
  experience: 'ervaring', cv: 'ervaring',
  fun: 'hobbies',
  cls: 'clear',
};

const NAMES = new Set(COMMANDS.map(([n]) => n));

// Returns the command key, null for empty input, or 'unknown'.
export function resolve(input) {
  const word = input.trim().toLowerCase().split(/\s+/)[0];
  if (!word) return null;
  if (NAMES.has(word)) return word;
  return ALIASES[word] ?? 'unknown';
}

// Like bash: only completes when exactly one command matches.
export function complete(partial) {
  const p = partial.trim().toLowerCase();
  const hits = p ? COMMANDS.filter(([n]) => n.startsWith(p)) : [];
  return hits.length === 1 ? hits[0][0] : partial;
}

// Parsed as local date parts so the birthday doesn't shift a day in other time zones.
export function age(birth, now = new Date()) {
  const [y, m, d] = birth.split('-').map(Number);
  const hadBirthday = now.getMonth() + 1 > m || (now.getMonth() + 1 === m && now.getDate() >= d);
  return now.getFullYear() - y - (hadBirthday ? 0 : 1);
}
