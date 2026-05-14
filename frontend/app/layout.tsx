import './globals.css';
import Sidebar from '../components/sidebar';

export const metadata = {
  title: 'GMAO BMT',
  description: 'Application de gestion de maintenance assistée par ordinateur',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#f4f7fb] text-slate-900">
        <div className="min-h-screen">
          <Sidebar />

          <div className="min-h-screen lg:pl-[292px]">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-8 py-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    GMAO BMT
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    Port · Maintenance · Équipements · Stock
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-500">
                    Interface administrateur
                  </div>

                  <div className="rounded-full bg-cyan-50 px-6 py-3 text-sm font-black text-slate-900">
                    Admin
                  </div>
                </div>
              </div>
            </header>

            <main className="min-h-[calc(100vh-89px)] bg-[#f4f7fb]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}