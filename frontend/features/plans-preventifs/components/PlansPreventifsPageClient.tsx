'use client';

import { useRouter } from 'next/navigation';

import { usePlansPreventifs } from '../hooks/usePlansPreventifs';
import PlanPreventifTable from './PlanPreventifTable';
import PlanPreventifToolbar from './PlanPreventifToolbar';

export default function PlansPreventifsPageClient() {
  const router = useRouter();
  const { plans, loading, error, refetch } = usePlansPreventifs();

  return (
    <div
      className="min-h-full w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: '#6E8CA0' }}
            >
              BMT · Maintenance
            </p>

            <h1
              className="mt-2 text-[28px] font-bold leading-tight"
              style={{ color: '#183B56' }}
            >
              Plans préventifs
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Gestion des plans préventifs appliqués aux équipements.
            </p>
          </div>

          <PlanPreventifToolbar
            onRefresh={refetch}
            onCreate={() => router.push('/plans-preventifs/nouveau')}
          />
        </div>

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement des plans préventifs...
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
          <PlanPreventifTable
            plans={plans}
            onOpen={(id) => router.push(`/plans-preventifs/${id}`)}
          />
        )}
      </div>
    </div>
  );
}