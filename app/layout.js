import { VT323 } from 'next/font/google';
import './globals.css';

const vt = VT323({ weight: '400', subsets: ['latin'] });

export const metadata = {
  title: 'Finley van Bohemen | Portfolio',
  description: 'Portfolio van Finley van Bohemen, student MBO 4 Smart ICT Engineer en hardware-liefhebber.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className={vt.className}>{children}</body>
    </html>
  );
}
