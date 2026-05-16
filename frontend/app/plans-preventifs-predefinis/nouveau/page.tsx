'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { PlanPreventifPredefiniForm } from '@/features/plans-preventifs-predefinis/components/PlanPreventifPredefiniForm';
import { usePlanPreventifPredefiniForm } from '@/features/plans-preventifs-predefinis/hooks/usePlanPreventifPredefiniForm';

export default function NouveauPlanPreventifPredefiniPage() {
  const router = useRouter();

  const { values, saving, error, success, setField, handleSubmit } =
    usePlanPreventifPredefiniForm({
      onSuccess: () => router.push('/plans-preventifs-predefinis'),
    });

  function handleBack() {
    router.push('/plans-preventifs-predefinis');
  }

  return (
    <div
      className="min-h-full px-4 py-5 md:px-5"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1080px]">
        <div className="mb-5 flex items-center justify-between gap-3">
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
              Nouveau plan préventif prédéfini
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Création d’un modèle de maintenance préventive.
            </p>
          </div>

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
        </div>

        <PlanPreventifPredefiniForm
          values={values}
          saving={saving}
          error={error}
          success={success}
          setField={setField}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}