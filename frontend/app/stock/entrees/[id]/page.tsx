'use client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Layers,
  Package,
  Plus,
  Download,
  RefreshCcw,
  Save,
  Trash2,
  Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { getArticles } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/magasins/services/magasin.service';

import {
  addStockEntreeLigne,
  deleteStockEntreeLigne,
  getStockEntreeById,
  updateStockEntree,
  updateStockEntreeLigne,
} from '@/features/stock-entrees/services/stock-entree.service';

import type {
  LigneStockEntreeDto,
  StockEntree,
  StockEntreeLigne,
} from '@/features/stock-entrees/types/stock-entree';

type ArticleOption = {
  idArticle: number;
  reference?: string | null;
  designation?: string | null;
  serialise?: boolean | null;
  gereEnStock?: boolean | null;
};

type MagasinOption = {
  idMagasin: number;
  code?: string | null;
  libelle?: string | null;
};

type LigneForm = {
  idArticle: string;
  idMagasin: string;
  idEmplacement: string;
  quantite: string;
  prixUnitaire: string;
  numeroLot: string;
  datePeremption: string;
  commentaire: string;
};

function createEmptyLine(): LigneForm {
  return {
    idArticle: '',
    idMagasin: '',
    idEmplacement: '',
    quantite: '1',
    prixUnitaire: '',
    numeroLot: '',
    datePeremption: '',
    commentaire: '',
  };
}

function toInputDate(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('fr-FR');
}

function formatQty(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  });
}

function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '-';

  return `${Number(value).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DA`;
}

function articleLabel(ligne: StockEntreeLigne) {
  return (
    ligne.article?.reference ||
    ligne.article?.designation ||
    `Article #${ligne.idArticle}`
  );
}

function magasinLabel(ligne: StockEntreeLigne) {
  if (!ligne.magasin) return `Magasin #${ligne.idMagasin}`;

  return `${ligne.magasin.code ?? ''} — ${ligne.magasin.libelle ?? ''}`;
}

function ligneToForm(ligne: StockEntreeLigne): LigneForm {
  return {
    idArticle: String(ligne.idArticle),
    idMagasin: String(ligne.idMagasin),
    idEmplacement: ligne.idEmplacement ? String(ligne.idEmplacement) : '',
    quantite: String(Number(ligne.quantite ?? 0)),
    prixUnitaire:
      ligne.prixUnitaire !== null && ligne.prixUnitaire !== undefined
        ? String(Number(ligne.prixUnitaire))
        : '',
    numeroLot: ligne.numeroLot ?? '',
    datePeremption: toInputDate(ligne.datePeremption),
    commentaire: ligne.commentaire ?? '',
  };
}

function buildLignePayload(form: LigneForm): LigneStockEntreeDto {
  return {
    idArticle: Number(form.idArticle),
    idMagasin: Number(form.idMagasin),
    idEmplacement: form.idEmplacement
      ? Number(form.idEmplacement)
      : undefined,
    quantite: Number(form.quantite),
    prixUnitaire:
      form.prixUnitaire.trim() !== ''
        ? Number(form.prixUnitaire)
        : undefined,
    numeroLot: form.numeroLot.trim() || undefined,
    datePeremption: form.datePeremption || undefined,
    commentaire: form.commentaire.trim() || undefined,
  };
}

function isSerializedLine(ligne: StockEntreeLigne) {
  return Boolean(ligne.article?.serialise || ligne.materiels?.length);
}
function toPdfNumber(value?: number | string | null) {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) return 0;

  return numberValue;
}

function formatPdfDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('fr-FR');
}

function formatPdfMoney(value: number) {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
  }).format(value);
}

function safePdfText(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';

  return String(value);
}
export default function DetailEntreeStockPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = Number(params.id);

  const [entree, setEntree] = useState<StockEntree | null>(null);
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [magasins, setMagasins] = useState<MagasinOption[]>([]);

  const [dateReception, setDateReception] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [ligneForms, setLigneForms] = useState<Record<number, LigneForm>>({});
  const [newLine, setNewLine] = useState<LigneForm>(createEmptyLine());

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const [entreeData, articlesData, magasinsData] = await Promise.all([
        getStockEntreeById(id),
        getArticles(),
        getMagasins(),
      ]);

      setEntree(entreeData);
      setArticles(articlesData as unknown as ArticleOption[]);
      setMagasins(magasinsData as unknown as MagasinOption[]);

      setDateReception(toInputDate(entreeData.dateReception));
      setCommentaire(entreeData.commentaire ?? '');

      const forms: Record<number, LigneForm> = {};

      for (const ligne of entreeData.lignes ?? []) {
        forms[ligne.idLigneEntreeStock] = ligneToForm(ligne);
      }

      setLigneForms(forms);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le bon d'entrée.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(id)) {
      void loadData();
    }
  }, [id]);

  const totalQuantite = useMemo(() => {
    return (
      entree?.lignes?.reduce(
        (total, ligne) => total + Number(ligne.quantite ?? 0),
        0,
      ) ?? 0
    );
  }, [entree]);

  const totalMateriels = useMemo(() => {
    return (
      entree?.lignes?.reduce(
        (total, ligne) => total + (ligne.materiels?.length ?? 0),
        0,
      ) ?? 0
    );
  }, [entree]);
function handleExportEntreePdf() {
  if (!entree) return;

  const lignes = entree.lignes ?? [];

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 14;

  const totalQuantitePdf = lignes.reduce(
    (sum, ligne) => sum + toPdfNumber(ligne.quantite),
    0,
  );

  const totalMontantPdf = lignes.reduce((sum, ligne) => {
    const qte = toPdfNumber(ligne.quantite);
    const prix = toPdfNumber(ligne.prixUnitaire);

    return sum + qte * prix;
  }, 0);

  const totalMaterielsPdf = lignes.reduce(
    (sum, ligne) => sum + (ligne.materiels?.length ?? 0),
    0,
  );

  // Header moderne
  doc.setFillColor(7, 37, 56);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('GMAO BMT', marginX, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Port - Maintenance - Equipements - Stock', marginX, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text("BON D'ENTREE STOCK", pageWidth - marginX, 14, {
    align: 'right',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Numero : ${safePdfText(entree.numero)}`, pageWidth - marginX, 21, {
    align: 'right',
  });

  // Bloc informations
  const infoY = 42;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Informations du bon', marginX, infoY);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, infoY + 5, pageWidth - marginX * 2, 34, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Numero', marginX + 5, infoY + 15);
  doc.text('Date reception', marginX + 65, infoY + 15);
  doc.text('Statut', marginX + 125, infoY + 15);

  doc.setFont('helvetica', 'normal');
  doc.text(safePdfText(entree.numero), marginX + 5, infoY + 23);
  doc.text(formatPdfDate(entree.dateReception), marginX + 65, infoY + 23);
  doc.text(safePdfText(entree.statut), marginX + 125, infoY + 23);

  doc.setFont('helvetica', 'bold');
  doc.text('Commentaire', marginX + 5, infoY + 31);

  doc.setFont('helvetica', 'normal');
  doc.text((entree.commentaire?.trim() || '-').slice(0, 140), marginX + 42, infoY + 31);

  // Résumé
  const resumeY = infoY + 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resume', marginX, resumeY);

  const cardWidth = (pageWidth - marginX * 2 - 12) / 4;
  const cardY = resumeY + 5;

  function drawCard(x: number, title: string, value: string) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, cardY, cardWidth, 22, 3, 3, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(title, x + 5, cardY + 8);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(value, x + 5, cardY + 17);
  }

  drawCard(marginX, 'Nombre de lignes', String(lignes.length));
  drawCard(marginX + cardWidth + 4, 'Quantite totale', String(totalQuantitePdf));
  drawCard(marginX + (cardWidth + 4) * 2, 'Materiels', String(totalMaterielsPdf));
  drawCard(
    marginX + (cardWidth + 4) * 3,
    'Montant total',
    formatPdfMoney(totalMontantPdf),
  );

  // Tableau
  const tableY = cardY + 34;

  const rows = lignes.map((ligne, index) => {
    const qte = toPdfNumber(ligne.quantite);
    const prix = toPdfNumber(ligne.prixUnitaire);
    const total = qte * prix;

    const materiels =
      ligne.materiels && ligne.materiels.length > 0
        ? ligne.materiels
            .map((materiel) => {
              const code = materiel.code ?? '';
              const numeroSerie = materiel.numeroSerie ?? '';

              return [code, numeroSerie].filter(Boolean).join(' / ');
            })
            .filter(Boolean)
            .join(', ')
        : '-';

    return [
      String(index + 1),
      articleLabel(ligne),
      magasinLabel(ligne),
      String(qte),
      prix > 0 ? formatPdfMoney(prix) : '-',
      prix > 0 ? formatPdfMoney(total) : '-',
      ligne.numeroLot?.trim() || '-',
      formatPdfDate(ligne.datePeremption),
      materiels,
      ligne.commentaire?.trim() || '-',
    ];
  });

  autoTable(doc, {
    startY: tableY,
    head: [
      [
        '#',
        'Article',
        'Magasin',
        'Qte',
        'Prix unitaire',
        'Total',
        'Lot',
        'Peremption',
        'Materiels',
        'Commentaire',
      ],
    ],
    body: rows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [7, 37, 56],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      1: { cellWidth: 35 },
      2: { cellWidth: 40 },
      3: { halign: 'center', cellWidth: 13 },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'right', cellWidth: 24 },
      6: { cellWidth: 20 },
      7: { halign: 'center', cellWidth: 22 },
      8: { cellWidth: 42 },
      9: { cellWidth: 40 },
    },
    margin: {
      left: marginX,
      right: marginX,
    },
    didDrawPage: () => {
      const pageNumber = doc.getNumberOfPages();

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        `Genere le ${new Date().toLocaleString('fr-FR')}`,
        marginX,
        pageHeight - 10,
      );

      doc.text(`Page ${pageNumber}`, pageWidth - marginX, pageHeight - 10, {
        align: 'right',
      });
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? tableY + 20;
  const totalBoxY = finalY + 8;

  if (totalBoxY < pageHeight - 30) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - 92, totalBoxY, 78, 24, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text('TOTAL GENERAL', pageWidth - 87, totalBoxY + 9);

    doc.setFontSize(12);
    doc.text(formatPdfMoney(totalMontantPdf), pageWidth - 19, totalBoxY + 18, {
      align: 'right',
    });
  }

  const fileName = `Bon-entree-${entree.numero || entree.idEntreeStock}.pdf`;

  doc.save(fileName);
}
  function rebuildLigneForms(updated: StockEntree) {
    const forms: Record<number, LigneForm> = {};

    for (const ligne of updated.lignes ?? []) {
      forms[ligne.idLigneEntreeStock] = ligneToForm(ligne);
    }

    setLigneForms(forms);
  }

  function updateLigneForm(idLigne: number, updates: Partial<LigneForm>) {
    setLigneForms((prev) => ({
      ...prev,
      [idLigne]: {
        ...prev[idLigne],
        ...updates,
      },
    }));
  }

  function updateNewLine(updates: Partial<LigneForm>) {
    setNewLine((prev) => ({
      ...prev,
      ...updates,
    }));
  }

  function validateLine(form: LigneForm) {
    if (!form.idArticle) return 'Veuillez sélectionner un article.';
    if (!form.idMagasin) return 'Veuillez sélectionner un magasin.';

    const quantite = Number(form.quantite);

    if (!quantite || quantite <= 0) {
      return 'La quantité doit être supérieure à 0.';
    }

    if (form.prixUnitaire && Number(form.prixUnitaire) < 0) {
      return 'Le prix unitaire ne peut pas être négatif.';
    }

    return '';
  }

  async function handleRefresh() {
    await loadData();
  }

  async function handleSaveBon() {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      if (!dateReception) {
        setError('La date de réception est obligatoire.');
        return;
      }

      const updated = await updateStockEntree(id, {
        dateReception,
        commentaire: commentaire.trim() || undefined,
      });

      setEntree(updated);
      rebuildLigneForms(updated);
      setSuccess('Bon d’entrée modifié avec succès.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la modification du bon d'entrée.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveLine(ligne: StockEntreeLigne) {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const form = ligneForms[ligne.idLigneEntreeStock];

      if (!form) {
        setError('Formulaire de ligne introuvable.');
        return;
      }

      const validationError = validateLine(form);

      if (validationError) {
        setError(validationError);
        return;
      }

      const updated = await updateStockEntreeLigne(
        id,
        ligne.idLigneEntreeStock,
        buildLignePayload(form),
      );

      setEntree(updated);
      rebuildLigneForms(updated);
      setSuccess('Ligne modifiée avec succès.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la modification de la ligne.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteLine(ligne: StockEntreeLigne) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette ligne d'entrée ?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const updated = await deleteStockEntreeLigne(
        id,
        ligne.idLigneEntreeStock,
      );

      setEntree(updated);
      rebuildLigneForms(updated);
      setSuccess('Ligne supprimée avec succès.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression de la ligne.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddLine() {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const validationError = validateLine(newLine);

      if (validationError) {
        setError(validationError);
        return;
      }

      const selectedArticle = articles.find(
        (article) => article.idArticle === Number(newLine.idArticle),
      );

      if (selectedArticle?.serialise) {
        setError(
          "Cette page ajoute seulement les articles non sérialisés. Pour un article sérialisé, il faut aussi saisir les matériels.",
        );
        return;
      }

      const updated = await addStockEntreeLigne(id, buildLignePayload(newLine));

      setEntree(updated);
      rebuildLigneForms(updated);
      setNewLine(createEmptyLine());
      setSuccess('Nouvelle ligne ajoutée avec succès.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout de la ligne.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm">
          Chargement du bon d’entrée...
        </div>
      </main>
    );
  }

  if (!entree) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
          {error || "Bon d'entrée introuvable."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <div className="mx-auto w-full max-w-[1420px] px-4 py-6 lg:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                Module stock
              </p>

              <h1 className="mt-1 text-2xl font-black text-slate-950 lg:text-3xl">
                Détail du bon d’entrée
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Modifier les informations du bon, ses lignes et corriger le
                stock automatiquement.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={actionLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCcw size={16} />
                Actualiser
              </button>

              <button
                type="button"
                onClick={() => router.push('/stock/entrees')}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
              <button
  type="button"
  onClick={handleExportEntreePdf}
  disabled={actionLoading || !entree}
  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
>
  <Download size={16} />
  Exporter PDF
</button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {success}
          </div>
        )}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-slate-950">
                  {entree.numero}
                </h2>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                  {entree.statut}
                </span>
              </div>

              <p className="mt-1 text-xs font-bold text-slate-400">
                Bon d’entrée #{entree.idEntreeStock}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={CalendarDays}
                label="Date"
                value={formatDate(entree.dateReception)}
              />

              <StatCard
                icon={Layers}
                label="Lignes"
                value={`${entree.lignes?.length ?? 0}`}
              />

              <StatCard
                icon={Package}
                label="Quantité"
                value={`+ ${formatQty(totalQuantite)}`}
              />

              <StatCard
                icon={Warehouse}
                label="Matériels"
                value={`${totalMateriels}`}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[210px_1fr_auto]">
            <div>
              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Date réception
              </label>

              <input
                type="date"
                value={dateReception}
                onChange={(event) => setDateReception(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Commentaire
              </label>

              <input
                value={commentaire}
                onChange={(event) => setCommentaire(event.target.value)}
                placeholder="Commentaire du bon"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSaveBon}
                disabled={actionLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#0b2f43] disabled:opacity-60"
              >
                <Save size={16} />
                Enregistrer
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-black text-slate-950">
              Lignes du bon d’entrée
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Vous pouvez modifier les quantités, prix, lots, dates de
              péremption et commentaires.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Magasin</th>
                  <th className="px-4 py-3">Qté</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Lot</th>
                  <th className="px-4 py-3">Péremption</th>
                  <th className="px-4 py-3">Commentaire</th>
                  <th className="sticky right-0 bg-slate-50 px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {entree.lignes?.length ? (
                  entree.lignes.map((ligne) => {
                    const form = ligneForms[ligne.idLigneEntreeStock];
                    const serialized = isSerializedLine(ligne);

                    if (!form) return null;

                    return (
                      <tr
                        key={ligne.idLigneEntreeStock}
                        className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-3">
                          <select
                            value={form.idArticle}
                            disabled={serialized}
                            onChange={(event) =>
                              updateLigneForm(ligne.idLigneEntreeStock, {
                                idArticle: event.target.value,
                              })
                            }
                            className="h-10 w-[230px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] disabled:bg-slate-100"
                          >
                            {articles.map((article) => (
                              <option
                                key={article.idArticle}
                                value={article.idArticle}
                              >
                                {article.reference || article.idArticle} —{' '}
                                {article.designation || 'Sans désignation'}
                              </option>
                            ))}
                          </select>

                          <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                            Actuel : {articleLabel(ligne)}
                          </p>

                          {serialized && (
                            <p className="mt-1 text-[11px] font-bold text-orange-600">
                              Article sérialisé
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={form.idMagasin}
                            disabled={serialized}
                            onChange={(event) =>
                              updateLigneForm(ligne.idLigneEntreeStock, {
                                idMagasin: event.target.value,
                              })
                            }
                            className="h-10 w-[210px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] disabled:bg-slate-100"
                          >
                            {magasins.map((magasin) => (
                              <option
                                key={magasin.idMagasin}
                                value={magasin.idMagasin}
                              >
                                {magasin.code} — {magasin.libelle}
                              </option>
                            ))}
                          </select>

                          <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                            {magasinLabel(ligne)}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={form.quantite}
                            disabled={serialized}
                            onChange={(event) =>
                              updateLigneForm(ligne.idLigneEntreeStock, {
                                quantite: event.target.value,
                              })
                            }
                            className="h-10 w-24 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 outline-none transition focus:border-[#0f3d56] disabled:bg-slate-100"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.prixUnitaire}
                            onChange={(event) =>
                              updateLigneForm(ligne.idLigneEntreeStock, {
                                prixUnitaire: event.target.value,
                              })
                            }
                            className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56]"
                          />

                          <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                            {formatPrice(ligne.prixUnitaire)}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <input
                            value={form.numeroLot}
                            placeholder="Lot"
                            onChange={(event) =>
                              updateLigneForm(ligne.idLigneEntreeStock, {
                                numeroLot: event.target.value,
                              })
                            }
                            className="h-10 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56]"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={form.datePeremption}
                            onChange={(event) =>
                              updateLigneForm(ligne.idLigneEntreeStock, {
                                datePeremption: event.target.value,
                              })
                            }
                            className="h-10 w-40 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56]"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            value={form.commentaire}
                            placeholder="Commentaire"
                            onChange={(event) =>
                              updateLigneForm(ligne.idLigneEntreeStock, {
                                commentaire: event.target.value,
                              })
                            }
                            className="h-10 w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56]"
                          />
                        </td>

                        <td className="sticky right-0 bg-white px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Enregistrer la ligne"
                              onClick={() => handleSaveLine(ligne)}
                              disabled={actionLoading}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f3d56] text-white shadow-sm transition hover:bg-[#0b2f43] disabled:opacity-60"
                            >
                              <Save size={16} />
                            </button>

                            <button
                              type="button"
                              title="Supprimer la ligne"
                              onClick={() => handleDeleteLine(ligne)}
                              disabled={actionLoading || serialized}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-sm font-semibold text-slate-500"
                    >
                      Aucune ligne enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Plus size={18} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Ajouter une nouvelle ligne
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  La ligne sera ajoutée au bon et le stock sera augmenté.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
              <div className="xl:col-span-3">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Article
                </label>

                <select
                  value={newLine.idArticle}
                  onChange={(event) =>
                    updateNewLine({
                      idArticle: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
                >
                  <option value="">Choisir un article</option>

                  {articles.map((article) => (
                    <option key={article.idArticle} value={article.idArticle}>
                      {article.reference || article.idArticle} —{' '}
                      {article.designation || 'Sans désignation'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-2">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Magasin
                </label>

                <select
                  value={newLine.idMagasin}
                  onChange={(event) =>
                    updateNewLine({
                      idMagasin: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
                >
                  <option value="">Choisir</option>

                  {magasins.map((magasin) => (
                    <option key={magasin.idMagasin} value={magasin.idMagasin}>
                      {magasin.code} — {magasin.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-1">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Qté
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newLine.quantite}
                  onChange={(event) =>
                    updateNewLine({
                      quantite: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
                />
              </div>

              <div className="xl:col-span-2">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Prix unitaire
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Prix"
                  value={newLine.prixUnitaire}
                  onChange={(event) =>
                    updateNewLine({
                      prixUnitaire: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
                />
              </div>

              <div className="xl:col-span-1">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Lot
                </label>

                <input
                  placeholder="Lot"
                  value={newLine.numeroLot}
                  onChange={(event) =>
                    updateNewLine({
                      numeroLot: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
                />
              </div>

              <div className="xl:col-span-2">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Péremption
                </label>

                <input
                  type="date"
                  value={newLine.datePeremption}
                  onChange={(event) =>
                    updateNewLine({
                      datePeremption: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
                />
              </div>

              <div className="xl:col-span-3">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Commentaire
                </label>

                <input
                  placeholder="Commentaire"
                  value={newLine.commentaire}
                  onChange={(event) =>
                    updateNewLine({
                      commentaire: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/10"
                />
              </div>

              <div className="flex items-end xl:col-span-2">
                <button
                  type="button"
                  onClick={handleAddLine}
                  disabled={actionLoading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#0b2f43] disabled:opacity-60"
                >
                  <Plus size={16} />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[135px] rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <Icon size={17} className="text-slate-400" />

      <p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}