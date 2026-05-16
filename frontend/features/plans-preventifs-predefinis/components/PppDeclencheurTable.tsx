'use client';

import { Pencil, Trash2 } from 'lucide-react';

import type { PppDeclencheur } from '../types/plan-preventif-predefini.types';

type PppDeclencheurTableProps = {
  items: PppDeclencheur[];
  onEdit: (item: PppDeclencheur) => void;
  onDelete: (id: number) => void;
};

function display(value?: string | number | boolean | null) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return String(value);
}

export function PppDeclencheurTable({
  items,
  onEdit,
  onDelete,
}: PppDeclencheurTableProps) {
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
            <th className="w-[80px] px-4 py-4 md:px-5">ID</th>
            <th className="w-[150px] px-4 py-4 md:px-5">Type</th>
            <th className="w-[90px] px-4 py-4 md:px-5">Priorité</th>
            <th className="w-[90px] px-4 py-4 md:px-5">Gamme</th>
            <th className="w-[100px] px-4 py-4 md:px-5">Modèle</th>
            <th className="w-[120px] px-4 py-4 md:px-5">Périodicité</th>
            <th className="w-[90px] px-4 py-4 md:px-5">Actif</th>
            <th className="w-[120px] px-4 py-4 text-center md:px-5">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-6 text-[15px] md:px-5"
                style={{ color: '#183B56' }}
              >
                Aucun déclencheur associé.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.idPppDeclencheur}
                className="border-b"
                style={{ borderColor: '#F1F5F8' }}
              >
                <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                  {item.idPppDeclencheur}
                </td>
                <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                  {display(item.typeDeclencheur)}
                </td>
                <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                  {display(item.priorite)}
                </td>
                <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                  {display(item.idGamme)}
                </td>
                <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                  {display(item.idModele)}
                </td>
                <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                  {item.periodiciteValeur && item.periodiciteUnite
                    ? `${item.periodiciteValeur} ${item.periodiciteUnite}`
                    : '-'}
                </td>
                <td className="px-4 py-4 md:px-5" style={{ color: '#183B56' }}>
                  {display(item.actif)}
                </td>
                <td className="px-4 py-4 md:px-5">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition"
                      style={{
                        borderColor: '#E4EBF0',
                        color: '#6E8CA0',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item.idPppDeclencheur)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition"
                      style={{
                        borderColor: '#F2D2D2',
                        color: '#D46A6A',
                        backgroundColor: '#FFFFFF',
                      }}
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