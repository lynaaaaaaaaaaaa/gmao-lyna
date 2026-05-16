'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { PlanPreventifPredefiniForm } from '@/features/plans-preventifs-predefinis/components/PlanPreventifPredefiniForm';
import { PppDeclencheurForm } from '@/features/plans-preventifs-predefinis/components/PppDeclencheurForm';
import { PppDeclencheurTable } from '@/features/plans-preventifs-predefinis/components/PppDeclencheurTable';
import { useEditPlanPreventifPredefiniForm } from '@/features/plans-preventifs-predefinis/hooks/useEditPlanPreventifPredefiniForm';

export default function ModifierPlanPreventifPredefiniPage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params?.id);

  const {
    item,
    values,
    loading,
    saving,
    error,
    success,
    setField,
    handleSubmit,

    declencheurValues,
    declencheurSaving,
    declencheurError,
    editingDeclencheurId,
    setDeclencheurField,
    handleCreateOrUpdateDeclencheur,
    handleDeleteDeclencheur,
    startEditDeclencheur,
    resetDeclencheurForm,
  } = useEditPlanPreventifPredefiniForm({
    id,
  });

  function handleBack() {
    router.push(`/plans-preventifs-predefinis/${id}`);
  }

  return (
    <div
      className="min-h-full overflow-x-hidden px-4 py-5 md:px-5"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1240px]">
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
              Modifier le plan préventif prédéfini
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Mise à jour du plan et gestion de ses déclencheurs.
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

        {loading ? (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement du plan préventif prédéfini...
          </div>
        ) : (
          <div className="space-y-5">
            <PlanPreventifPredefiniForm
              values={values}
              saving={saving}
              error={error}
              success={success}
              setField={setField}
              onSubmit={handleSubmit}
            />

            <div
              className="overflow-hidden rounded-[20px] border"
              style={{
                borderColor: '#E4EBF0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(15, 35, 55, 0.05)',
              }}
            >
              <div
                className="border-b px-5 py-4"
                style={{ borderColor: '#EDF2F6' }}
              >
                <h2
                  className="text-[18px] font-semibold"
                  style={{ color: '#183B56' }}
                >
                  {editingDeclencheurId
                    ? 'Modifier le déclencheur PPP'
                    : 'Ajouter un déclencheur PPP'}
                </h2>
                <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
                  {editingDeclencheurId
                    ? 'Mettez à jour la règle de déclenchement sélectionnée.'
                    : 'Associez une règle de déclenchement au plan.'}
                </p>
              </div>

              <div className="px-5 py-5">
                <PppDeclencheurForm
                  values={declencheurValues}
                  saving={declencheurSaving}
                  error={declencheurError}
                  editingId={editingDeclencheurId}
                  setField={setDeclencheurField}
                  onSubmit={handleCreateOrUpdateDeclencheur}
                  onCancelEdit={resetDeclencheurForm}
                />
              </div>
            </div>

            <div
              className="overflow-hidden rounded-[20px] border"
              style={{
                borderColor: '#E4EBF0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(15, 35, 55, 0.05)',
              }}
            >
              <div
                className="border-b px-5 py-4"
                style={{ borderColor: '#EDF2F6' }}
              >
                <h2
                  className="text-[18px] font-semibold"
                  style={{ color: '#183B56' }}
                >
                  Déclencheurs existants
                </h2>
                <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
                  Liste des déclencheurs déjà associés à ce PPP.
                </p>
              </div>

              <PppDeclencheurTable
                items={item?.ppp_declencheur ?? []}
                onEdit={startEditDeclencheur}
                onDelete={handleDeleteDeclencheur}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}