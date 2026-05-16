

import { Eye } from 'lucide-react';

import type { PlanPreventif } from '../types/plan-preventif.types';

type Props = {
  plans: PlanPreventif[];
  onOpen: (idPlanPreventif: number) => void;
};

function getEtatLabel(etat?: string | null) {
  const labels: Record<string, string> = {
    ACTIF: 'Actif',
    INACTIF: 'Inactif',
    BROUILLON: 'Brouillon',
  };

  return etat ? labels[etat] || etat : '-';
}

export default function PlanPreventifTable({ plans, onOpen }: Props) {
  return (
    <div
      className="max-w-full overflow-hidden rounded-[18px] border p-4 shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E6EDF2',
      }}
    >
      <div className="mb-4">
        <h2 className="text-[18px] font-bold" style={{ color: '#183B56' }}>
          Liste des plans
        </h2>

        <p className="mt-1 text-[12px]" style={{ color: '#6B8596' }}>
          {plans.length} plan(s) trouvé(s).
        </p>
      </div>

      <div className="max-w-full overflow-x-auto pb-2">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr
              className="border-b text-[11px] uppercase tracking-[0.16em]"
              style={{
                borderColor: '#E6EDF2',
                color: '#6E8CA0',
              }}
            >
              <th className="py-3 pr-4 font-semibold">Code</th>
              <th className="py-3 pr-4 font-semibold">Libellé</th>
              <th className="py-3 pr-4 font-semibold">État</th>
              <th className="py-3 pr-4 font-semibold">Déclenchement</th>
              <th className="py-3 pr-4 font-semibold">Matériel</th>
              <th className="py-3 pr-4 font-semibold">Source</th>
              <th className="py-3 pr-4 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {plans.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 text-center text-[13px]"
                  style={{ color: '#6B8596' }}
                >
                  Aucun plan préventif trouvé.
                </td>
              </tr>
            )}

            {plans.map((plan) => (
              <tr
                key={plan.idPlanPreventif}
                className="border-b text-[13px]"
                style={{
                  borderColor: '#EEF3F6',
                  color: '#183B56',
                }}
              >
                <td className="whitespace-nowrap py-3 pr-4 font-semibold">
                  {plan.code}
                </td>

                <td className="py-3 pr-4">{plan.libelle || '-'}</td>

                <td className="whitespace-nowrap py-3 pr-4">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                    style={{
                      backgroundColor: '#EEF6F8',
                      color: '#0F5F78',
                    }}
                  >
                    {getEtatLabel(plan.etat)}
                  </span>
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {plan.typeDeclenchement || '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {plan.materiel?.code || '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {plan.plan_preventif_predefini?.code || '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(plan.idPlanPreventif)}
                    className="inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold transition hover:bg-slate-50"
                    style={{
                      borderColor: '#E6EDF2',
                      backgroundColor: '#FFFFFF',
                      color: '#183B56',
                    }}
                  >
                    <Eye size={14} />
                    Détail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}