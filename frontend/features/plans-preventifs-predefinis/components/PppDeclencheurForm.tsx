

import { useEffect, useMemo, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { getPointsMesure } from '@/features/points-mesure/services/point-mesure.service';
import type { PointMesure } from '@/features/points-mesure/types/point-mesure.types';

import { useForeignKeyOptions } from '../hooks/useForeignKeyOptions';
import type { DeclencheurFormValues } from '../types/plan-preventif-predefini.types';

type PppDeclencheurFormProps = {
  values: DeclencheurFormValues;
  saving: boolean;
  error: string | null;
  editingId: number | null;
  setField: <K extends keyof DeclencheurFormValues>(
    field: K,
    value: DeclencheurFormValues[K],
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
};

const CALENDAIRE_UNITS = ['jour', 'semaine', 'mois', 'annee'];
const OPERATEURS = ['>', '>=', '<', '<=', '='];

export function PppDeclencheurForm({
  values,
  saving,
  error,
  editingId,
  setField,
  onSubmit,
  onCancelEdit,
}: PppDeclencheurFormProps) {
  const router = useRouter();
  const { gammes, modeles, loading } = useForeignKeyOptions();

  const [pointsMesure, setPointsMesure] = useState<PointMesure[]>([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);

  const selectedGammeId =
    values.idGamme && values.idGamme !== '' ? Number(values.idGamme) : null;

  const selectedModeleId =
    values.idModele && values.idModele !== '' ? Number(values.idModele) : null;

  const selectedPointMesureId =
    values.idPointMesure && values.idPointMesure !== ''
      ? Number(values.idPointMesure)
      : null;

  const type = values.typeDeclencheur || 'CALENDAIRE';

  const isCalendaire = type === 'CALENDAIRE';
  const isMesure = type === 'COMPTEUR' || type === 'CONDITIONNEL';

  const pointsMesureFiltres = useMemo(() => {
    if (!isMesure) return [];

    return pointsMesure.filter(
      (point) => point.actif !== false && point.type === type,
    );
  }, [pointsMesure, type, isMesure]);

  useEffect(() => {
    async function loadPointsMesure() {
      try {
        setPointsLoading(true);
        setPointsError(null);

        const data = await getPointsMesure();
        setPointsMesure(data);
      } catch (err) {
        setPointsError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des points de mesure.',
        );
      } finally {
        setPointsLoading(false);
      }
    }

    loadPointsMesure();
  }, []);

  function handleViewGamme() {
    if (!selectedGammeId) return;
    router.push(`/gammes/${selectedGammeId}`);
  }

  function handleAddGamme() {
    router.push('/gammes/nouveau');
  }

  function handleViewModele() {
    if (!selectedModeleId) return;
    router.push(`/modeles/${selectedModeleId}`);
  }

  function handleAddModele() {
    router.push('/modeles/nouveau');
  }

  function inputStyle() {
    return {
      borderColor: '#E4EBF0',
      color: '#183B56',
      backgroundColor: '#FFFFFF',
    } as const;
  }

  function handleChangeType(nextType: string) {
    setField('typeDeclencheur', nextType);

    if (nextType === 'CALENDAIRE') {
      setField('periodiciteUnite', 'jour');
      setField('idPointMesure', '');
      setField('operateur', '');
      setField('seuilValeur', '');
      setField('symptomeCode', '');
      return;
    }

    if (nextType === 'COMPTEUR' || nextType === 'CONDITIONNEL') {
      setField('periodiciteValeur', '');
      setField('periodiciteUnite', '');
      setField('nombreJoursPremierLancement', '');
      setField('idPointMesure', '');
      setField('operateur', '>=');
      setField('seuilValeur', '');
      return;
    }
  }

  function renderCommonFields() {
    return (
      <>
        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Priorité
          </label>
          <input
            type="number"
            min="1"
            value={values.priorite}
            onChange={(e) => setField('priorite', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Type déclencheur
          </label>
          <select
            value={values.typeDeclencheur}
            onChange={(e) => handleChangeType(e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          >
            <option value="CALENDAIRE">CALENDAIRE</option>
            <option value="COMPTEUR">COMPTEUR</option>
            <option value="CONDITIONNEL">CONDITIONNEL</option>
          </select>
        </div>

        <div className="xl:col-span-2">
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Gamme *
          </label>

          <div className="flex gap-2">
            <select
              value={values.idGamme}
              onChange={(e) => setField('idGamme', e.target.value)}
              className="h-[44px] min-w-0 flex-1 rounded-[14px] border px-4 text-[14px] outline-none"
              style={inputStyle()}
            >
              <option value="">
                {loading ? 'Chargement des gammes...' : 'Sélectionner une gamme'}
              </option>

              {gammes.map((gamme) => (
                <option key={gamme.idGamme} value={gamme.idGamme}>
                  {gamme.code ? `${gamme.code} — ` : ''}
                  {gamme.libelle || `Gamme #${gamme.idGamme}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleViewGamme}
              disabled={selectedGammeId === null}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border disabled:cursor-not-allowed disabled:opacity-50"
              style={inputStyle()}
              title="Voir la gamme"
            >
              <Eye size={16} />
            </button>

            <button
              type="button"
              onClick={handleAddGamme}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border"
              style={inputStyle()}
              title="Ajouter une gamme"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="xl:col-span-2">
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Modèle
          </label>

          <div className="flex gap-2">
            <select
              value={values.idModele}
              onChange={(e) => setField('idModele', e.target.value)}
              className="h-[44px] min-w-0 flex-1 rounded-[14px] border px-4 text-[14px] outline-none"
              style={inputStyle()}
            >
              <option value="">
                {loading
                  ? 'Chargement des modèles...'
                  : 'Sélectionner un modèle'}
              </option>

              {modeles.map((modele) => (
                <option key={modele.idModele} value={modele.idModele}>
                  {modele.code ? `${modele.code} — ` : ''}
                  {modele.libelle || `Modèle #${modele.idModele}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleViewModele}
              disabled={selectedModeleId === null}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border disabled:cursor-not-allowed disabled:opacity-50"
              style={inputStyle()}
              title="Voir le modèle"
            >
              <Eye size={16} />
            </button>

            <button
              type="button"
              onClick={handleAddModele}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border"
              style={inputStyle()}
              title="Ajouter un modèle"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </>
    );
  }

  function renderCalendaireFields() {
    return (
      <>
        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Nombre de jours avant premier lancement
          </label>
          <input
            type="number"
            min="0"
            value={values.nombreJoursPremierLancement}
            onChange={(e) =>
              setField('nombreJoursPremierLancement', e.target.value)
            }
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Périodicité valeur *
          </label>
          <input
            type="number"
            min="1"
            value={values.periodiciteValeur}
            onChange={(e) => setField('periodiciteValeur', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Unité de temps *
          </label>
          <select
            value={values.periodiciteUnite}
            onChange={(e) => setField('periodiciteUnite', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          >
            <option value="">Sélectionner</option>
            {CALENDAIRE_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Horizon (jours)
          </label>
          <input
            type="number"
            min="0"
            value={values.horizonJours}
            onChange={(e) => setField('horizonJours', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Tolérance (jours)
          </label>
          <input
            type="number"
            min="0"
            value={values.toleranceJours}
            onChange={(e) => setField('toleranceJours', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          />
        </div>
      </>
    );
  }

  function renderMesureFields() {
    return (
      <>
        <div className="xl:col-span-2">
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Point de mesure *
          </label>

          <select
            value={values.idPointMesure}
            onChange={(e) => setField('idPointMesure', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          >
            <option value="">
              {pointsLoading
                ? 'Chargement des points de mesure...'
                : `Sélectionner un point de mesure ${type.toLowerCase()}`}
            </option>

            {pointsMesureFiltres.map((point) => (
              <option key={point.idPointMesure} value={point.idPointMesure}>
                {point.code} — {point.libelle}
                {point.unite ? ` (${point.unite})` : ''}
              </option>
            ))}
          </select>

          {pointsError && (
            <p className="mt-1 text-[12px]" style={{ color: '#C0392B' }}>
              {pointsError}
            </p>
          )}

          {!pointsLoading && pointsMesureFiltres.length === 0 && (
            <p className="mt-1 text-[12px]" style={{ color: '#8AA0B2' }}>
              Aucun point de mesure de type {type} trouvé.
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Opérateur *
          </label>
          <select
            value={values.operateur}
            onChange={(e) => setField('operateur', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          >
            <option value="">Sélectionner</option>
            {OPERATEURS.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Valeur seuil *
          </label>
          <input
            type="number"
            value={values.seuilValeur}
            onChange={(e) => setField('seuilValeur', e.target.value)}
            placeholder={type === 'COMPTEUR' ? 'Ex: 250' : 'Ex: 90'}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Horizon (jours)
          </label>
          <input
            type="number"
            min="0"
            value={values.horizonJours}
            onChange={(e) => setField('horizonJours', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: '#183B56' }}
          >
            Tolérance (jours)
          </label>
          <input
            type="number"
            min="0"
            value={values.toleranceJours}
            onChange={(e) => setField('toleranceJours', e.target.value)}
            className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
            style={inputStyle()}
          />
        </div>

        {type === 'CONDITIONNEL' && (
          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Symptôme
            </label>
            <input
              type="text"
              value={values.symptomeCode}
              onChange={(e) => setField('symptomeCode', e.target.value)}
              placeholder="Ex: SURCHAUFFE"
              className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={inputStyle()}
            />
          </div>
        )}

        {selectedPointMesureId && (
          <div
            className="rounded-[14px] border px-4 py-3 text-[13px] xl:col-span-2"
            style={{
              borderColor: '#E4EBF0',
              backgroundColor: '#F9FBFC',
              color: '#5F7C90',
            }}
          >
            Point sélectionné : #{selectedPointMesureId}
          </div>
        )}
      </>
    );
  }

  function renderTypeSpecificFields() {
    if (isCalendaire) return renderCalendaireFields();
    if (isMesure) return renderMesureFields();
    return null;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {renderCommonFields()}
        {renderTypeSpecificFields()}

        <div className="md:col-span-2 xl:col-span-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={values.actif}
              onChange={(e) => setField('actif', e.target.checked)}
              className="h-4 w-4"
            />
            <span
              className="text-[14px] font-medium"
              style={{ color: '#183B56' }}
            >
              Déclencheur actif
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div
          className="mt-4 rounded-[14px] border px-4 py-3 text-[13px]"
          style={{
            borderColor: '#E8B4B4',
            color: '#8A1F1F',
            backgroundColor: '#FFF7F7',
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-3">
        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex h-[44px] items-center justify-center rounded-[14px] border px-5 text-[14px] font-medium transition"
            style={{
              borderColor: '#E4EBF0',
              backgroundColor: '#FFFFFF',
              color: '#183B56',
            }}
          >
            Annuler
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-[44px] items-center justify-center rounded-[14px] px-5 text-[14px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: '#1D5C83' }}
        >
          {saving
            ? editingId
              ? 'Mise à jour...'
              : 'Ajout...'
            : editingId
              ? 'Mettre à jour le déclencheur'
              : 'Ajouter le déclencheur'}
        </button>
      </div>
    </form>
  );
}