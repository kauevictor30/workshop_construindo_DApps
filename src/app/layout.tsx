import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LiveDeck — Plataforma de Apresentação Sincronizada para Workshops',
  description: 'Acompanhamento de slides ao vivo no celular com captação de leads e envio automático pós-evento.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className="min-h-full flex flex-col bg-slate-950">{children}</body>
    </html>
  );
}
