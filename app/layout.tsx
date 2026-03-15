import './globals.css';
import Hotbar from '../components/Hotbar';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import LockdownOverlay from '../components/LockdownOverlay';

export const metadata = {
  title: 'Associação Atlética Agrotóxica',
  description: 'A maior e melhor atlética de Agronomia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🚀 A CHAVE DA PORTEIRA
  // true = Lockdown Ativo (Site bloqueado)
  // false = Site Liberado (Exibe vitrine, 3D e Hotbar)
  const isLockdown = true;

  return (
    <html lang="pt-BR">
      <body className="font-poppins antialiased">
        {isLockdown ? (
          <LockdownOverlay />
        ) : (
          <>
            {children}
            <Hotbar />
            {/* O Model Viewer só carrega se o site estiver liberado para não pesar o lockdown */}
            <Script
              type="module"
              src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
              strategy="lazyOnload"
            />
          </>
        )}

        {/* Analytics fica sempre ativo para você monitorar os acessos mesmo em lockdown */}
        <Analytics />
      </body>
    </html>
  );
}