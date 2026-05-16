

import type { Gamme } from '../types/plan-preventif.types';

type Values = {
  typeDeclencheur: string;
  etat: string;
  idGamme: string;
  priorite: string;
  periodiciteValeur: string;
  periodiciteUnite: string;
  prochainLancementDate: string;
};

type Props = {
  values: Values;
  gammes: Gamme[];
  saving: boolean;
  error: string | null;
  setField: <K extends keyof Values>(field: K, value: Values[K]) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function PlanPreventifDeclencheurForm({
  values,
  gammes,
  saving,
  error,
  setField,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[18px] border p-5 shadow-sm"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E6EDF2' }}
    >
      <h2 className="text-[18px] font-bold" style={{ color: '#183B56' }}>
        Nouveau déclencheur
      </h2>

      <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
        Ajouter un déclencheur calendaire au plan préventif.
      </p>

      {error && (
        <div
          className="mt-4 rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: '#E8B4B4',
            color: '#8A1F1F',
            backgroundColor: '#FFF7F7',
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Type
          </label>
          <select
            value={values.typeDeclencheur}
            onChange={(e) => setField('typeDeclencheur', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          >
            <option value="CALENDAIRE">Calendaire</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            État
          </label>
          <select
            value={values.etat}
            onChange={(e) => setField('etat', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          >
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Priorité
          </label>
          <input
            type="number"
            value={values.priorite}
            onChange={(e) => setField('priorite', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Gamme
          </label>
          <select
            value={values.idGamme}
            onChange={(e) => setField('idGamme', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          >
            <option value="">Sélectionner une gamme</option>
            {gammes.map((gamme) => (
              <option key={gamme.idGamme} value={gamme.idGamme}>
                {gamme.code} · {gamme.libelle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Périodicité
          </label>
          <input
            type="number"
            value={values.periodiciteValeur}
            onChange={(e) => setField('periodiciteValeur', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Unité
          </label>
          <select
            value={values.periodiciteUnite}
            onChange={(e) => setField('periodiciteUnite', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          >
            <option value="JOUR">Jour</option>
            <option value="SEMAINE">Semaine</option>
            <option value="MOIS">Mois</option>
            <option value="ANNEE">Année</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Prochain lancement
          </label>
          <input
            type="date"
            value={values.prochainLancementDate}
            onChange={(e) => setField('prochainLancementDate', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="h-[42px] rounded-[12px] px-5 text-[13px] font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: '#0F5F78' }}
        >
          {saving ? 'Ajout...' : 'Ajouter déclencheur'}
        </button>
      </div>
    </form>
  );
}