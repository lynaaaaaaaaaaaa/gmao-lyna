'use client';

import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import GammeEditForm from '@/features/gammes/components/GammeEditForm';
import { useEditGammeForm } from '@/features/gammes/hooks/useEditGammeForm';
import { deleteGammeOperation } from '@/features/gammes/services/gamme.service';

function formatBoolean(value?: boolean | null) {
  if (value === true) return 'Oui';
  if (value === false) return 'Non';
  return '-';
}

export default function ModifierGammePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const {
    values,
    loading,
    saving,
    error,
    success,
    setField,
    handleSubmit,
    gamme,
    refetchGamme,
  } = useEditGammeForm({
    gammeId: id,
    onSuccess: () => {},
  });

  function handleBack() {
    router.push(`/gammes/${id}`);
  }

  function handleAddOperation() {
    router.push(`/gammes/${id}/operations/nouveau`);
  }

  function handleEditOperation(operationId: number) {
    router.push(`/gammes/${id}/operations/${operationId}/modifier`);
  }

  async function handleDeleteOperation(operationId: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette opération ?',
    );

    if (!confirmed) return;

    try {
      await deleteGammeOperation(operationId);
      await refetchGamme();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de l'opération.",
      );
    }
  }

  return (
    <div
      className="min-h-full p-5"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl">
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
              Modifier la gamme
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Mise à jour des informations de la gamme et gestion des opérations associées.
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
            Chargement...
          </div>
        ) : (
          <div className="space-y-5">
            <GammeEditForm
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
                className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
                style={{ borderColor: '#EDF2F6' }}
              >
                <div>
                  <h2
                    className="text-[18px] font-semibold"
                    style={{ color: '#183B56' }}
                  >
                    Opérations associées
                  </h2>
                  <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
                    Gère directement les opérations liées à cette gamme.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddOperation}
                  className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition hover:bg-slate-50"
                  style={{
                    borderColor: '#E6EDF2',
                    backgroundColor: '#FFFFFF',
                    color: '#183B56',
                  }}
                >
                  <Plus size={15} />
                  <span>Ajouter une opération</span>
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr
                      className="border-b text-left text-[12px] font-semibold uppercase tracking-[0.22em]"
                      style={{
                        borderColor: '#EDF2F6',
                        color: '#8AA0B2',
                      }}
                    >
                      <th className="px-5 py-4">Ordre</th>
                      <th className="px-5 py-4">Libellé</th>
                      <th className="px-5 py-4">Description</th>
                      <th className="px-5 py-4">Temps standard</th>
                      <th className="px-5 py-4">Obligatoire</th>
                      <th className="px-5 py-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!gamme?.gamme_operation || gamme.gamme_operation.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-6 text-[15px]"
                          style={{ color: '#183B56' }}
                        >
                          Aucune opération trouvée.
                        </td>
                      </tr>
                    ) : (
                      gamme.gamme_operation.map((operation) => (
                        <tr
                          key={operation.idOperation}
                          className="border-b"
                          style={{ borderColor: '#F1F5F8' }}
                        >
                          <td className="px-5 py-5" style={{ color: '#183B56' }}>
                            {operation.ordre ?? '-'}
                          </td>
                          <td
                            className="px-5 py-5 font-medium"
                            style={{ color: '#183B56' }}
                          >
                            {operation.libelle || '-'}
                          </td>
                          <td className="px-5 py-5" style={{ color: '#183B56' }}>
                            {operation.description || '-'}
                          </td>
                          <td className="px-5 py-5" style={{ color: '#183B56' }}>
                            {operation.tempsStandard ?? '-'}
                          </td>
                          <td className="px-5 py-5" style={{ color: '#183B56' }}>
                            {formatBoolean(operation.obligatoire)}
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditOperation(operation.idOperation)
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full border transition"
                                style={{
                                  borderColor: '#E4EBF0',
                                  color: '#6E8CA0',
                                  backgroundColor: '#FFFFFF',
                                }}
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteOperation(operation.idOperation)
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full border transition"
                                style={{
                                  borderColor: '#F2D2D2',
                                  color: '#D46A6A',
                                  backgroundColor: '#FFFFFF',
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}