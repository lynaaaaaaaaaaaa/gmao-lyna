'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCcw } from 'lucide-react';

import { getStockEntrees } from '@/features/stock-entrees/services/stock-entree.service';
import { StockEntreeListOptionB } from '@/features/stock-entrees/components/StockEntreeListOptionB';
import type { StockEntree } from '@/features/stock-entrees/types/stock-entree';

export default function StockEntreesPage() {
  const router = useRouter();

  const [entrees, setEntrees] = useState<StockEntree[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function loadEntrees() {
    try {
      setLoading(true);
      setError(null);

      const data = await getStockEntrees();

      setEntrees(data);
    } catch {
      setError('Erreur lors du chargement des bons d’entrée.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntrees();
  }, []);

  function handleView(id: number) {
    router.push(`/stock/entrees/${id}`);
  }

  function handleCreate() {
    router.push('/stock/entrees/nouvelle');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
              Module stock
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Entrées stock
            </h1>

            <p className="mt-2 text-slate-500">
              Consultez les bons d’entrée, leurs lignes d’articles et les
              matériels générés.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={loadEntrees}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw size={18} />
              Actualiser
            </button>

           <button
  type="button"
  onClick={() => router.push('/stock/entrees/nouvelle')}
  className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-[#0f3d56] px-7 py-4 text-base font-black text-white shadow-sm transition hover:bg-[#0b3044]"
>
  <Plus size={20} />
  Nouvelle entrée
</button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </div>
        )}

        <StockEntreeListOptionB
          entrees={entrees}
          loading={loading}
          onView={handleView}
        />
      </div>
    </main>
  );
}