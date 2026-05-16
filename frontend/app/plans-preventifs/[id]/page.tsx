'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import PlanPreventifDetailCard from '@/features/plans-preventifs/components/PlanPreventifDetailCard';
import { usePlanPreventifDetail } from '@/features/plans-preventifs/hooks/usePlanPreventifDetail';

export default function PlanPreventifDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const {
    plan,
    loading,
    deleting,
    actionLoading,
    error,
    success,
    refetch,
    handleDelete,
    handleRegenerateDeclencheurs,
    handleGenerateOt,
  } = usePlanPreventifDetail({
    planId: id,
    onDeleteSuccess: () => router.push('/plans-preventifs'),
  });

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
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: '#6E8CA0' }}>
              BMT · Maintenance
            </p>

            <h1 className="mt-2 text-[28px] font-bold" style={{ color: '#183B56' }}>
              Détail plan préventif {plan?.code ? `· ${plan.code}` : ''}
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Consultation du plan, des déclencheurs et génération des OT préventifs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push('/plans-preventifs')}
              className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold"
              style={{ borderColor: '#E6EDF2', backgroundColor: '#FFFFFF', color: '#183B56' }}
            >
              <ArrowLeft size={16} />
              Retour
            </button>

            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold"
              style={{ borderColor: '#E6EDF2', backgroundColor: '#FFFFFF', color: '#183B56' }}
            >
              Actualiser
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-5 rounded-xl border px-4 py-3 text-[13px]" style={{ borderColor: '#B9E2C4', color: '#1F6B3A', backgroundColor: '#FFFFFF' }}>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border px-4 py-3 text-[13px]" style={{ borderColor: '#E8B4B4', color: '#8A1F1F', backgroundColor: '#FFFFFF' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement...
          </div>
        )}

        {!loading && plan && (
          <PlanPreventifDetailCard
            plan={plan}
            deleting={deleting}
            actionLoading={actionLoading}
            onEdit={() => router.push(`/plans-preventifs/${id}/modifier`)}
            onDelete={handleDelete}
            onRegenerateDeclencheurs={handleRegenerateDeclencheurs}
            onGenerateOt={handleGenerateOt}
          />
        )}
      </div>
    </div>
  );
}