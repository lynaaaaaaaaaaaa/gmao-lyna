'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  PackageMinus,
  Plus,
  RefreshCcw,
  CalendarDays,
  Warehouse,
  Boxes,
  Search,
} from 'lucide-react';

 import { getStockSorties } from '@/features/stock-sorties/services/stock-sortie.service';
import type { StockSortie, StockSortieLigne } from '@/features/stock-sorties/types/stock-sortie';

type SortieLigneView = {
  idLigneSortieStock?: number;
  idArticle?: number;
  idMagasin?: number;
  quantite?: number | string | null;

  article?: {
    idArticle?: number;
    reference?: string | null;
    designation?: string | null;
    libelle?: string | null;
    serialise?: boolean | null;
  } | null;

  magasin?: {
    idMagasin?: number;
    code?: string | null;
    libelle?: string | null;
    nom?: string | null;
  } | null;
};

type StockSortieView = StockSortie & {
  id?: number;
  idSortieStock?: number;
  numero?: string | null;
  dateSortie?: string | Date | null;
  commentaire?: string | null;
  statut?: string | null;

  lignes?: SortieLigneView[];
  sortie_stoimportck_ligne?: SortieLigneView[];
  lignesSortieStock?: SortieLigneView[];
};

function formatDate(date?: string | Date | null) {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR').format(parsedDate);
}

function getSortieId(sortie: StockSortieView) {
  return Number(sortie.idSortieStock ?? sortie.id ?? 0);
}

function getLignes(sortie: StockSortieView): SortieLigneView[] {
  if (Array.isArray(sortie.sortie_stock_ligne)) {
    return sortie.sortie_stock_ligne;
  }

  if (Array.isArray(sortie.lignes)) {
    return sortie.lignes;
  }

  if (Array.isArray(sortie.lignesSortieStock)) {
    return sortie.lignesSortieStock;
  }

  return [];
}

function getArticleLabel(ligne: SortieLigneView) {
  return (
    ligne.article?.reference ??
    ligne.article?.designation ??
    ligne.article?.libelle ??
    `Article #${ligne.idArticle ?? '-'}`
  );
}

function getMagasinLabel(ligne: SortieLigneView) {
  const code = ligne.magasin?.code;
  const libelle = ligne.magasin?.libelle ?? ligne.magasin?.nom;

  if (code && libelle) return `${code} — ${libelle}`;
  if (code) return code;
  if (libelle) return libelle;

  return `Magasin #${ligne.idMagasin ?? '-'}`;
}

function getArticlesText(sortie: StockSortieView) {
  const lignes = getLignes(sortie);

  if (lignes.length === 0) return '-';

  return lignes.map(getArticleLabel).join(', ');
}

function getMagasinsText(sortie: StockSortieView) {
  const lignes = getLignes(sortie);

  if (lignes.length === 0) return '-';

  const magasins = lignes.map(getMagasinLabel);

  return [...new Set(magasins)].join(', ');
}

function getQuantiteTotale(sortie: StockSortieView) {
  return getLignes(sortie).reduce((total, ligne) => {
    return total + Number(ligne.quantite ?? 0);
  }, 0);
}

export default function StockSortiesPage() {
  const router = useRouter();

  const [sorties, setSorties] = useState<StockSortieView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  async function loadSorties() {
    try {
      setLoading(true);
      setError(null);

      const data = await getStockSorties();

      setSorties(data as StockSortieView[]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des bons de sortie.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSorties();
  }, []);

  const filteredSorties = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return sorties;

    return sorties.filter((sortie) => {
      const id = getSortieId(sortie);

      const content = [
        sortie.numero,
        sortie.statut,
        id,
        getArticlesText(sortie),
        getMagasinsText(sortie),
        formatDate(sortie.dateSortie),
      ]
        .join(' ')
        .toLowerCase();

      return content.includes(keyword);
    });
  }, [sorties, search]);

  function handleView(id: number) {
    router.push(`/stock/sorties/${id}`);
  }

  function handleCreate() {
    router.push('/stock/sorties/nouvelle');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Module stock
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-900 lg:text-4xl">
                Sorties stock
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                Consultez les bons de sortie des articles non sérialisés et les
                magasins concernés.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={loadSorties}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCcw size={18} />
                Actualiser
              </button>

              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b3044]"
              >
                <Plus size={18} />
                Nouvelle sortie
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <PackageMinus size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Liste des bons de sortie
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {filteredSorties.length} bon(s) affiché(s) sur{' '}
                  {sorties.length}
                </p>
              </div>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par numéro, article ou magasin..."
                className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d56] focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Chargement des sorties...
            </div>
          ) : filteredSorties.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Aucun bon de sortie trouvé.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSorties.map((sortie, index) => {
                const id = getSortieId(sortie);
                const lignes = getLignes(sortie);
                const quantiteTotale = getQuantiteTotale(sortie);

                return (
                  <article
                    key={id || index}
                    className="grid gap-5 p-6 transition hover:bg-slate-50 lg:grid-cols-[1.2fr_0.8fr_1.2fr_1.2fr_auto]"
                  >
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {sortie.numero ?? `BS-${id}`}
                      </h3>

                      <span className="mt-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase text-red-700">
                        {sortie.statut ?? 'VALIDEE'}
                      </span>

                      <p className="mt-3 text-xs font-bold text-slate-400">
                        ID : {id || '-'} · {lignes.length} ligne(s)
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        <CalendarDays size={16} />
                        Date
                      </p>

                      <p className="mt-2 text-sm font-black text-slate-900">
                        {formatDate(sortie.dateSortie)}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        <Boxes size={16} />
                        Articles
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm font-black text-slate-900">
                        {getArticlesText(sortie)}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        <Warehouse size={16} />
                        Magasins
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm font-black text-slate-900">
                        {getMagasinsText(sortie)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 lg:justify-end">
                      <span className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-black text-red-700">
                        - {quantiteTotale}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleView(id)}
                        disabled={!id}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Voir le détail"
                      >
                        <Eye size={20} />
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