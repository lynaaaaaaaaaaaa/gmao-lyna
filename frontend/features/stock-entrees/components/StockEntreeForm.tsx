

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

import { getArticles } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/magasins/services/magasin.service';
import { CreateStockEntreeDto } from '../types/stock-entree';

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

type MaterielForm = {
  code: string;
  numeroSerie: string;
};

type LigneForm = {
  idArticle: string;
  idMagasin: string;
  idEmplacement: string;
  quantite: number;
  prixUnitaire: string;
  numeroLot: string;
  datePeremption: string;
  commentaire: string;
  materiels: MaterielForm[];
};

type StockEntreeFormProps = {
  onSubmit: (data: CreateStockEntreeDto) => Promise<void>;
};

function todayInputDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createEmptyLigne(): LigneForm {
  return {
    idArticle: '',
    idMagasin: '',
    idEmplacement: '',
    quantite: 1,
    prixUnitaire: '',
    numeroLot: '',
    datePeremption: '',
    commentaire: '',
    materiels: [],
  };
}

function createEmptyMateriel(): MaterielForm {
  return {
    code: '',
    numeroSerie: '',
  };
}

function resizeMateriels(
  materiels: MaterielForm[],
  quantite: number,
): MaterielForm[] {
  if (quantite <= 0) return [];

  if (materiels.length === quantite) return materiels;

  if (materiels.length < quantite) {
    return [
      ...materiels,
      ...Array.from({ length: quantite - materiels.length }, () =>
        createEmptyMateriel(),
      ),
    ];
  }

  return materiels.slice(0, quantite);
}

export function StockEntreeForm({ onSubmit }: StockEntreeFormProps) {
  const [dateReception, setDateReception] = useState(todayInputDate());
  const [commentaire, setCommentaire] = useState('');
  const [lignes, setLignes] = useState<LigneForm[]>([createEmptyLigne()]);

  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [magasins, setMagasins] = useState<MagasinOption[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');

  const articlesById = useMemo(() => {
    const map = new Map<number, ArticleOption>();

    for (const article of articles) {
      map.set(article.idArticle, article);
    }

    return map;
  }, [articles]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        setError('');

        const [articlesData, magasinsData] = await Promise.all([
          getArticles(),
          getMagasins(),
        ]);

        setArticles(articlesData as unknown as ArticleOption[]);
        setMagasins(magasinsData as unknown as MagasinOption[]);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des articles ou des magasins.');
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  function getArticleFromLigne(ligne: LigneForm) {
    const idArticle = Number(ligne.idArticle);

    if (!idArticle) return null;

    return articlesById.get(idArticle) ?? null;
  }

  function isLigneSerialisee(ligne: LigneForm) {
    const article = getArticleFromLigne(ligne);
    return Boolean(article?.serialise);
  }

  function updateLigne(index: number, updates: Partial<LigneForm>) {
    setLignes((prev) =>
      prev.map((ligne, i) => {
        if (i !== index) return ligne;

        const next = {
          ...ligne,
          ...updates,
        };

        const article = next.idArticle
          ? articlesById.get(Number(next.idArticle))
          : null;

        if (article?.serialise) {
          next.materiels = resizeMateriels(
            next.materiels,
            Number(next.quantite),
          );
        } else {
          next.materiels = [];
        }

        return next;
      }),
    );
  }

  function handleArticleChange(index: number, idArticle: string) {
    const article = idArticle ? articlesById.get(Number(idArticle)) : null;

    setLignes((prev) =>
      prev.map((ligne, i) => {
        if (i !== index) return ligne;

        const next: LigneForm = {
          ...ligne,
          idArticle,
        };

        if (article?.serialise) {
          next.materiels = resizeMateriels(next.materiels, next.quantite);
        } else {
          next.materiels = [];
        }

        return next;
      }),
    );
  }

  function handleQuantiteChange(index: number, value: number) {
    const quantite = Number.isFinite(value) && value > 0 ? value : 1;

    setLignes((prev) =>
      prev.map((ligne, i) => {
        if (i !== index) return ligne;

        const article = ligne.idArticle
          ? articlesById.get(Number(ligne.idArticle))
          : null;

        return {
          ...ligne,
          quantite,
          materiels: article?.serialise
            ? resizeMateriels(ligne.materiels, quantite)
            : [],
        };
      }),
    );
  }

  function handleMaterielChange(
    ligneIndex: number,
    materielIndex: number,
    field: keyof MaterielForm,
    value: string,
  ) {
    setLignes((prev) =>
      prev.map((ligne, i) => {
        if (i !== ligneIndex) return ligne;

        return {
          ...ligne,
          materiels: ligne.materiels.map((materiel, j) =>
            j === materielIndex
              ? {
                  ...materiel,
                  [field]: value,
                }
              : materiel,
          ),
        };
      }),
    );
  }

  function addLigne() {
    setLignes((prev) => [...prev, createEmptyLigne()]);
  }

  function removeLigne(index: number) {
    setLignes((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function validateForm() {
    if (!dateReception) {
      return 'Veuillez saisir la date de réception.';
    }

    if (lignes.length === 0) {
      return 'Veuillez ajouter au moins une ligne d’entrée.';
    }

    const codesMateriels = new Set<string>();
    const numerosSerie = new Set<string>();

    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const numeroLigne = i + 1;

      if (!ligne.idArticle) {
        return `Ligne ${numeroLigne} : veuillez sélectionner un article.`;
      }

      if (!ligne.idMagasin) {
        return `Ligne ${numeroLigne} : veuillez sélectionner un magasin.`;
      }

      if (!ligne.quantite || ligne.quantite <= 0) {
        return `Ligne ${numeroLigne} : la quantité doit être supérieure à 0.`;
      }

      const article = getArticleFromLigne(ligne);

      if (!article) {
        return `Ligne ${numeroLigne} : article introuvable.`;
      }

      if (article.gereEnStock === false) {
        return `Ligne ${numeroLigne} : cet article n’est pas géré en stock.`;
      }

      if (article.serialise) {
        if (!Number.isInteger(ligne.quantite)) {
          return `Ligne ${numeroLigne} : un article sérialisé doit avoir une quantité entière.`;
        }

        if (ligne.materiels.length !== ligne.quantite) {
          return `Ligne ${numeroLigne} : le nombre de matériels doit être égal à la quantité.`;
        }

        for (let j = 0; j < ligne.materiels.length; j++) {
          const materiel = ligne.materiels[j];
          const numeroMateriel = j + 1;

          const code = materiel.code.trim();
          const numeroSerie = materiel.numeroSerie.trim();

          if (!code) {
            return `Ligne ${numeroLigne}, matériel ${numeroMateriel} : le code matériel est obligatoire.`;
          }

          if (codesMateriels.has(code)) {
            return `Le code matériel ${code} est saisi plusieurs fois.`;
          }

          codesMateriels.add(code);

          if (numeroSerie) {
            if (numerosSerie.has(numeroSerie)) {
              return `Le numéro de série ${numeroSerie} est saisi plusieurs fois.`;
            }

            numerosSerie.add(numeroSerie);
          }
        }
      }
    }

    return '';
  }

  function buildPayload(): CreateStockEntreeDto {
    return {
      dateReception,
      commentaire: commentaire.trim() || undefined,
      lignes: lignes.map((ligne) => {
        const article = getArticleFromLigne(ligne);
        const serialise = Boolean(article?.serialise);

        return {
          idArticle: Number(ligne.idArticle),
          idMagasin: Number(ligne.idMagasin),
          idEmplacement: ligne.idEmplacement
            ? Number(ligne.idEmplacement)
            : undefined,
          quantite: Number(ligne.quantite),
          prixUnitaire: ligne.prixUnitaire
            ? Number(ligne.prixUnitaire)
            : undefined,
          numeroLot: ligne.numeroLot.trim() || undefined,
          datePeremption: ligne.datePeremption || undefined,
          commentaire: ligne.commentaire.trim() || undefined,
          materiels: serialise
            ? ligne.materiels.map((materiel) => ({
                code: materiel.code.trim(),
                numeroSerie: materiel.numeroSerie.trim() || undefined,
              }))
            : undefined,
        };
      }),
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoadingSubmit(true);

      const payload = buildPayload();

      await onSubmit(payload);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l’enregistrement de l’entrée stock.",
      );
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 p-6">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
          Bon d’entrée stock
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-900">
          Nouvelle entrée stock
        </h2>

        <p className="mt-2 text-slate-500">
          Enregistrez un bon d’entrée avec une ou plusieurs lignes d’articles.
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-8 p-6">
        <section className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-bold text-slate-700">
              Date de réception <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              value={dateReception}
              onChange={(e) => setDateReception(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold text-slate-700">
              Commentaire général
            </label>

            <input
              type="text"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Exemple : Réception fournisseur"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Lignes d’entrée
              </h3>
              <p className="text-slate-500">
                Ajoutez les articles reçus dans le même bon d’entrée.
              </p>
            </div>

            <button
              type="button"
              onClick={addLigne}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#0b2f43]"
            >
              <Plus size={18} />
              Ajouter une ligne
            </button>
          </div>

          {loadingData ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 font-semibold text-slate-500">
              Chargement des articles et magasins...
            </div>
          ) : (
            <div className="space-y-6">
              {lignes.map((ligne, ligneIndex) => {
                const article = getArticleFromLigne(ligne);
                const serialise = isLigneSerialisee(ligne);

                return (
                  <div
                    key={ligneIndex}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-black text-slate-900">
                          Ligne {ligneIndex + 1}
                        </h4>

                        {article && (
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {article.reference} — {article.designation}
                            {serialise && (
                              <span className="ml-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                                Sérialisé
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLigne(ligneIndex)}
                        disabled={lignes.length === 1}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block font-bold text-slate-700">
                          Article <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={ligne.idArticle}
                          onChange={(e) =>
                            handleArticleChange(ligneIndex, e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="">Sélectionner un article</option>

                          {articles.map((article) => (
                            <option
                              key={article.idArticle}
                              value={article.idArticle}
                            >
                              {article.reference} — {article.designation}
                              {article.serialise ? ' — sérialisé' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block font-bold text-slate-700">
                          Magasin <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={ligne.idMagasin}
                          onChange={(e) =>
                            updateLigne(ligneIndex, {
                              idMagasin: e.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="">Sélectionner un magasin</option>

                          {magasins.map((magasin) => (
                            <option
                              key={magasin.idMagasin}
                              value={magasin.idMagasin}
                            >
                              {magasin.code} — {magasin.libelle}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block font-bold text-slate-700">
                          Quantité <span className="text-red-500">*</span>
                        </label>

                        <input
                          type="number"
                          min={1}
                          step={serialise ? 1 : 'any'}
                          value={ligne.quantite}
                          onChange={(e) =>
                            handleQuantiteChange(
                              ligneIndex,
                              Number(e.target.value),
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-bold text-slate-700">
                          Prix unitaire
                        </label>

                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={ligne.prixUnitaire}
                          onChange={(e) =>
                            updateLigne(ligneIndex, {
                              prixUnitaire: e.target.value,
                            })
                          }
                          placeholder="Exemple : 250000"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-bold text-slate-700">
                          N° lot
                        </label>

                        <input
                          type="text"
                          value={ligne.numeroLot}
                          onChange={(e) =>
                            updateLigne(ligneIndex, {
                              numeroLot: e.target.value,
                            })
                          }
                          placeholder="Exemple : LOT-H60-2026"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-bold text-slate-700">
                          Date de péremption
                        </label>

                        <input
                          type="date"
                          value={ligne.datePeremption}
                          onChange={(e) =>
                            updateLigne(ligneIndex, {
                              datePeremption: e.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-bold text-slate-700">
                          Emplacement
                        </label>

                        <input
                          type="number"
                          min={1}
                          value={ligne.idEmplacement}
                          onChange={(e) =>
                            updateLigne(ligneIndex, {
                              idEmplacement: e.target.value,
                            })
                          }
                          placeholder="Optionnel : ID emplacement"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-bold text-slate-700">
                          Commentaire ligne
                        </label>

                        <input
                          type="text"
                          value={ligne.commentaire}
                          onChange={(e) =>
                            updateLigne(ligneIndex, {
                              commentaire: e.target.value,
                            })
                          }
                          placeholder="Commentaire spécifique à cette ligne"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                        />
                      </div>
                    </div>

                    {serialise && (
                      <div className="mt-6 rounded-[22px] border border-blue-100 bg-white p-5">
                        <div className="mb-4">
                          <h5 className="text-xl font-black text-slate-900">
                            Matériels sérialisés
                          </h5>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            Pour cet article, la quantité doit correspondre au
                            nombre de matériels saisis.
                          </p>
                        </div>

                        <div className="space-y-4">
                          {ligne.materiels.map((materiel, materielIndex) => (
                            <div
                              key={materielIndex}
                              className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
                            >
                              <div>
                                <label className="mb-2 block font-bold text-slate-700">
                                  Code matériel {materielIndex + 1}{' '}
                                  <span className="text-red-500">*</span>
                                </label>

                                <input
                                  type="text"
                                  value={materiel.code}
                                  onChange={(e) =>
                                    handleMaterielChange(
                                      ligneIndex,
                                      materielIndex,
                                      'code',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Exemple : MAT-GE-001"
                                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block font-bold text-slate-700">
                                  Numéro de série
                                </label>

                                <input
                                  type="text"
                                  value={materiel.numeroSerie}
                                  onChange={(e) =>
                                    handleMaterielChange(
                                      ligneIndex,
                                      materielIndex,
                                      'numeroSerie',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Exemple : SN-GE-001"
                                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0f3d56] focus:ring-4 focus:ring-blue-50"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="flex justify-end border-t border-slate-100 p-6">
        <button
          type="submit"
          disabled={loadingSubmit || loadingData}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-7 py-4 font-black text-white shadow-sm transition hover:bg-[#0b2f43] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={20} />
          {loadingSubmit ? 'Enregistrement...' : "Enregistrer l’entrée"}
        </button>
      </div>
    </form>
  );
}