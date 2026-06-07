

import { Eye, Pencil, Trash2 } from 'lucide-react';

import type { PlanPreventifPredefini } from '../types/plan-preventif-predefini.types';

type PlanPreventifPredefiniTableProps = {
  items: PlanPreventifPredefini[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

function formatBoolean(value?: boolean | null) {
  if (value === true) return 'Oui';
  if (value === false) return 'Non';
  return '-';
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

function displayModeleLabel(item: PlanPreventifPredefini) {
  if (item.modele?.code || item.modele?.libelle) {
    return `${item.modele.code || ''}${
      item.modele.code && item.modele.libelle ? ' — ' : ''
    }${item.modele.libelle || ''}`;
  }

  if (item.idModele) {
    return `Modèle #${item.idModele}`;
  }

  return '-';
}

export function PlanPreventifPredefiniTable({
  items,
  onView,
  onEdit,
  onDelete,
}: PlanPreventifPredefiniTableProps) {
  return (
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
            <th className="w-[110px] px-4 py-4 md:px-5">Code</th>
            <th className="w-[140px] px-4 py-4 md:px-5">Titre</th>
            <th className="w-[90px] px-4 py-4 md:px-5">État</th>
            <th className="w-[170px] px-4 py-4 md:px-5">Type</th>
            <th className="w-[130px] px-4 py-4 md:px-5">Association</th>
            <th className="w-[180px] px-4 py-4 md:px-5">Modèle lié</th>
            <th className="w-[90px] px-4 py-4 md:px-5">Actif</th>
            <th className="w-[110px] px-4 py-4 md:px-5">Nb décl.</th>
            <th className="w-[140px] px-4 py-4 text-center md:px-5">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-4 py-6 text-[15px] md:px-5"
                style={{ color: '#183B56' }}
              >
                Aucun plan préventif prédéfini trouvé.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.idPlanPreventifPredefini}
                className="border-b"
                style={{ borderColor: '#F1F5F8' }}
              >
                <td
                  className="truncate px-4 py-4 font-medium md:px-5"
                  style={{ color: '#183B56' }}
                  title={item.code || '-'}
                >
                  {item.code || '-'}
                </td>

                <td
                  className="px-4 py-4 md:px-5"
                  style={{ color: '#183B56' }}
                  title={item.titre || '-'}
                >
                  <div className="line-clamp-2">{item.titre || '-'}</div>
                </td>

                <td
                  className="truncate px-4 py-4 md:px-5"
                  style={{ color: '#183B56' }}
                  title={item.etat || '-'}
                >
                  {item.etat || '-'}
                </td>

                <td
                  className="truncate px-4 py-4 md:px-5"
                  style={{ color: '#183B56' }}
                  title={item.typeDeclenchement || '-'}
                >
                  {item.typeDeclenchement || '-'}
                </td>

                <td className="px-4 py-4 md:px-5">
                  <ModeleAssociationBadge
                    idModele={item.idModele}
                    modele={item.modele}
                  />
                </td>

                <td
                  className="truncate px-4 py-4 md:px-5"
                  style={{ color: '#183B56' }}
                  title={displayModeleLabel(item)}
                >
                  {displayModeleLabel(item)}
                </td>

                <td
                  className="truncate px-4 py-4 md:px-5"
                  style={{ color: '#183B56' }}
                >
                  {formatBoolean(item.actif)}
                </td>

                <td
                  className="truncate px-4 py-4 md:px-5"
                  style={{ color: '#183B56' }}
                >
                  {item.ppp_declencheur?.length || 0}
                </td>

                <td className="px-4 py-4 md:px-5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(item.idPlanPreventifPredefini)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition"
                      style={{
                        borderColor: '#E4EBF0',
                        color: '#6E8CA0',
                        backgroundColor: '#FFFFFF',
                      }}
                      title="Voir le détail"
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(item.idPlanPreventifPredefini)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition"
                      style={{
                        borderColor: '#E4EBF0',
                        color: '#6E8CA0',
                        backgroundColor: '#FFFFFF',
                      }}
                      title="Modifier"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item.idPlanPreventifPredefini)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition"
                      style={{
                        borderColor: '#F2D2D2',
                        color: '#D46A6A',
                        backgroundColor: '#FFFFFF',
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}