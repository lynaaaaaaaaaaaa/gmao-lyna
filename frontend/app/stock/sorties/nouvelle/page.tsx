'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  PackageMinus,
  AlertCircle,
} from 'lucide-react';

type Article = {
  idArticle: number;
  reference?: string | null;
  designation?: string | null;
  serialise?: boolean | null;
};

type Magasin = {
  idMagasin: number;
  code?: string | null;
  libelle?: string | null;
};

type StockArticleMagasin = {
  idStock: number;
  idArticle: number;
  idMagasin: number;
  quantitePhysique: number | string;
  quantiteReservee: number | string;
  quantiteDisponible: number | string;
  article?: Article;
  magasin?: Magasin;
};

type Materiel = {
  idMateriel: number;
  code?: string | null;
  numeroSerie?: string | null;
  idArticle?: number | null;
  idMagasin?: number | null;
};

type LigneSortie = {
  idArticle: string;
  idMagasin: string;
  idMateriel: string;
  quantite: string;
  commentaire: string;
};

const API_URL = 'http://localhost:3001';

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export default function NouvelleSortieStockPage() {
  const router = useRouter();

  const [dateSortie, setDateSortie] = useState('');
  const [commentaire, setCommentaire] = useState('');

  const [articles, setArticles] = useState<Article[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [stocks, setStocks] = useState<StockArticleMagasin[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);

  const [lignes, setLignes] = useState<LigneSortie[]>([
    {
      idArticle: '',
      idMagasin: '',
      idMateriel: '',
      quantite: '1',
      commentaire: '',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [articlesRes, magasinsRes, stockRes, materielsRes] =
        await Promise.all([
          fetch(`${API_URL}/articles`),
          fetch(`${API_URL}/magasins`),
          fetch(`${API_URL}/stock`),
          fetch(`${API_URL}/materiels`),
        ]);

      if (!articlesRes.ok) throw new Error('Erreur chargement articles');
      if (!magasinsRes.ok) throw new Error('Erreur chargement magasins');
      if (!stockRes.ok) throw new Error('Erreur chargement stock');
      if (!materielsRes.ok) throw new Error('Erreur chargement matériels');

      setArticles(await articlesRes.json());
      setMagasins(await magasinsRes.json());
      setStocks(await stockRes.json());
      setMateriels(await materielsRes.json());
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDateSortie(today);
    loadData();
  }, []);

  const stockDisponibleMap = useMemo(() => {
    const map = new Map<string, number>();

    for (const stock of stocks) {
      const key = `${stock.idArticle}-${stock.idMagasin}`;
      map.set(key, toNumber(stock.quantiteDisponible));
    }

    return map;
  }, [stocks]);

  function getArticle(idArticle: string) {
    return articles.find((a) => a.idArticle === Number(idArticle));
  }

  function getDisponibilite(idArticle: string, idMagasin: string) {
    if (!idArticle || !idMagasin) return 0;
    return stockDisponibleMap.get(`${idArticle}-${idMagasin}`) ?? 0;
  }

  function updateLigne(index: number, field: keyof LigneSortie, value: string) {
    setLignes((prev) =>
      prev.map((ligne, i) => {
        if (i !== index) return ligne;

        const updated = {
          ...ligne,
          [field]: value,
        };

        if (field === 'idArticle') {
          updated.idMateriel = '';
          updated.quantite = '1';
        }

        if (field === 'idMagasin') {
          updated.idMateriel = '';
        }

        return updated;
      }),
    );
  }

  function ajouterLigne() {
    setLignes((prev) => [
      ...prev,
      {
        idArticle: '',
        idMagasin: '',
        idMateriel: '',
        quantite: '1',
        commentaire: '',
      },
    ]);
  }

  function supprimerLigne(index: number) {
    if (lignes.length === 1) return;

    setLignes((prev) => prev.filter((_, i) => i !== index));
  }

  function getMaterielsDisponibles(ligne: LigneSortie) {
    if (!ligne.idArticle || !ligne.idMagasin) return [];

    return materiels.filter((materiel) => {
      const sameArticle = Number(materiel.idArticle) === Number(ligne.idArticle);
      const sameMagasin = Number(materiel.idMagasin) === Number(ligne.idMagasin);

      return sameArticle && sameMagasin;
    });
  }

  function validateForm() {
    if (!dateSortie) {
      return 'La date de sortie est obligatoire.';
    }

    if (lignes.length === 0) {
      return 'Vous devez ajouter au moins une ligne.';
    }

    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const article = getArticle(ligne.idArticle);
      const quantite = Number(ligne.quantite);
      const disponible = getDisponibilite(ligne.idArticle, ligne.idMagasin);

      if (!ligne.idArticle) {
        return `Ligne ${i + 1} : veuillez sélectionner un article.`;
      }

      if (!ligne.idMagasin) {
        return `Ligne ${i + 1} : veuillez sélectionner un magasin.`;
      }

      if (!quantite || quantite <= 0) {
        return `Ligne ${i + 1} : la quantité doit être supérieure à 0.`;
      }

      if (quantite > disponible) {
        return `Ligne ${i + 1} : quantité insuffisante. Disponible : ${disponible}.`;
      }

      if (article?.serialise) {
        if (quantite !== 1) {
          return `Ligne ${i + 1} : pour un article sérialisé, la quantité doit être égale à 1.`;
        }

        if (!ligne.idMateriel) {
          return `Ligne ${i + 1} : veuillez choisir le matériel à sortir.`;
        }
      }
    }

    return '';
  }

  async function handleSubmit() {
    try {
      setError('');

      const validationError = validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true);

      const payload = {
        dateSortie,
        commentaire: commentaire.trim() || null,
        lignes: lignes.map((ligne) => {
          const article = getArticle(ligne.idArticle);

          return {
            idArticle: Number(ligne.idArticle),
            idMagasin: Number(ligne.idMagasin),
            idMateriel: article?.serialise ? Number(ligne.idMateriel) : undefined,
            quantite: Number(ligne.quantite),
            commentaire: ligne.commentaire.trim() || null,
          };
        }),
      };

      const res = await fetch(`${API_URL}/stock/sorties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Erreur lors de la sortie stock.');
      }

      router.push('/stock/mouvements');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l’enregistrement de la sortie stock.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-w-0 px-6 py-8 lg:px-10">
      <div className="space-y-7">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-slate-400">
                Module stock
              </p>

              <h1 className="mt-2 text-4xl font-black text-slate-950">
                Nouvelle sortie stock
              </h1>

              <p className="mt-2 text-lg text-slate-500">
                Enregistrez une sortie d’articles depuis un magasin.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push('/stock')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={19} />
                Retour
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-6 font-black text-white shadow-sm transition hover:bg-[#0b2f44] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={19} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 font-semibold text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6 lg:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <PackageMinus size={28} />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.35em] text-slate-400">
                  Bon de sortie
                </p>

                <h2 className="mt-1 text-3xl font-black text-slate-950">
                  Informations générales
                </h2>

                <p className="mt-1 text-slate-500">
                  La sortie diminuera automatiquement le stock disponible.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 lg:grid-cols-2 lg:p-8">
            <div>
              <label className="mb-2 block font-bold text-slate-800">
                Date de sortie <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                value={dateSortie}
                onChange={(e) => setDateSortie(e.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-[#0f3d56]/10"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-800">
                Commentaire général
              </label>

              <input
                type="text"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Exemple : sortie pour intervention"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-[#0f3d56]/10"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div>
              <h2 className="text-3xl font-black text-slate-950">
                Lignes de sortie
              </h2>

              <p className="mt-1 text-slate-500">
                Ajoutez les articles à sortir du stock.
              </p>
            </div>

            <button
              type="button"
              onClick={ajouterLigne}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-5 font-black text-white shadow-sm transition hover:bg-[#0b2f44]"
            >
              <Plus size={19} />
              Ajouter une ligne
            </button>
          </div>

          <div className="space-y-5 p-6 lg:p-8">
            {lignes.map((ligne, index) => {
              const article = getArticle(ligne.idArticle);
              const articleSerialise = Boolean(article?.serialise);
              const disponible = getDisponibilite(
                ligne.idArticle,
                ligne.idMagasin,
              );
              const materielsDisponibles = getMaterielsDisponibles(ligne);

              return (
                <div
                  key={index}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-950">
                      Ligne {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => supprimerLigne(index)}
                      disabled={lignes.length === 1}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-bold text-slate-800">
                        Article <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={ligne.idArticle}
                        onChange={(e) =>
                          updateLigne(index, 'idArticle', e.target.value)
                        }
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-[#0f3d56]/10"
                      >
                        <option value="">Sélectionner un article</option>

                        {articles.map((article) => (
                          <option
                            key={article.idArticle}
                            value={article.idArticle}
                          >
                            {article.reference ?? `#${article.idArticle}`} —{' '}
                            {article.designation ?? 'Sans libellé'}
                            {article.serialise ? ' — Sérialisé' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-800">
                        Magasin <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={ligne.idMagasin}
                        onChange={(e) =>
                          updateLigne(index, 'idMagasin', e.target.value)
                        }
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-[#0f3d56]/10"
                      >
                        <option value="">Sélectionner un magasin</option>

                        {magasins.map((magasin) => (
                          <option
                            key={magasin.idMagasin}
                            value={magasin.idMagasin}
                          >
                            {magasin.code ?? `#${magasin.idMagasin}`} —{' '}
                            {magasin.libelle ?? 'Sans libellé'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-800">
                        Quantité <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={ligne.quantite}
                        disabled={articleSerialise}
                        onChange={(e) =>
                          updateLigne(index, 'quantite', e.target.value)
                        }
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-[#0f3d56]/10 disabled:bg-slate-100"
                      />

                      {ligne.idArticle && ligne.idMagasin && (
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          Disponible :{' '}
                          <span className="text-emerald-700">
                            {disponible}
                          </span>
                        </p>
                      )}
                    </div>

                    {articleSerialise && (
                      <div>
                        <label className="mb-2 block font-bold text-slate-800">
                          Matériel à sortir{' '}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={ligne.idMateriel}
                          onChange={(e) =>
                            updateLigne(index, 'idMateriel', e.target.value)
                          }
                          className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-[#0f3d56]/10"
                        >
                          <option value="">Sélectionner le matériel</option>

                          {materielsDisponibles.map((materiel) => (
                            <option
                              key={materiel.idMateriel}
                              value={materiel.idMateriel}
                            >
                              {materiel.code ?? `MAT-${materiel.idMateriel}`}
                              {materiel.numeroSerie
                                ? ` — N° série : ${materiel.numeroSerie}`
                                : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className={articleSerialise ? 'lg:col-span-2' : ''}>
                      <label className="mb-2 block font-bold text-slate-800">
                        Commentaire ligne
                      </label>

                      <input
                        type="text"
                        value={ligne.commentaire}
                        onChange={(e) =>
                          updateLigne(index, 'commentaire', e.target.value)
                        }
                        placeholder="Commentaire facultatif"
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-[#0f3d56]/10"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}