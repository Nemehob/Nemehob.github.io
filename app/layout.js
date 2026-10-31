import './globals.css';

export const metadata = {
  title: 'Finley van Bohemen',
  description: 'Finley van Bohemen, mbo-student Smart ICT Engineer.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
