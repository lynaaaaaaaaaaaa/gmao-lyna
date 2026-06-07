'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Link2 } from 'lucide-react';

import type { PlanPreventifPredefini } from '../types/plan-preventif-predefini.types';

type PlanPreventifPredefiniDetailCardProps = {
  item: PlanPreventifPredefini;
};

function display(value?: string | number | boolean | null) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return String(value);
}

function ModeleAssociationBadge({
  idModele,
  modele,
}: {
  idModele?: number | null;
  modele?: {
    idModele: number;
    code: string | null;
    libelle: string | null;
  } | null;
}) {
  const isAssociated = Boolean(idModele || modele?.idModele);

  if (!isAssociated) {
    return (
      <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
        Non associé
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
      Associé
    </span>
  );
}

export function PlanPreventifPredefiniDetailCard({
  item,
}: PlanPreventifPredefiniDetailCardProps) {
  const router = useRouter();

  const isAssociated = Boolean(item.idModele || item.modele?.idModele);

  function handleAssociate() {
    router.push(
      `/plans-preventifs-predefinis/${item.idPlanPreventifPredefini}/modifier`,
    );
  }

  return (
    <div className="space-y-5">
      {!isAssociated && (
        <div className="rounded-[20px] border border-orange-200 bg-orange-50 px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
              <AlertTriangle size={22} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[16px] font-black text-orange-800">
                  Plan préventif prédéfini non associé
                </h2>

                <ModeleAssociationBadge
                  idModele={item.idModele}
                  modele={item.modele}
                />
              </div>

              <p className="mt-2 text-[14px] font-medium leading-6 text-orange-700">
                Ce plan préventif prédéfini n’est associé à aucun modèle. Il ne
                sera donc pas proposé automatiquement lors de la création d’un
                matériel.
              </p>

              <button
                type="button"
                onClick={handleAssociate}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                <Link2 size={16} />
                Associer à un modèle
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
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

            <ModeleAssociationBadge
              idModele={item.idModele}
              modele={item.modele}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem label="Code" value={display(item.code)} />

          <InfoItem label="Libellé / Titre" value={display(item.titre)} />

          <InfoItem label="État" value={display(item.etat)} />

          <InfoItem label="Organisation" value={display(item.organisation)} />

          <InfoItem
            label="Type de déclenchement"
            value={display(item.typeDeclenchement)}
          />

          <InfoItem label="Actif" value={display(item.actif)} />

          <InfoItem label="ID modèle" value={display(item.idModele)} />

          <InfoItem
            label="Modèle lié"
            value={display(item.modele?.libelle ?? item.modele?.code)}
          />

          <InfoItem
            label="Statut association"
            customValue={
              <ModeleAssociationBadge
                idModele={item.idModele}
                modele={item.modele}
              />
            }
          />

          <InfoItem
            label="Nombre de déclencheurs"
            value={String(item.ppp_declencheur?.length ?? 0)}
          />
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
                    <td
                      className="px-4 py-4 md:px-5"
                      style={{ color: '#183B56' }}
                    >
                      {declencheur.idPppDeclencheur}
                    </td>

                    <td
                      className="px-4 py-4 md:px-5"
                      style={{ color: '#183B56' }}
                    >
                      {display(declencheur.typeDeclencheur)}
                    </td>

                    <td
                      className="px-4 py-4 md:px-5"
                      style={{ color: '#183B56' }}
                    >
                      {display(declencheur.priorite)}
                    </td>

                    <td
                      className="px-4 py-4 md:px-5"
                      style={{ color: '#183B56' }}
                    >
                      {display(declencheur.idGamme)}
                    </td>

                    <td
                      className="px-4 py-4 md:px-5"
                      style={{ color: '#183B56' }}
                    >
                      {declencheur.periodiciteValeur &&
                      declencheur.periodiciteUnite
                        ? `${declencheur.periodiciteValeur} ${declencheur.periodiciteUnite}`
                        : '-'}
                    </td>

                    <td
                      className="px-4 py-4 md:px-5"
                      style={{ color: '#183B56' }}
                    >
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

function InfoItem({
  label,
  value,
  customValue,
}: {
  label: string;
  value?: string;
  customValue?: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: '#8AA0B2' }}
      >
        {label}
      </p>

      <div
        className="mt-2 text-[16px] font-medium"
        style={{ color: '#183B56' }}
      >
        {customValue ?? value ?? '-'}
      </div>
    </div>
  );
}