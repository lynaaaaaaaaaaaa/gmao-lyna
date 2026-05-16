

import { Zap } from 'lucide-react';

import type { PlanPreventifDeclencheur } from '../types/plan-preventif.types';

type Props = {
  declencheurs: PlanPreventifDeclencheur[];
  actionLoading: boolean;
  onGenerateOt: (idDeclencheur: number) => void;
};

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('fr-FR').format(new Date(value));
}

export default function PlanPreventifDeclencheurTable({
  declencheurs,
  actionLoading,
  onGenerateOt,
}: Props) {
  return (
    <div className="max-w-full overflow-x-auto pb-2">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr
            className="border-b text-[11px] uppercase tracking-[0.16em]"
            style={{ borderColor: '#E6EDF2', color: '#6E8CA0' }}
          >
            <th className="py-3 pr-4 font-semibold">ID</th>
            <th className="py-3 pr-4 font-semibold">Type</th>
            <th className="py-3 pr-4 font-semibold">État</th>
            <th className="py-3 pr-4 font-semibold">Gamme</th>
            <th className="py-3 pr-4 font-semibold">Périodicité</th>
            <th className="py-3 pr-4 font-semibold">Prochain lancement</th>
            <th className="py-3 pr-4 text-right font-semibold">Action</th>
          </tr>
        </thead>

        <tbody>
          {declencheurs.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="py-6 text-center text-[13px]"
                style={{ color: '#6B8596' }}
              >
                Aucun déclencheur trouvé.
              </td>
            </tr>
          )}

          {declencheurs.map((declencheur) => (
            <tr
              key={declencheur.idPlanPreventifDeclencheur}
              className="border-b text-[13px]"
              style={{ borderColor: '#EEF3F6', color: '#183B56' }}
            >
              <td className="py-3 pr-4 font-semibold">
                {declencheur.idPlanPreventifDeclencheur}
              </td>

              <td className="py-3 pr-4">{declencheur.typeDeclencheur || '-'}</td>

              <td className="py-3 pr-4">{declencheur.etat || '-'}</td>

              <td className="py-3 pr-4">
                {declencheur.gamme
                  ? `${declencheur.gamme.code} · ${declencheur.gamme.libelle}`
                  : '-'}
              </td>

              <td className="py-3 pr-4">
                {declencheur.periodiciteValeur
                  ? `${declencheur.periodiciteValeur} ${declencheur.periodiciteUnite || ''}`
                  : '-'}
              </td>

              <td className="py-3 pr-4">
                {formatDate(declencheur.prochainLancementDate)}
              </td>

              <td className="py-3 pr-4 text-right">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    onGenerateOt(declencheur.idPlanPreventifDeclencheur)
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-[12px] font-semibold text-white transition disabled:opacity-60"
                  style={{ backgroundColor: '#0F5F78' }}
                >
                  <Zap size={14} />
                  Générer OT
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}