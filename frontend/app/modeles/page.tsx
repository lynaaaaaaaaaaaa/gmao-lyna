'use client';

import { Select } from '@/components/select';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Boxes,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react';

import {
  deleteModele,
  getModeles,
} from '@/features/modeles/services/modele.service';

import type { ModeleApi } from '@/features/modeles/types/modele';

type TypeFilter = 'TOUS' | string;
type EtatFilter = 'TOUS' | string;

function getText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export default function ModelesPage() {
  const [modeles, setModeles] = useState<ModeleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('TOUS');
  const [etatFilter, setEtatFilter] = useState<EtatFilter>('TOUS');

  const loadModeles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getModeles();
      setModeles(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des modèles.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModeles();
  }, [loadModeles]);

  const typeOptions = useMemo(() => {
    const map = new Map<number, string>();

    modeles.forEach((modele) => {
      if (modele.idTypeEquipement && modele.type_equipement) {
        map.set(
          modele.idTypeEquipement,
          modele.type_equipement.libelle ||
            modele.type_equipement.code ||
            `Type ${modele.idTypeEquipement}`,
        );
      }
    });

    return Array.from(map.entries()).map(([id, label]) => ({
      value: String(id),
      label,
    }));
  }, [modeles]);

  const etatOptions = useMemo(() => {
    const map = new Map<number, string>();

    modeles.forEach((modele) => {
      if (modele.idEtat && modele.etat_modele) {
        map.set(
          modele.idEtat,
          modele.etat_modele.libelle ||
            modele.etat_modele.code ||
            `État ${modele.idEtat}`,
        );
      }
    });

    return Array.from(map.entries()).map(([id, label]) => ({
      value: String(id),
      label,
    }));
  }, [modeles]);

  const filteredModeles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return modeles.filter((modele) => {
      const searchable = [
        modele.code,
        modele.libelle,
        modele.type_equipement?.code,
        modele.type_equipement?.libelle,
        modele.etat_modele?.code,
        modele.etat_modele?.libelle,
      ]
        .map(getText)
        .join(' ')
        .toLowerCase();

      const matchSearch =
        !normalizedSearch || searchable.includes(normalizedSearch);

      const matchType =
        typeFilter === 'TOUS' ||
        String(modele.idTypeEquipement) === typeFilter;

      const matchEtat =
        etatFilter === 'TOUS' || String(modele.idEtat) === etatFilter;

      return matchSearch && matchType && matchEtat;
    });
  }, [modeles, search, typeFilter, etatFilter]);

  const stats = useMemo(() => {
    const types = new Set(
      modeles
        .map((modele) => modele.idTypeEquipement)
        .filter((id): id is number => id !== null && id !== undefined),
    );

    const actifs = modeles.filter((modele) => {
      const etat =
        `${modele.etat_modele?.libelle || ''} ${modele.etat_modele?.code || ''}`.toLowerCase();

      return etat.includes('actif') || etat.includes('valid');
    }).length;

    return {
      total: modeles.length,
      types: types.size,
      actifs,
    };
  }, [modeles]);

  function resetFilters() {
    setSearch('');
    setTypeFilter('TOUS');
    setEtatFilter('TOUS');
  }

  async function handleDelete(modele: ModeleApi) {
    const label = modele.libelle || modele.code || `#${modele.idModele}`;

    const ok = window.confirm(
      `Voulez-vous vraiment supprimer le modèle "${label}" ?`,
    );

    if (!ok) return;

    try {
      setActionLoading(true);
      setError('');

      await deleteModele(modele.idModele);
      await loadModeles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression du modèle.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
              Module équipements
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              Modèles
            </h1>

            <p className="mt-1 text-base text-slate-500">
              Gérez le référentiel des modèles utilisés pour vos équipements.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadModeles}
              disabled={loading || actionLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCcw
                size={18}
                className={loading ? 'animate-spin' : ''}
              />
              Actualiser
            </button>

            <Link
              href="/modeles/nouveau"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0b3d4f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d]"
            >
              <Plus size={18} />
              Nouveau modèle
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat
            icon={<Boxes size={20} />}
            label="Modèles"
            value={stats.total}
            tone="blue"
          />

          <MiniStat
            icon={<Wrench size={20} />}
            label="Types"
            value={stats.types}
            tone="orange"
          />

          <MiniStat
            icon={<CheckCircle2 size={20} />}
            label="Actifs"
            value={stats.actifs}
            tone="violet"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_280px_230px_auto]">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par code, libellé ou type..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#0b3d4f] focus:bg-white"
              />
            </div>

            <Select
              value={typeFilter}
              onValueChange={(value: string) => setTypeFilter(value)}
              items={[
                { label: 'Tous les types', value: 'TOUS' },
                ...typeOptions,
              ]}
            />

            <Select
              value={etatFilter}
              onValueChange={(value: string) => setEtatFilter(value)}
              items={[
                { label: 'Tous les états', value: 'TOUS' },
                ...etatOptions,
              ]}
            />

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={17} />
              Réinitialiser
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-2xl font-black text-slate-950">
              Liste des modèles
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {filteredModeles.length} modèle(s) affiché(s)
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef7fa] text-[#0b3d4f]">
                <RefreshCcw className="h-7 w-7 animate-spin" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-600">
                Chargement des modèles...
              </p>
            </div>
          ) : filteredModeles.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Boxes className="h-8 w-8" />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                Aucun modèle trouvé
              </h3>

              <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
                Modifiez les filtres ou créez un nouveau modèle.
              </p>

              <Link
                href="/modeles/nouveau"
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0b3d4f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d]"
              >
                <Plus size={18} />
                Nouveau modèle
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-6 py-4 font-black">Code</th>
                    <th className="px-6 py-4 font-black">Libellé</th>
                    <th className="px-6 py-4 font-black">Type</th>
                    <th className="px-6 py-4 font-black">Statut</th>
                   <th className="px-4 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredModeles.map((modele) => (
                    <ModeleRow
                      key={modele.idModele}
                      modele={modele}
                      actionLoading={actionLoading}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ModeleRow({
  modele,
  actionLoading,
  onDelete,
}: {
  modele: ModeleApi;
  actionLoading: boolean;
  onDelete: (modele: ModeleApi) => void;
}) {
  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50/70">
      <td className="px-6 py-5">
        <span className="inline-flex max-w-[170px] items-center rounded-2xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-900">
          <span className="truncate">
            {modele.code || `MOD-${modele.idModele}`}
          </span>
        </span>
      </td>

      <td className="px-6 py-5">
        <p className="text-base font-black text-slate-950">
          {modele.libelle || 'Modèle sans libellé'}
        </p>
      </td>

      <td className="px-6 py-5">
        <Badge tone="blue">
          {modele.type_equipement?.libelle ||
            modele.type_equipement?.code ||
            'Non défini'}
        </Badge>
      </td>

      <td className="px-6 py-5">
        <Badge tone="green">
          {modele.etat_modele?.libelle ||
            modele.etat_modele?.code ||
            'Non défini'}
        </Badge>
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-end gap-2">
          <Link
            href={`/modeles/${modele.idModele}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#0b3d4f]"
            title="Voir le détail"
          >
            <Eye size={18} />
          </Link>

          <Link
            href={`/modeles/${modele.idModele}/modifier`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#0b3d4f]"
            title="Modifier"
          >
            <Pencil size={18} />
          </Link>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onDelete(modele)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone: 'blue' | 'orange' | 'violet';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    violet: 'bg-violet-50 text-violet-700',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'blue' | 'green';
}) {
  const className =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-blue-50 text-blue-700';

  return (
    <span
      className={`inline-flex max-w-[210px] items-center rounded-full px-3 py-1.5 text-xs font-black ${className}`}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}