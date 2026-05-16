'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import PlanPreventifForm from '@/features/plans-preventifs/components/PlanPreventifForm';
import { useEditPlanPreventifForm } from '@/features/plans-preventifs/hooks/useEditPlanPreventifForm';

export default function ModifierPlanPreventifPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const {
    materiels,
    plansPredefinis,
    values,
    loading,
    saving,
    error,
    success,
    setField,
    handleSubmit,
  } = useEditPlanPreventifForm({
    planId: id,
    onSuccess: () => router.push(`/plans-preventifs/${id}`),
  });

  return (
    <div
      className="min-h-full w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[900px]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: '#6E8CA0' }}
            >
              BMT · Maintenance
            </p>

            <h1
              className="mt-2 text-[28px] font-bold"
              style={{ color: '#183B56' }}
            >
              Modifier plan préventif
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Mise à jour du plan préventif appliqué à un matériel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/plans-preventifs/${id}`)}
            className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium"
            style={{
              borderColor: '#E6EDF2',
              backgroundColor: '#FFFFFF',
              color: '#183B56',
            }}
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </div>

        {loading ? (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement...
          </div>
        ) : (
          <PlanPreventifForm
            values={values}
            materiels={materiels}
            plansPredefinis={plansPredefinis}
            saving={saving}
            error={error}
            success={success}
            setField={setField}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}