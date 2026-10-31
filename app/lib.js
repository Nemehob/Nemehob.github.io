export const COMMANDS = [
  ['help', 'toon alle commando\'s'],
  ['over', 'wie ben ik?'],
  ['projecten', 'waar ik aan werk'],
  ['ervaring', 'opleiding & werk'],
  ['skills', 'wat ik kan'],
  ['hobbies', 'leuke feitjes'],
  ['contact', 'neem contact op'],
  ['neofetch', 'systeeminfo'],
  ['clear', 'scherm leegmaken'],
];

const ALIASES = {
  '?': 'help', ls: 'help', hulp: 'help',
  about: 'over', whoami: 'over',
  projects: 'projecten',
  experience: 'ervaring', cv: 'ervaring',
  vaardigheden: 'skills',
  fun: 'hobbies',
  cls: 'clear',
  sudo: 'sudo',
};

const NAMES = new Set(COMMANDS.map(([n]) => n));

// Returns the command key, null for empty input, or 'unknown'.
export function resolve(input) {
  const word = input.trim().toLowerCase().split(/\s+/)[0];
  if (!word) return null;
  if (NAMES.has(word)) return word;
  return ALIASES[word] ?? 'unknown';
}

export function complete(partial) {
  const p = partial.trim().toLowerCase();
  return p ? COMMANDS.find(([n]) => n.startsWith(p))?.[0] ?? partial : partial;
}

// Parsed as local date parts so the birthday doesn't shift a day in other time zones.
export function age(birth, now = new Date()) {
  const [y, m, d] = birth.split('-').map(Number);
  const hadBirthday = now.getMonth() + 1 > m || (now.getMonth() + 1 === m && now.getDate() >= d);
  return now.getFullYear() - y - (hadBirthday ? 0 : 1);
}
