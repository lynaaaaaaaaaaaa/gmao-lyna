'use client';

import { ChevronLeft, Pencil } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { PlanPreventifPredefiniDetailCard } from '@/features/plans-preventifs-predefinis/components/PlanPreventifPredefiniDetailCard';
import { usePlanPreventifPredefiniDetail } from '@/features/plans-preventifs-predefinis/hooks/usePlanPreventifPredefiniDetail';

export default function DetailPlanPreventifPredefiniPage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params?.id);
  const { item, loading, error } = usePlanPreventifPredefiniDetail(id);

  function handleBack() {
    router.push('/plans-preventifs-predefinis');
  }

  function handleEdit() {
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
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: '#6E8CA0' }}
            >
              BMT · Maintenance préventive
            </p>

            <h1
              className="mt-2 text-[28px] font-bold leading-tight"
              style={{ color: '#183B56' }}
            >
              Détail du plan préventif prédéfini
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Consultation des informations générales et des déclencheurs associés.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition hover:bg-slate-50"
              style={{
                borderColor: '#E6EDF2',
                backgroundColor: '#FFFFFF',
                color: '#183B56',
              }}
            >
              <ChevronLeft size={16} />
              <span>Retour</span>
            </button>

            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex h-[42px] items-center gap-2 rounded-[12px] px-4 text-[13px] font-medium text-white transition"
              style={{ backgroundColor: '#1D5C83' }}
            >
              <Pencil size={16} />
              <span>Modifier</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement du plan préventif prédéfini...
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

        {!loading && !error && item && (
          <PlanPreventifPredefiniDetailCard item={item} />
        )}
      </div>
    </div>
  );
}