'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Eye,
  PackageMinus,
  Search,
  Warehouse,
  Boxes,
} from 'lucide-react';

import type {
  StockSortie,
  StockSortieLigne,
} from '../types/stock-sortie';

type Props = {
  sorties: StockSortie[];
  loading: boolean;
  onView: (id: number) => void;
};

function getLignes(sortie: StockSortie): StockSortieLigne[] {
  return (
    sortie.lignes ??
    sortie.sortie_stock_ligne ??
    sortie.sortieStockLigne ??
    []
  );
}

function toNumber(value: number | string | null | undefined): number {
  const numberValue = Number(value ?? 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function formatDate(date?: string | Date | null): string {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '-';

  return new Intl.DateTimeFormat('fr-FR').format(parsedDate);
}

function getArticleLabel(ligne: StockSortieLigne): string {
  const article = ligne.article;

  if (!article) return `Article #${ligne.idArticle ?? '-'}`;

  const reference = article.reference ?? article.code ?? '';
  const libelle = article.libelle ?? article.designation ?? '';

  if (reference && libelle) return `${reference} — ${libelle}`;
  if (reference) return reference;
  if (libelle) return libelle;

  return `Article #${article.idArticle}`;
}

function getMagasinLabel(ligne: StockSortieLigne): string {
  const magasin = ligne.magasin;

  if (!magasin) return `Magasin #${ligne.idMagasin ?? '-'}`;

  const code = magasin.code ?? '';
  const libelle = magasin.libelle ?? '';

  if (code && libelle) return `${code} — ${libelle}`;
  if (code) return code;
  if (libelle) return libelle;

  return `Magasin #${magasin.idMagasin}`;
}

function getSortieNumero(sortie: StockSortie): string {
  return sortie.numero ?? `BS-${sortie.idSortieStock}`;
}

function getStatutClass(statut?: string | null): string {
  const value = statut?.toUpperCase();

  if (value === 'VALIDEE' || value === 'VALIDE') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  }

  if (value === 'ANNULEE' || value === 'ANNULE') {
    return 'bg-red-50 text-red-700 ring-1 ring-red-200';
  }

  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

function uniqueLabels(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function StockSortieListOptionB({
  sorties,
  loading,
  onView,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredSorties = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sorties;

    return sorties.filter((sortie) => {
      const lignes = getLignes(sortie);

      const text = [
        getSortieNumero(sortie),
        sortie.statut ?? '',
        sortie.commentaire ?? '',
        formatDate(sortie.dateSortie),
        ...lignes.map(getArticleLabel),
        ...lignes.map(getMagasinLabel),
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [sorties, search]);

  if (loading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-6 space-y-4">
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <PackageMinus size={28} />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900">
              Liste des bons de sortie
            </h2>

            <p className="mt-1 text-slate-500">
              {filteredSorties.length} bon(s) de sortie affiché(s)
            </p>
          </div>
        </div>

        <div className="relative w-full lg:max-w-xl">
          <Search
            size={22}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une sortie..."
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d56] focus:bg-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Bon
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Articles
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Magasins
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Quantité
              </th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredSorties.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center font-semibold text-slate-400"
                >
                  Aucune sortie trouvée.
                </td>
              </tr>
            ) : (
              filteredSorties.map((sortie) => {
                const lignes = getLignes(sortie);
                const articles = uniqueLabels(lignes.map(getArticleLabel));
                const magasins = uniqueLabels(lignes.map(getMagasinLabel));
                const totalQuantite = lignes.reduce(
                  (total, ligne) => total + toNumber(ligne.quantite),
                  0,
                );

                return (
                  <tr
                    key={sortie.idSortieStock}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-5 align-top">
                      <div className="text-lg font-black text-slate-900">
                        {getSortieNumero(sortie)}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${getStatutClass(
                            sortie.statut,
                          )}`}
                        >
                          {sortie.statut ?? 'Brouillon'}
                        </span>

                        <span className="text-sm font-semibold text-slate-400">
                          ID : {sortie.idSortieStock}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <CalendarDays size={18} className="text-slate-400" />
                        {formatDate(sortie.dateSortie)}
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start gap-2">
                        <Boxes size={18} className="mt-1 text-slate-400" />

                        <div className="space-y-1">
                          {articles.length === 0 ? (
                            <p className="font-semibold text-slate-400">-</p>
                          ) : (
                            articles.slice(0, 2).map((article) => (
                              <p
                                key={article}
                                className="font-bold text-slate-800"
                              >
                                {article}
                              </p>
                            ))
                          )}

                          {articles.length > 2 && (
                            <p className="text-sm font-semibold text-slate-400">
                              + {articles.length - 2} autre(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start gap-2">
                        <Warehouse size={18} className="mt-1 text-slate-400" />

                        <div className="space-y-1">
                          {magasins.length === 0 ? (
                            <p className="font-semibold text-slate-400">-</p>
                          ) : (
                            magasins.slice(0, 2).map((magasin) => (
                              <p
                                key={magasin}
                                className="font-bold text-slate-800"
                              >
                                {magasin}
                              </p>
                            ))
                          )}

                          {magasins.length > 2 && (
                            <p className="text-sm font-semibold text-slate-400">
                              + {magasins.length - 2} autre(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <span className="inline-flex min-w-14 items-center justify-center rounded-2xl bg-red-50 px-4 py-3 text-lg font-black text-red-700">
                        - {totalQuantite}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right align-top">
                      <button
                        type="button"
                        onClick={() => onView(sortie.idSortieStock)}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#0f3d56] hover:text-[#0f3d56]"
                        title="Voir le détail"
                      >
                        <Eye size={22} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}