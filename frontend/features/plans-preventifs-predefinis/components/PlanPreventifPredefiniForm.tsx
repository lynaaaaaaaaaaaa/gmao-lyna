'use client';

import { Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useForeignKeyOptions } from '../hooks/useForeignKeyOptions';

type PlanPreventifPredefiniFormValues = {
  code: string;
  libelle: string;
  etat: string;
  organisation: string;
  typeDeclenchement: string;
  idModele: string;
  actif: boolean;
};

type PlanPreventifPredefiniFormProps = {
  values: PlanPreventifPredefiniFormValues;
  saving: boolean;
  error: string | null;
  success?: string | null;
  setField: <K extends keyof PlanPreventifPredefiniFormValues>(
    field: K,
    value: PlanPreventifPredefiniFormValues[K],
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function PlanPreventifPredefiniForm({
  values,
  saving,
  error,
  success,
  setField,
  onSubmit,
}: PlanPreventifPredefiniFormProps) {
  const router = useRouter();
  const { modeles, loading } = useForeignKeyOptions();

  const selectedModeleId =
    values.idModele && values.idModele !== '' ? Number(values.idModele) : null;

  function handleViewModele() {
    if (!selectedModeleId) return;
    router.push(`/modeles/${selectedModeleId}`);
  }

  function handleAddModele() {
    router.push('/modeles/nouveau');
  }

  return (
    <form onSubmit={onSubmit}>
      <div
        className="overflow-hidden rounded-[20px] border"
        style={{
          borderColor: '#E4EBF0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(15, 35, 55, 0.05)',
        }}
      >
        <div
          className="border-b px-5 py-4"
          style={{ borderColor: '#EDF2F6' }}
        >
          <h2
            className="text-[18px] font-semibold"
            style={{ color: '#183B56' }}
          >
            Informations générales
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
            Renseignez les informations principales du plan préventif prédéfini.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 px-5 py-5 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Code *
            </label>
            <input
              type="text"
              value={values.code}
              onChange={(e) => setField('code', e.target.value)}
              className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Ex: PPP001"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Libellé
            </label>
            <input
              type="text"
              value={values.libelle}
              onChange={(e) => setField('libelle', e.target.value)}
              className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Ex: Préventif chariot"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              État
            </label>
            <select
              value={values.etat}
              onChange={(e) => setField('etat', e.target.value)}
              className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">Sélectionner un état</option>
              <option value="ACTIF">ACTIF</option>
              <option value="INACTIF">INACTIF</option>
              <option value="BROUILLON">BROUILLON</option>
            </select>
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Organisation
            </label>
            <input
              type="text"
              value={values.organisation}
              onChange={(e) => setField('organisation', e.target.value)}
              className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Ex: BMT"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Type de déclenchement
            </label>
            <select
              value={values.typeDeclenchement}
              onChange={(e) => setField('typeDeclenchement', e.target.value)}
              className="h-[44px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">Sélectionner un type</option>
              <option value="AUTOMATIQUE">AUTOMATIQUE</option>
              <option value="MANUEL">MANUEL</option>
            </select>
          </div>

          <div>
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
                style={{
                  borderColor: '#E4EBF0',
                  color: '#183B56',
                  backgroundColor: '#FFFFFF',
                }}
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
                style={{
                  borderColor: '#E4EBF0',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
                title="Voir le modèle"
              >
                <Eye size={16} />
              </button>

              <button
                type="button"
                onClick={handleAddModele}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border"
                style={{
                  borderColor: '#E4EBF0',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
                title="Ajouter un modèle"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
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
                Plan actif
              </span>
            </label>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div className="mt-4 space-y-3">
          {error && (
            <div
              className="rounded-[14px] border px-4 py-3 text-[13px]"
              style={{
                borderColor: '#E8B4B4',
                color: '#8A1F1F',
                backgroundColor: '#FFF7F7',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="rounded-[14px] border px-4 py-3 text-[13px]"
              style={{
                borderColor: '#B7E3C1',
                color: '#1E6B3A',
                backgroundColor: '#F4FFF7',
              }}
            >
              {success}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-[44px] items-center justify-center rounded-[14px] px-5 text-[14px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: '#1D5C83' }}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}