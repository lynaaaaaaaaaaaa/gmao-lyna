'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  PackageMinus,
  Plus,
  RefreshCcw,
  CalendarDays,
  Warehouse,
  Boxes,
} from 'lucide-react';

import { getStockSorties } from '@/features/stock-sorties/services/stock-sortie.service';
import type { StockSortie } from '@/features/stock-sorties/types/stock-sortie';

function formatDate(date?: string | Date | null) {
  if (!date) return '-';

  return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
}

function getSortieId(sortie: StockSortie) {
  return sortie.idSortieStock;
}

function getLignes(sortie: StockSortie) {
  return sortie.sortie_stock_ligne ?? sortie.lignes ?? [];
}

function getArticlesText(sortie: StockSortie) {
  const lignes = getLignes(sortie);

  if (lignes.length === 0) return '-';

  return lignes
    .map((ligne) => ligne.article?.reference ?? ligne.article?.libelle ?? `Article #${ligne.idArticle}`)
    .join(', ');
}

function getMagasinsText(sortie: StockSortie) {
  const lignes = getLignes(sortie);

  if (lignes.length === 0) return '-';

  const magasins = lignes.map(
    (ligne) =>
      ligne.magasin?.code ??
      ligne.magasin?.libelle ??
      `Magasin #${ligne.idMagasin}`,
  );

  return [...new Set(magasins)].join(', ');
}

function getQuantiteTotale(sortie: StockSortie) {
  return getLignes(sortie).reduce(
    (total, ligne) => total + Number(ligne.quantite ?? 0),
    0,
  );
}

export default function StockSortiesPage() {
  const router = useRouter();

  const [sorties, setSorties] = useState<StockSortie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSorties() {
    try {
      setLoading(true);
      setError(null);

      const data = await getStockSorties();

      setSorties(data);
    } catch {
      setError('Erreur lors du chargement des bons de sortie.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSorties();
  }, []);

  function handleView(id: number) {
    router.push(`/stock/sorties/${id}`);
  }

  function handleCreate() {
    router.push('/stock/sorties/nouvelle');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
              Module stock
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Sorties stock
            </h1>

            <p className="mt-2 text-slate-500">
              Consultez les bons de sortie, les articles sortis et les magasins
              concernés.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={loadSorties}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw size={18} />
              Actualiser
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-[#0f3d56] px-7 py-4 text-base font-black text-white shadow-sm transition hover:bg-[#0b3044]"
            >
              <Plus size={20} />
              Nouvelle sortie
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <PackageMinus size={28} />
              </div>

              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Liste des bons de sortie
                </h2>

                <p className="mt-1 text-slate-500">
                  {sorties.length} bon(s) de sortie enregistré(s)
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center font-semibold text-slate-500">
              Chargement des sorties...
            </div>
          ) : sorties.length === 0 ? (
            <div className="p-8 text-center font-semibold text-slate-500">
              Aucun bon de sortie trouvé.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sorties.map((sortie) => {
                const id = getSortieId(sortie);

                return (
                  <article
                    key={id}
                    className="grid gap-5 p-6 transition hover:bg-slate-50 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
                  >
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {sortie.numero ?? `BS-${id}`}
                      </h3>

                      <span className="mt-2 inline-flex rounded-full bg-green-50 px-4 py-1 text-sm font-black uppercase text-green-700">
                        {sortie.statut ?? 'VALIDEE'}
                      </span>

                      <p className="mt-3 text-sm font-bold text-slate-400">
                        ID : {id}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                        <CalendarDays size={17} />
                        Date
                      </p>

                      <p className="mt-2 font-black text-slate-900">
                        {formatDate(sortie.dateSortie)}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                        <Boxes size={17} />
                        Articles
                      </p>

                      <p className="mt-2 line-clamp-2 font-black text-slate-900">
                        {getArticlesText(sortie)}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                        <Warehouse size={17} />
                        Magasins
                      </p>

                      <p className="mt-2 line-clamp-2 font-black text-slate-900">
                        {getMagasinsText(sortie)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 lg:justify-end">
                      <span className="rounded-2xl bg-red-50 px-5 py-3 font-black text-red-700">
                        - {getQuantiteTotale(sortie)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleView(id)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
                        title="Voir le détail"
                      >
                        <Eye size={22} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}