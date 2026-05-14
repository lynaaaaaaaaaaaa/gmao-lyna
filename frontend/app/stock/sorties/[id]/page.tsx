'use client';

import { ComponentType, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileText,
  Layers,
  Package,
  Warehouse,
} from 'lucide-react';

import { getStockSortieById } from '@/features/stock-sorties/services/stock-sortie.service';

type Article = {
  idArticle?: number;
  reference?: string | null;
  designation?: string | null;
  libelle?: string | null;
  code?: string | null;
};

type Magasin = {
  idMagasin?: number;
  code?: string | null;
  libelle?: string | null;
};

type Emplacement = {
  idEmplacement?: number;
  code?: string | null;
  libelle?: string | null;
};

type Materiel = {
  idMateriel?: number;
  code?: string | null;
  numeroSerie?: string | null;
};

type StockSortieLigne = {
  idLigneSortieStock?: number;
  idArticle?: number;
  idMagasin?: number;
  idEmplacement?: number | null;
  idMateriel?: number | null;
  quantite?: number | string | null;
  prixUnitaire?: number | string | null;
  commentaire?: string | null;
  article?: Article | null;
  magasin?: Magasin | null;
  emplacement?: Emplacement | null;
  materiel?: Materiel | null;
};

type StockSortie = {
  idSortieStock?: number;
  numero?: string | null;
  dateSortie?: string | Date | null;
  date?: string | Date | null;
  statut?: string | null;
  commentaire?: string | null;
  lignes?: StockSortieLigne[];

  // Sécurité si ton backend renvoie encore l'ancien nom Prisma
  sortie_stock_ligne?: StockSortieLigne[];
};

function formatDate(date?: string | Date | null) {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '-';

  return new Intl.DateTimeFormat('fr-FR').format(parsedDate);
}

function formatPrix(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '-';

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return '-';

  return `${numberValue.toLocaleString('fr-FR')} DZD`;
}

function getLignes(sortie: StockSortie) {
  return sortie.lignes ?? sortie.sortie_stock_ligne ?? [];
}

function articleLabel(ligne: StockSortieLigne) {
  return (
    ligne.article?.reference ||
    ligne.article?.designation ||
    ligne.article?.libelle ||
    ligne.article?.code ||
    `Article #${ligne.idArticle ?? '-'}`
  );
}

function magasinLabel(ligne: StockSortieLigne) {
  if (!ligne.magasin) return `Magasin #${ligne.idMagasin ?? '-'}`;

  return `${ligne.magasin.code ?? 'MAG'} — ${ligne.magasin.libelle ?? ''}`;
}

function emplacementLabel(ligne: StockSortieLigne) {
  if (!ligne.emplacement) return '-';

  return (
    ligne.emplacement.code ||
    ligne.emplacement.libelle ||
    `Emplacement #${ligne.idEmplacement ?? '-'}`
  );
}

function materielLabel(ligne: StockSortieLigne) {
  if (!ligne.materiel) return '-';

  return (
    ligne.materiel.code ||
    ligne.materiel.numeroSerie ||
    `Matériel #${ligne.idMateriel ?? '-'}`
  );
}

export default function StockSortieDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.id);

  const [sortie, setSortie] = useState<StockSortie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSortie() {
    try {
      setLoading(true);
      setError('');

      const data = await getStockSortieById(id);

      setSortie(data as StockSortie);
    } catch {
      setError('Impossible de charger le détail du bon de sortie.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(id)) {
      loadSortie();
    }
  }, [id]);

  const lignes = useMemo(() => {
    if (!sortie) return [];
    return getLignes(sortie);
  }, [sortie]);

  const totalQuantite = useMemo(() => {
    return lignes.reduce((total, ligne) => {
      return total + Math.abs(Number(ligne.quantite ?? 0));
    }, 0);
  }, [lignes]);

  const totalMateriels = useMemo(() => {
    return lignes.reduce((total, ligne) => {
      return total + (ligne.materiel || ligne.idMateriel ? 1 : 0);
    }, 0);
  }, [lignes]);

  function handleExportPdf() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    window.open(`${apiUrl}/stock/sorties/${id}/pdf`, '_blank');
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-8 shadow-sm">
          Chargement du détail...
        </div>
      </main>
    );
  }

  if (error || !sortie) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-100 bg-red-50 p-6 font-bold text-red-700">
          {error || 'Bon de sortie introuvable.'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                Module stock
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-950">
                Détail du bon de sortie
              </h1>

              <p className="mt-2 text-slate-500">
                Informations générales, lignes, quantités et matériels sortis.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Download size={18} />
                Exporter PDF
              </button>

              <button
                type="button"
                onClick={() => router.push('/stock/sorties')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Retour
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-4xl font-black text-slate-950">
                  {sortie.numero || `BS-${sortie.idSortieStock}`}
                </h2>

                <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-700">
                  {sortie.statut || 'VALIDEE'}
                </span>
              </div>

              <p className="mt-2 font-bold text-slate-500">
                ID : {sortie.idSortieStock}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatBox
                icon={CalendarDays}
                label="Date"
                value={formatDate(sortie.dateSortie ?? sortie.date)}
              />

              <StatBox icon={Layers} label="Lignes" value={`${lignes.length}`} />

              <StatBox
                icon={Package}
                label="Quantité"
                value={`- ${totalQuantite}`}
              />

              <StatBox
                icon={Warehouse}
                label="Matériels"
                value={`${totalMateriels}`}
              />
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-400">
              <FileText size={20} />

              <p className="text-sm font-black uppercase tracking-wide">
                Commentaire
              </p>
            </div>

            <p className="mt-3 font-semibold text-slate-700">
              {sortie.commentaire || '-'}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-2xl font-black text-slate-950">
              Lignes du bon de sortie
            </h2>

            <p className="mt-1 text-slate-500">
              Vue tableau claire et professionnelle.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-sm font-black uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Magasin</th>
                  <th className="px-6 py-4">Quantité</th>
                  <th className="px-6 py-4">Prix unitaire</th>
                  <th className="px-6 py-4">Emplacement</th>
                  <th className="px-6 py-4">Matériel</th>
                  <th className="px-6 py-4">Commentaire</th>
                </tr>
              </thead>

              <tbody>
                {lignes.length ? (
                  lignes.map((ligne, index) => (
                    <tr
                      key={ligne.idLigneSortieStock ?? index}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-950">
                          {articleLabel(ligne)}
                        </p>

                        <p className="text-sm font-semibold text-slate-400">
                          ID article : {ligne.idArticle ?? '-'}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-700">
                          {magasinLabel(ligne)}
                        </p>

                        <p className="text-sm font-semibold text-slate-400">
                          ID magasin : {ligne.idMagasin ?? '-'}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-red-50 px-4 py-2 font-black text-red-700">
                          - {Math.abs(Number(ligne.quantite ?? 0))}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-black text-slate-800">
                        {formatPrix(ligne.prixUnitaire)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600">
                          {emplacementLabel(ligne)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {ligne.materiel ? (
                          <div className="rounded-2xl bg-slate-50 px-3 py-2">
                            <p className="font-black text-slate-900">
                              {materielLabel(ligne)}
                            </p>

                            <p className="text-sm font-semibold text-slate-400">
                              SN : {ligne.materiel.numeroSerie || '-'}
                            </p>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-400">
                            Aucun matériel
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 font-semibold text-slate-500">
                        {ligne.commentaire || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-slate-500">
                      Aucune ligne enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

type IconType = ComponentType<{ size?: number; className?: string }>;

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[145px] rounded-2xl bg-slate-50 p-4">
      <Icon size={20} className="text-slate-400" />

      <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}