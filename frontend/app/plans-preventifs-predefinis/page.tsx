'use client';

import { useRouter } from 'next/navigation';

import { PlanPreventifPredefiniTable } from '@/features/plans-preventifs-predefinis/components/PlanPreventifPredefiniTable';
import { PlanPreventifPredefiniToolbar } from '@/features/plans-preventifs-predefinis/components/PlanPreventifPredefiniToolbar';
import { usePlansPreventifsPredefinis } from '@/features/plans-preventifs-predefinis/hooks/usePlansPreventifsPredefinis';

export default function PlansPreventifsPredefinisPage() {
  const router = useRouter();

  const {
    filteredItems,
    loading,
    error,
    search,
    setSearch,
    etat,
    setEtat,
    typeDeclenchement,
    setTypeDeclenchement,
    etatsOptions,
    typesDeclenchementOptions,
    handleDelete,
  } = usePlansPreventifsPredefinis();

  function handleCreate() {
    router.push('/plans-preventifs-predefinis/nouveau');
  }

  function handleView(id: number) {
    router.push(`/plans-preventifs-predefinis/${id}`);
  }

  function handleEdit(id: number) {
    router.push(`/plans-preventifs-predefinis/${id}/modifier`);
  }

  return (
    <div
      className="min-h-full overflow-x-hidden px-4 py-5 md:px-5"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-4">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.26em]"
            style={{ color: '#6E8CA0' }}
          >
            BMT · Maintenance préventive
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1
              className="text-[28px] font-bold leading-tight"
              style={{ color: '#183B56' }}
            >
              Plans préventifs prédéfinis
            </h1>
          </div>

          <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
            Gestion des modèles de maintenance préventive et de leurs
            déclencheurs.
          </p>
        </div>

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement des plans préventifs prédéfinis...
          </div>
        )}

        {error && (
          <div
            className="rounded-xl border px-4 py-3 text-[13px]"
            style={{
              borderColor: '#E8B4B4',
              color: '#8A1F1F',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div
            className="w-full overflow-hidden rounded-[20px] border"
            style={{
              borderColor: '#E4EBF0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(15, 35, 55, 0.05)',
            }}
          >
            <PlanPreventifPredefiniToolbar
              search={search}
              etat={etat}
              typeDeclenchement={typeDeclenchement}
              etatsOptions={etatsOptions}
              typesDeclenchementOptions={typesDeclenchementOptions}
              onSearchChange={setSearch}
              onEtatChange={setEtat}
              onTypeDeclenchementChange={setTypeDeclenchement}
              onCreate={handleCreate}
            />

            <PlanPreventifPredefiniTable
              items={filteredItems}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}