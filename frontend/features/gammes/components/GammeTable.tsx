'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';

import type { Gamme } from '../types/gamme.types';

type GammeTableProps = {
  gammes: Gamme[];
  onView: (idGamme: number) => void;
  onEdit: (idGamme: number) => void;
  onDelete: (idGamme: number) => void;
};

export function GammeTable({
  gammes,
  onView,
  onEdit,
  onDelete,
}: GammeTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[920px]">
        <thead>
          <tr
            className="border-b text-left text-[12px] font-semibold uppercase tracking-[0.22em]"
            style={{
              borderColor: '#EDF2F6',
              color: '#8AA0B2',
            }}
          >
            <th className="px-5 py-4">Gamme</th>
            <th className="px-5 py-4">Code</th>
            <th className="px-5 py-4">Type maintenance</th>
            <th className="px-5 py-4">État</th>
            <th className="px-5 py-4">Organisation</th>
            <th className="px-5 py-4 text-center">Opérations</th>
            <th className="px-5 py-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {gammes.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-6 text-[15px]"
                style={{ color: '#183B56' }}
              >
                Aucune gamme trouvée.
              </td>
            </tr>
          ) : (
            gammes.map((gamme) => (
              <tr
                key={gamme.idGamme}
                className="border-b"
                style={{ borderColor: '#F1F5F8' }}
              >
                <td
                  className="px-5 py-5 text-[15px] font-medium"
                  style={{ color: '#183B56' }}
                >
                  {gamme.libelle || '-'}
                </td>

                <td className="px-5 py-5">
                  <span
                    className="inline-flex rounded-full px-4 py-2 text-[13px] font-medium"
                    style={{
                      backgroundColor: '#F2F6FA',
                      color: '#4D6980',
                    }}
                  >
                    {gamme.code || '-'}
                  </span>
                </td>

                <td className="px-5 py-5 text-[15px]" style={{ color: '#183B56' }}>
                  {gamme.typeMaintenance || '-'}
                </td>

                <td className="px-5 py-5 text-[15px]" style={{ color: '#183B56' }}>
                  {gamme.etat || '-'}
                </td>

                <td className="px-5 py-5 text-[15px]" style={{ color: '#183B56' }}>
                  {gamme.organisation || '-'}
                </td>

                <td className="px-5 py-5 text-center">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold"
                    style={{
                      backgroundColor: '#F2F6FA',
                      color: '#4D6980',
                    }}
                  >
                    {gamme.gamme_operation?.length || 0}
                  </span>
                </td>

                <td className="px-5 py-5">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onView(gamme.idGamme)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border transition"
                      style={{
                        borderColor: '#E4EBF0',
                        color: '#6E8CA0',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(gamme.idGamme)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border transition"
                      style={{
                        borderColor: '#E4EBF0',
                        color: '#6E8CA0',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(gamme.idGamme)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border transition"
                      style={{
                        borderColor: '#F2D2D2',
                        color: '#D46A6A',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <Trash2 size={16} />
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