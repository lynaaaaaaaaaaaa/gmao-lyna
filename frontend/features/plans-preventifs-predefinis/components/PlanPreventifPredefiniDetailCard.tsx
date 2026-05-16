'use client';

import type { PlanPreventifPredefini } from '../types/plan-preventif-predefini.types';

type PlanPreventifPredefiniDetailCardProps = {
  item: PlanPreventifPredefini;
};

function display(value?: string | number | boolean | null) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return String(value);
}

export function PlanPreventifPredefiniDetailCard({
  item,
}: PlanPreventifPredefiniDetailCardProps) {
  return (
    <div className="space-y-5">
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
            Détail du plan préventif prédéfini.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              Code
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {display(item.code)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              Libellé / Titre
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {display(item.titre)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              État
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {display(item.etat)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              Organisation
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {display(item.organisation)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              Type de déclenchement
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {display(item.typeDeclenchement)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              Actif
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {display(item.actif)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              ID Modèle
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {display(item.idModele)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              Modèle lié
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {display(item.modele?.libelle ?? item.modele?.code)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8AA0B2' }}
            >
              Nombre de déclencheurs
            </p>
            <p className="mt-2 text-[16px] font-medium" style={{ color: '#183B56' }}>
              {item.ppp_declencheur?.length ?? 0}
            </p>
          </div>
        </div>
      </div>

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
            Déclencheurs PPP
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
            Déclencheurs associés à ce plan.
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr
                className="border-b text-left text-[12px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  borderColor: '#EDF2F6',
                  color: '#8AA0B2',
                }}
              >
                <th className="w-[120px] px-4 py-4 md:px-5">ID</th>
                <th className="w-[160px] px-4 py-4 md:px-5">Type</th>
                <th className="w-[100px] px-4 py-4 md:px-5">Priorité</th>
                <th className="w-[100px] px-4 py-4 md:px-5">Gamme</th>
                <th className="w-[120px] px-4 py-4 md:px-5">Périodicité</th>
                <th className="w-[100px] px-4 py-4 md:px-5">Actif</th>
              </tr>
            </thead>

            <tbody>
              {!item.ppp_declencheur || item.ppp_declencheur.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-[15px] md:px-5"
                    style={{ color: '#183B56' }}
                  >
                    Aucun déclencheur associé.
                  </td>
                </tr>
              ) : (
                item.ppp_declencheur.map((declencheur) => (
                  <tr
                    key={declencheur.idPppDeclencheur}
                    className="border-b"
                    style={{ borderColor: '#F1F5F8' }}
                  >
                    <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                      {declencheur.idPppDeclencheur}
                    </td>
                    <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                      {display(declencheur.typeDeclencheur)}
                    </td>
                    <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                      {display(declencheur.priorite)}
                    </td>
                    <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                      {display(declencheur.idGamme)}
                    </td>
                    <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                      {declencheur.periodiciteValeur && declencheur.periodiciteUnite
                        ? `${declencheur.periodiciteValeur} ${declencheur.periodiciteUnite}`
                        : '-'}
                    </td>
                    <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                      {display(declencheur.actif)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}