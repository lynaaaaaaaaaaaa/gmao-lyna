'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import GammeForm from '@/features/gammes/components/GammeForm';
import { useGammeForm } from '@/features/gammes/hooks/useGammeForm';

export default function NouveauGammePage() {
  const router = useRouter();

  const { values, saving, error, success, setField, handleSubmit } =
    useGammeForm({
      onSuccess: () => router.push('/gammes'),
    });

  function handleBack() {
    router.push('/gammes');
  }

  return (
    <div
      className="min-h-full p-5"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
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
              Nouvelle gamme
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Création d’une nouvelle gamme de maintenance.
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

        <GammeForm
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