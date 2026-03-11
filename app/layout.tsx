import './globals.css';
import Hotbar from '../components/Hotbar';
import Script from 'next/script';

export const metadata = {
  title: 'Associação Atlética Agrotóxica',
  description: 'A maior e melhor atlética de Agronomia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-poppins antialiased">
        {children}
        <Hotbar />
        <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}