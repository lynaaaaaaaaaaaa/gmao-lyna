'use client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  FileText,
   Download,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
} from 'lucide-react';

const API_URL = 'http://localhost:3001';

type Article = {
  idArticle: number;
  reference?: string | null;
  designation?: string | null;
  libelle?: string | null;
  serialise?: boolean | null;
};

type Magasin = {
  idMagasin: number;
  code?: string | null;
  libelle?: string | null;
};

type LigneSortie = {
  idLigneSortieStock: number;
  idSortieStock: number;
  idArticle: number;
  idMagasin: number;
  quantite: number | string;
  prixUnitaire?: number | string | null;
  commentaire?: string | null;
  article?: Article | null;
  magasin?: Magasin | null;
};

type SortieStock = {
  idSortieStock: number;
  numero: string;
  dateSortie: string;
  commentaire?: string | null;
  statut: string;
  lignes?: LigneSortie[];
  sortie_stock_ligne?: LigneSortie[];
};

type StockDisponible = {
  idStock: number;
  idArticle: number;
  idMagasin: number;
  quantitePhysique: number | string;
  quantiteReservee: number | string;
  quantiteDisponible: number | string;
  article?: Article | null;
  magasin?: Magasin | null;
};

type LigneEdit = {
  quantite: string;
  prixUnitaire: string;
  commentaire: string;
};

type NewLine = {
  stockKey: string;
  quantite: string;
  prixUnitaire: string;
  commentaire: string;
};

function toNumber(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('fr-FR');
}

function toInputDate(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getLignes(sortie: SortieStock | null) {
  if (!sortie) return [];

  return sortie.lignes ?? sortie.sortie_stock_ligne ?? [];
}

function getArticleLabel(article?: Article | null) {
  if (!article) return 'Article';

  return (
    article.reference ??
    article.designation ??
    article.libelle ??
    `Article #${article.idArticle}`
  );
}

function getMagasinLabel(magasin?: Magasin | null) {
  if (!magasin) return 'Magasin';

  const code = magasin.code ?? `MAG-${magasin.idMagasin}`;
  const libelle = magasin.libelle ?? '';

  return libelle ? `${code} — ${libelle}` : code;
}

function getApiError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Une erreur est survenue.';
}

async function handleResponse<T>(response: Response, message: string): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (Array.isArray(data?.message)) {
      throw new Error(data.message.join(', '));
    }

    throw new Error(data?.message ?? message);
  }

  return data as T;
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
export default function DetailSortieStockPage() {
  const router = useRouter();
  const params = useParams();

  const sortieId = Number(params?.id);

  const [sortie, setSortie] = useState<SortieStock | null>(null);
  const [stocks, setStocks] = useState<StockDisponible[]>([]);

  const [dateSortie, setDateSortie] = useState('');
  const [commentaire, setCommentaire] = useState('');

  const [lineEdits, setLineEdits] = useState<Record<number, LigneEdit>>({});

  const [newLine, setNewLine] = useState<NewLine>({
    stockKey: '',
    quantite: '1',
    prixUnitaire: '',
    commentaire: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingLineId, setSavingLineId] = useState<number | null>(null);
  const [addingLine, setAddingLine] = useState(false);
  const [deletingLineId, setDeletingLineId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const lignes = useMemo(() => getLignes(sortie), [sortie]);

  const totalQuantite = useMemo(() => {
    return lignes.reduce((sum, ligne) => sum + toNumber(ligne.quantite), 0);
  }, [lignes]);

  const stocksNonSerialises = useMemo(() => {
    return stocks.filter((stock) => {
      const disponible = toNumber(stock.quantiteDisponible);
      const serialise = stock.article?.serialise === true;

      return disponible > 0 && !serialise;
    });
  }, [stocks]);
  function handleExportSortiePdf() {
  if (!sortie) return;

  const lignes = getLignes(sortie);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 14;

  const totalQuantitePdf = lignes.reduce(
    (sum, ligne) => sum + toNumber(ligne.quantite),
    0,
  );

  const totalMontantPdf = lignes.reduce((sum, ligne) => {
    const qte = toNumber(ligne.quantite);
    const prix = toNumber(ligne.prixUnitaire);
    return sum + qte * prix;
  }, 0);

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
  doc.text('BON DE SORTIE STOCK', pageWidth - marginX, 14, {
    align: 'right',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Numero : ${safePdfText(sortie.numero)}`, pageWidth - marginX, 21, {
    align: 'right',
  });

  // Bloc infos
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
  doc.text('Date de sortie', marginX + 55, infoY + 15);
  doc.text('Statut', marginX + 105, infoY + 15);

  doc.setFont('helvetica', 'normal');
  doc.text(safePdfText(sortie.numero), marginX + 5, infoY + 23);
  doc.text(formatPdfDate(sortie.dateSortie), marginX + 55, infoY + 23);
  doc.text(safePdfText(sortie.statut), marginX + 105, infoY + 23);

  doc.setFont('helvetica', 'bold');
  doc.text('Commentaire', marginX + 5, infoY + 31);

  doc.setFont('helvetica', 'normal');
  const commentaireText = sortie.commentaire?.trim() || '-';
  doc.text(commentaireText.slice(0, 110), marginX + 35, infoY + 31);

  // Résumé
  const resumeY = infoY + 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Résumé', marginX, resumeY);

  const cardWidth = (pageWidth - marginX * 2 - 8) / 3;
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
  drawCard(marginX + cardWidth + 4, 'Quantité totale', String(totalQuantitePdf));
  drawCard(
    marginX + (cardWidth + 4) * 2,
    'Montant total',
    formatPdfMoney(totalMontantPdf),
  );

  // Tableau lignes
  const tableY = cardY + 34;

  const rows = lignes.map((ligne, index) => {
    const qte = toNumber(ligne.quantite);
    const prix = toNumber(ligne.prixUnitaire);
    const total = qte * prix;

    return [
      String(index + 1),
      getArticleLabel(ligne.article),
      getMagasinLabel(ligne.magasin),
      String(qte),
      prix > 0 ? formatPdfMoney(prix) : '-',
      prix > 0 ? formatPdfMoney(total) : '-',
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
        'Commentaire',
      ],
    ],
    body: rows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
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
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 34 },
      2: { cellWidth: 38 },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 25 },
      6: { cellWidth: 34 },
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
        `Généré le ${new Date().toLocaleString('fr-FR')}`,
        marginX,
        pageHeight - 10,
      );

      doc.text(`Page ${pageNumber}`, pageWidth - marginX, pageHeight - 10, {
        align: 'right',
      });
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? tableY + 20;

  // Total final
  const totalBoxY = finalY + 8;

  if (totalBoxY < pageHeight - 35) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - 88, totalBoxY, 74, 25, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text('TOTAL GENERAL', pageWidth - 83, totalBoxY + 9);

    doc.setFontSize(12);
    doc.text(formatPdfMoney(totalMontantPdf), pageWidth - 19, totalBoxY + 19, {
      align: 'right',
    });
  }

  const fileName = `Bon-sortie-${sortie.numero || sortie.idSortieStock}.pdf`;
  doc.save(fileName);
}

  async function loadData() {
    if (!sortieId || Number.isNaN(sortieId)) {
      setError('Identifiant du bon de sortie invalide.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [sortieResponse, stocksResponse] = await Promise.all([
        fetch(`${API_URL}/stock/sorties/${sortieId}`, {
          cache: 'no-store',
        }),
        fetch(`${API_URL}/stock`, {
          cache: 'no-store',
        }),
      ]);

      const sortieData = await handleResponse<SortieStock>(
        sortieResponse,
        'Erreur lors du chargement du bon de sortie.',
      );

      const stockData = await handleResponse<StockDisponible[]>(
        stocksResponse,
        'Erreur lors du chargement du stock disponible.',
      );

      setSortie(sortieData);
      setStocks(stockData);

      setDateSortie(toInputDate(sortieData.dateSortie));
      setCommentaire(sortieData.commentaire ?? '');

      const initialEdits: Record<number, LigneEdit> = {};

      getLignes(sortieData).forEach((ligne) => {
        initialEdits[ligne.idLigneSortieStock] = {
          quantite: String(toNumber(ligne.quantite)),
          prixUnitaire:
            ligne.prixUnitaire === null || ligne.prixUnitaire === undefined
              ? ''
              : String(ligne.prixUnitaire),
          commentaire: ligne.commentaire ?? '',
        };
      });

      setLineEdits(initialEdits);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortieId]);

  async function handleUpdateHeader() {
    if (!sortie) return;

    try {
      setSavingHeader(true);
      setError('');

      const response = await fetch(`${API_URL}/stock/sorties/${sortie.idSortieStock}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateSortie,
          commentaire: commentaire.trim() || null,
        }),
      });

      const updated = await handleResponse<SortieStock>(
        response,
        'Erreur lors de la modification du bon de sortie.',
      );

      setSortie(updated);
      setDateSortie(toInputDate(updated.dateSortie));
      setCommentaire(updated.commentaire ?? '');

      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSavingHeader(false);
    }
  }

  async function handleUpdateLine(ligne: LigneSortie) {
    const edit = lineEdits[ligne.idLigneSortieStock];

    if (!edit) return;

    const quantite = Number(edit.quantite);

    if (!quantite || quantite <= 0) {
      setError('La quantité doit être supérieure à 0.');
      return;
    }

    try {
      setSavingLineId(ligne.idLigneSortieStock);
      setError('');

      const body = {
        quantite,
        prixUnitaire:
          edit.prixUnitaire.trim() === ''
            ? undefined
            : Number(edit.prixUnitaire),
        commentaire: edit.commentaire.trim() || null,
      };

      const response = await fetch(
        `${API_URL}/stock/sorties/${sortieId}/lignes/${ligne.idLigneSortieStock}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      await handleResponse<SortieStock>(
        response,
        'Erreur lors de la modification de la ligne.',
      );

      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSavingLineId(null);
    }
  }

  async function handleDeleteLine(ligne: LigneSortie) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette ligne du bon de sortie ?',
    );

    if (!confirmed) return;

    try {
      setDeletingLineId(ligne.idLigneSortieStock);
      setError('');

      const response = await fetch(
        `${API_URL}/stock/sorties/${sortieId}/lignes/${ligne.idLigneSortieStock}`,
        {
          method: 'DELETE',
        },
      );

      await handleResponse<SortieStock>(
        response,
        'Erreur lors de la suppression de la ligne.',
      );

      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDeletingLineId(null);
    }
  }

  async function handleAddLine() {
    if (!newLine.stockKey) {
      setError('Veuillez choisir un article disponible.');
      return;
    }

    const [idArticleRaw, idMagasinRaw] = newLine.stockKey.split('-');

    const idArticle = Number(idArticleRaw);
    const idMagasin = Number(idMagasinRaw);
    const quantite = Number(newLine.quantite);

    if (!idArticle || !idMagasin) {
      setError('Article ou magasin invalide.');
      return;
    }

    if (!quantite || quantite <= 0) {
      setError('La quantité doit être supérieure à 0.');
      return;
    }

    try {
      setAddingLine(true);
      setError('');

      const body = {
        idArticle,
        idMagasin,
        quantite,
        prixUnitaire:
          newLine.prixUnitaire.trim() === ''
            ? undefined
            : Number(newLine.prixUnitaire),
        commentaire: newLine.commentaire.trim() || null,
      };

      const response = await fetch(`${API_URL}/stock/sorties/${sortieId}/lignes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      await handleResponse<SortieStock>(
        response,
        'Erreur lors de l’ajout de la ligne.',
      );

      setNewLine({
        stockKey: '',
        quantite: '1',
        prixUnitaire: '',
        commentaire: '',
      });

      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setAddingLine(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px] space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-[28px] border border-slate-200 bg-white shadow-sm"
            />
          ))}
        </div>
      </main>
    );
  }

  if (!sortie) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px] rounded-[28px] border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
          {error || 'Bon de sortie introuvable.'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Module stock
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-950">
                Bon de sortie {sortie.numero}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                  {sortie.statut}
                </span>

                <span className="text-sm font-bold text-slate-500">
                  ID : {sortie.idSortieStock}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/stock/sorties')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Retour
              </button>

              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCcw size={18} />
                Actualiser
              </button>
              <button
  type="button"
  onClick={handleExportSortiePdf}
  disabled={!sortie}
  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
>
  <Download className="h-4 w-4" />
  Exporter PDF
</button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarDays className="text-slate-400" size={24} />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Date
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {formatDate(sortie.dateSortie)}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <FileText className="text-blue-500" size={24} />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Lignes
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {lignes.length}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <Boxes className="text-red-500" size={24} />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Quantité sortie
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {totalQuantite}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <Save className="text-emerald-500" size={24} />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Statut
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {sortie.statut}
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Informations du bon
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Vous pouvez modifier la date et le commentaire.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpdateHeader}
              disabled={savingHeader}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b4a5f] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#07394a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {savingHeader ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-[360px_1fr]">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Date de sortie
              </label>

              <input
                type="date"
                value={dateSortie}
                onChange={(e) => setDateSortie(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Commentaire
              </label>

              <input
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Commentaire du bon de sortie..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-2xl font-black text-slate-950">
              Lignes du bon de sortie
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Modifier ou supprimer une ligne corrige automatiquement le stock côté backend.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Article
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Magasin
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Qté
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Prix
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Commentaire
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {lignes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm font-bold text-slate-400"
                    >
                      Aucune ligne dans ce bon de sortie.
                    </td>
                  </tr>
                ) : (
                  lignes.map((ligne) => {
                    const edit = lineEdits[ligne.idLigneSortieStock] ?? {
                      quantite: String(toNumber(ligne.quantite)),
                      prixUnitaire:
                        ligne.prixUnitaire === null || ligne.prixUnitaire === undefined
                          ? ''
                          : String(ligne.prixUnitaire),
                      commentaire: ligne.commentaire ?? '',
                    };

                    return (
                      <tr
                        key={ligne.idLigneSortieStock}
                        className="border-t border-slate-100"
                      >
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-800">
                            {getArticleLabel(ligne.article)}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            ID article : {ligne.idArticle}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-black text-slate-800">
                            {getMagasinLabel(ligne.magasin)}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            ID magasin : {ligne.idMagasin}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={edit.quantite}
                            onChange={(e) =>
                              setLineEdits((prev) => ({
                                ...prev,
                                [ligne.idLigneSortieStock]: {
                                  ...edit,
                                  quantite: e.target.value,
                                },
                              }))
                            }
                            className="h-12 w-36 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={edit.prixUnitaire}
                            onChange={(e) =>
                              setLineEdits((prev) => ({
                                ...prev,
                                [ligne.idLigneSortieStock]: {
                                  ...edit,
                                  prixUnitaire: e.target.value,
                                },
                              }))
                            }
                            placeholder="Prix"
                            className="h-12 w-40 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <input
                            value={edit.commentaire}
                            onChange={(e) =>
                              setLineEdits((prev) => ({
                                ...prev,
                                [ligne.idLigneSortieStock]: {
                                  ...edit,
                                  commentaire: e.target.value,
                                },
                              }))
                            }
                            placeholder="Commentaire"
                            className="h-12 w-64 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateLine(ligne)}
                              disabled={savingLineId === ligne.idLigneSortieStock}
                              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b4a5f] text-white shadow-sm transition hover:bg-[#07394a] disabled:cursor-not-allowed disabled:opacity-60"
                              title="Enregistrer la ligne"
                            >
                              <Save size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteLine(ligne)}
                              disabled={deletingLineId === ligne.idLigneSortieStock}
                              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              title="Supprimer la ligne"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-2xl font-black text-slate-950">
              Ajouter une nouvelle ligne
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Seuls les articles non sérialisés avec stock disponible sont affichés.
            </p>
          </div>

          <div className="grid gap-4 p-6 xl:grid-cols-[1.4fr_180px_180px_1fr_160px]">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Article / magasin
              </label>

              <select
                value={newLine.stockKey}
                onChange={(e) =>
                  setNewLine((prev) => ({
                    ...prev,
                    stockKey: e.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
              >
                <option value="">Choisir un article disponible</option>

                {stocksNonSerialises.map((stock) => (
                  <option
                    key={`${stock.idArticle}-${stock.idMagasin}`}
                    value={`${stock.idArticle}-${stock.idMagasin}`}
                  >
                    {getArticleLabel(stock.article)} / {getMagasinLabel(stock.magasin)} — dispo :{' '}
                    {toNumber(stock.quantiteDisponible)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Quantité
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newLine.quantite}
                onChange={(e) =>
                  setNewLine((prev) => ({
                    ...prev,
                    quantite: e.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Prix
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={newLine.prixUnitaire}
                onChange={(e) =>
                  setNewLine((prev) => ({
                    ...prev,
                    prixUnitaire: e.target.value,
                  }))
                }
                placeholder="Prix"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Commentaire
              </label>

              <input
                value={newLine.commentaire}
                onChange={(e) =>
                  setNewLine((prev) => ({
                    ...prev,
                    commentaire: e.target.value,
                  }))
                }
                placeholder="Commentaire"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0b4a5f]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddLine}
                disabled={addingLine}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b4a5f] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#07394a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={18} />
                {addingLine ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}