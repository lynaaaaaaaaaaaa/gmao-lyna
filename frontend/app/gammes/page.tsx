'use client';

import { useRouter } from 'next/navigation';

import { GammeTable } from '@/features/gammes/components/GammeTable';
import { useGammes } from '@/features/gammes/hooks/useGammes';

export default function GammesPage() {
  const router = useRouter();

  const {
    loading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    filteredGammes,
    handleDeleteGamme,
  } = useGammes();

  function handleCreate() {
    router.push('/gammes/nouveau');
  }

  function handleView(idGamme: number) {
    router.push(`/gammes/${idGamme}`);
  }

  function handleEdit(idGamme: number) {
    router.push(`/gammes/${idGamme}/modifier`);
  }

  return (
    <div
      className="min-h-full overflow-x-hidden p-5"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <div className="mb-4">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.26em]"
            style={{ color: '#6E8CA0' }}
          >
            BMT · Maintenance
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1
              className="text-[28px] font-bold leading-tight"
              style={{ color: '#183B56' }}
            >
              Gammes de maintenance
            </h1>
          </div>

          <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
            Gestion des gammes et des opérations de maintenance associées.
          </p>
        </div>

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement des gammes...
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
            className="overflow-hidden rounded-[20px] border"
            style={{
              borderColor: '#E4EBF0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(15, 35, 55, 0.05)',
            }}
          >
            <div
              className="flex flex-col gap-4 border-b px-5 py-4 md:flex-row md:items-center md:justify-between"
              style={{ borderColor: '#EDF2F6' }}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:flex-wrap">
                <input
                  type="text"
                  placeholder="Rechercher une gamme"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[54px] min-w-0 flex-1 rounded-[16px] border px-4 text-[14px] outline-none transition"
                  style={{
                    borderColor: '#E4EBF0',
                    color: '#183B56',
                    backgroundColor: '#FFFFFF',
                  }}
                />

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-[54px] w-full rounded-[16px] border px-4 text-[14px] outline-none md:w-[260px]"
                  style={{
                    borderColor: '#E4EBF0',
                    color: '#183B56',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="ALL">Toutes les gammes</option>
                  <option value="PREVENTIF">Préventif</option>
                  <option value="CORRECTIF">Correctif</option>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                  <option value="BROUILLON">Brouillon</option>
                  <option value="VALIDE">Validé</option>
                </select>

                <button
                  type="button"
                  className="inline-flex h-[54px] items-center justify-center rounded-[16px] border px-5 text-[14px] font-medium transition"
                  style={{
                    borderColor: '#E4EBF0',
                    backgroundColor: '#FFFFFF',
                    color: '#183B56',
                  }}
                >
                  Exporter
                </button>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex h-[54px] w-[54px] items-center justify-center rounded-[16px] border text-[28px] transition"
                style={{
                  borderColor: '#E4EBF0',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
              >
                +
              </button>
            </div>

            <GammeTable
              gammes={filteredGammes}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteGamme}
            />
          </div>
        )}
      </div>
    </div>
  );
}