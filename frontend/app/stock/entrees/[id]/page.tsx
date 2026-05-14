'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { getStockEntreeById } from '@/features/stock-entrees/services/stock-entree.service';
import type {
  StockEntree,
  StockEntreeLigne,
} from '@/features/stock-entrees/types/stock-entree';

function formatDate(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR');
}

function formatPrix(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '-';

  return `${Number(value).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DZD`;
}

function articleLabel(ligne: StockEntreeLigne) {
  return (
    ligne.article?.reference ||
    ligne.article?.designation ||
    `Article #${ligne.idArticle}`
  );
}

function articleDescription(ligne: StockEntreeLigne) {
  if (
    ligne.article?.reference &&
    ligne.article?.designation &&
    ligne.article.reference !== ligne.article.designation
  ) {
    return `${ligne.article.reference} — ${ligne.article.designation}`;
  }

  return articleLabel(ligne);
}

function magasinLabel(ligne: StockEntreeLigne) {
  return ligne.magasin
    ? `${ligne.magasin.code} — ${ligne.magasin.libelle}`
    : `Magasin #${ligne.idMagasin}`;
}

function getTotalQuantite(entree: StockEntree) {
  return (
    entree.lignes?.reduce(
      (total, ligne) => total + Number(ligne.quantite ?? 0),
      0,
    ) ?? 0
  );
}

function getTotalMateriels(entree: StockEntree) {
  return (
    entree.lignes?.reduce(
      (total, ligne) => total + (ligne.materiels?.length ?? 0),
      0,
    ) ?? 0
  );
}

function exportBonEntreePdf(entree: StockEntree) {
  const doc = new jsPDF('p', 'mm', 'a4');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  const totalQuantite = getTotalQuantite(entree);
  const totalMateriels = getTotalMateriels(entree);

  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pageWidth - 20, 277);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(`BON D’ENTRÉE STOCK N° ${entree.numero}`, pageWidth / 2, 20, {
    align: 'center',
  });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date :', 145, 31);

  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(entree.dateReception), 158, 31);

  doc.setFontSize(8);
  doc.text('Votre logo', margin, 20);

  doc.setDrawColor(90, 90, 90);
  doc.rect(margin, 38, 86, 34);
  doc.rect(110, 38, 86, 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ÉMETTEUR', margin + 3, 44);

  doc.setFont('helvetica', 'normal');
  doc.text('BMT SPA', margin + 3, 50);
  doc.text('Gestion des équipements et maintenance', margin + 3, 55);
  doc.text('Module stock', margin + 3, 60);
  doc.text('Port - Maintenance - Équipements', margin + 3, 65);

  doc.setFont('helvetica', 'bold');
  doc.text('BON D’ENTRÉE', 113, 44);

  doc.setFont('helvetica', 'normal');
  doc.text(`N° bon : ${entree.numero}`, 113, 50);
  doc.text(`Statut : ${entree.statut || '-'}`, 113, 55);
  doc.text(`ID bon : ${entree.idEntreeStock}`, 113, 60);
  doc.text(`Lignes : ${entree.lignes?.length ?? 0}`, 113, 65);

  doc.setFont('helvetica', 'bold');
  doc.text(`Réception du : ${formatDate(entree.dateReception)}`, pageWidth / 2, 82, {
    align: 'center',
  });

  const tableRows =
    entree.lignes?.map((ligne) => [
      articleLabel(ligne),
      articleDescription(ligne),
      magasinLabel(ligne),
      String(Number(ligne.quantite ?? 0)),
      formatPrix(ligne.prixUnitaire),
      ligne.numeroLot || '-',
      formatDate(ligne.datePeremption),
      ligne.materiels?.length
        ? ligne.materiels
            .map(
              (materiel) =>
                `${materiel.code || `#${materiel.idMateriel}`} / SN: ${
                  materiel.numeroSerie || '-'
                }`,
            )
            .join('\n')
        : '-',
    ]) ?? [];

  autoTable(doc, {
    startY: 88,
    margin: { left: margin, right: margin },
    head: [
      [
        'Référence',
        'Description',
        'Magasin',
        'Qté',
        'Prix unit.',
        'Lot',
        'Péremption',
        'Matériels',
      ],
    ],
    body: tableRows.length
      ? tableRows
      : [['-', 'Aucune ligne enregistrée', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 2,
      textColor: [20, 20, 20],
      lineColor: [120, 120, 120],
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [20, 20, 20],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 35 },
      2: { cellWidth: 32 },
      3: { cellWidth: 13, halign: 'center' },
      4: { cellWidth: 22 },
      5: { cellWidth: 18 },
      6: { cellWidth: 22 },
      7: { cellWidth: 26 },
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY ?? 110;

  let y = finalY + 10;

  if (y > 225) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(90, 90, 90);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Résumé du bon :', margin, y);

  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(`Quantité totale : ${totalQuantite}`, margin, y);
  doc.text(`Matériels générés : ${totalMateriels}`, margin + 70, y);
  doc.text(`Nombre de lignes : ${entree.lignes?.length ?? 0}`, margin + 130, y);

  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Commentaire :', margin, y);

  y += 5;

  doc.setFont('helvetica', 'normal');
  const commentaire = doc.splitTextToSize(entree.commentaire || '-', 175);
  doc.text(commentaire, margin, y);

  y += Math.max(15, commentaire.length * 5 + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Date de réception et visa :', margin, y);
  doc.text('Contrôle stock :', 115, y);

  doc.rect(margin, y + 5, 75, 25);
  doc.rect(115, y + 5, 81, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Nom / Signature :', margin + 3, y + 13);
  doc.text('Validation magasinier :', 118, y + 13);

  const fileName = `bon-entree-${entree.numero || entree.idEntreeStock}.pdf`;
  doc.save(fileName);
}

export default function DetailEntreeStockPage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.id);

  const [entree, setEntree] = useState<StockEntree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEntree() {
      try {
        setLoading(true);
        setError('');

        const data = await getStockEntreeById(id);
        setEntree(data);
      } catch {
        setError("Impossible de charger le détail du bon d'entrée.");
      } finally {
        setLoading(false);
      }
    }

    if (!Number.isNaN(id)) {
      loadEntree();
    }
  }, [id]);

  const totalQuantite = useMemo(() => {
    return entree ? getTotalQuantite(entree) : 0;
  }, [entree]);

  const totalMateriels = useMemo(() => {
    return entree ? getTotalMateriels(entree) : 0;
  }, [entree]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-8 shadow-sm">
          Chargement du détail...
        </div>
      </main>
    );
  }

  if (error || !entree) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-100 bg-red-50 p-6 font-bold text-red-700">
          {error || "Bon d'entrée introuvable."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1450px] px-6 py-10 lg:px-8">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                Module stock
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-950">
                Détail du bon d’entrée
              </h1>

              <p className="mt-2 text-slate-500">
                Informations générales, lignes, quantités et matériels générés.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => exportBonEntreePdf(entree)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Download size={18} />
                Exporter PDF
              </button>

              <button
                type="button"
                onClick={() => router.push('/stock/entrees')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Retour
              </button>
            </div>
          </div>
        </section>

        <div className="h-10" />

        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-4xl font-black text-slate-950">
                  {entree.numero}
                </h2>

                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                  {entree.statut}
                </span>
              </div>

              <p className="mt-3 font-bold text-slate-500">
                ID : {entree.idEntreeStock}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatBox
                icon={CalendarDays}
                label="Date"
                value={formatDate(entree.dateReception)}
              />

              <StatBox
                icon={Layers}
                label="Lignes"
                value={`${entree.lignes?.length ?? 0}`}
              />

              <StatBox
                icon={Package}
                label="Quantité"
                value={`+ ${totalQuantite}`}
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
              {entree.commentaire || '-'}
            </p>
          </div>
        </section>

        <div className="h-10" />

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-2xl font-black text-slate-950">
              Lignes du bon d’entrée
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
                  <th className="px-6 py-4">Lot</th>
                  <th className="px-6 py-4">Péremption</th>
                  <th className="px-6 py-4">Matériels</th>
                </tr>
              </thead>

              <tbody>
                {entree.lignes?.length ? (
                  entree.lignes.map((ligne) => (
                    <tr
                      key={ligne.idLigneEntreeStock}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-950">
                          {articleLabel(ligne)}
                        </p>

                        <p className="text-sm font-semibold text-slate-400">
                          ID article : {ligne.idArticle}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-700">
                          {magasinLabel(ligne)}
                        </p>

                        <p className="text-sm font-semibold text-slate-400">
                          ID magasin : {ligne.idMagasin}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-emerald-50 px-4 py-2 font-black text-emerald-700">
                          + {Number(ligne.quantite)}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-black text-slate-800">
                        {formatPrix(ligne.prixUnitaire)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600">
                          {ligne.numeroLot || '-'}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-bold text-slate-700">
                        {formatDate(ligne.datePeremption)}
                      </td>

                      <td className="px-6 py-5">
                        {ligne.materiels?.length ? (
                          <div className="space-y-2">
                            {ligne.materiels.map((materiel) => (
                              <div
                                key={materiel.idMateriel}
                                className="rounded-2xl bg-slate-50 px-3 py-2"
                              >
                                <p className="font-black text-slate-900">
                                  {materiel.code ||
                                    `Matériel #${materiel.idMateriel}`}
                                </p>

                                <p className="text-sm font-semibold text-slate-400">
                                  SN : {materiel.numeroSerie || '-'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-400">
                            Aucun matériel
                          </span>
                        )}
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