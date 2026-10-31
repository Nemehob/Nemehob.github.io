// All site text lives here. Edit this file to update the portfolio.

export const me = {
  name: 'Finley van Bohemen',
  birth: '2010-10-20', // only the age is shown on the site
  location: 'Nederland',
  github: 'Nemehob',
  bio: [
    'Hoi! Ik ben Finley, student MBO 4 Smart ICT Engineer.',
    'Ik voel me thuis bij vrijwel alle soorten hardware: van Raspberry Pi\'s en IoT-apparaten tot desktop-pc\'s, handheld computers en cyberdecks.',
    'Aan de softwarekant weet ik ook goed de weg, en daar leer ik elke dag bij.',
  ],
};

// Highlighted projects, shown above the live list of GitHub repos.
// Example: { name: 'Cyberdeck v1', desc: 'Draagbare Linux-computer op een Raspberry Pi', tech: 'Raspberry Pi, 3D-print', link: 'https://github.com/...' }
export const projects = [];

export const experience = [
  { role: 'Student MBO 4 Smart ICT Engineer', place: '', when: 'heden' },
  { role: 'Vulploegmedewerker', place: 'Karwei Hoofddorp', when: 'heden' },
  { role: 'Manschap', place: 'Jeugdbrandweer Hillegom', when: 'heden' },
  { role: 'Diploma MAVO', place: '', when: 'afgerond' },
];

// [name, level out of 10]
export const skills = [
  ['Raspberry Pi & IoT', 9],
  ['Desktop-pc\'s bouwen & repareren', 9],
  ['Handhelds & cyberdecks', 9],
  ['Software', 7],
];

export const languages = [
  ['Nederlands', 'moedertaal'],
  ['Engels', 'vloeiend'],
];

export const hobbies = [
  'Cyberdecks en handheld computers bouwen',
  'Experimenteren met Raspberry Pi\'s en IoT-gadgets',
  'Jeugdbrandweer Hillegom',
];

// [label, text, href or null]
export const links = [
  ['e-mail', 'finleyvbohemen@gmail.com', 'mailto:finleyvbohemen@gmail.com'],
  ['github', 'github.com/Nemehob', 'https://github.com/Nemehob'],
  ['linkedin', 'linkedin.com/in/finley-van-bohemen', 'https://www.linkedin.com/in/finley-van-bohemen-3631b127b/'],
  ['whatsapp', 'Finleyvb', null],
];
