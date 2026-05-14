'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { ArticleTable } from '@/features/articles/components/ArticleTable';
import {
  deleteArticle,
  getArticles,
} from '@/features/articles/services/article.service';
import { Article } from '@/features/articles/types/article';

export default function ArticlesPage() {
  const router = useRouter();
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      const result = await getArticles();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm('Voulez-vous vraiment supprimer cet article ?')) return;

    try {
      await deleteArticle(id);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  }

  return (
  <div className="min-h-screen w-full bg-slate-50 px-5 py-6 lg:px-8">
    <div className="w-full max-w-none">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
              BMT · Module stock
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#0f3d56]">
              Articles
            </h1>
            <p className="mt-2 text-slate-500">
              Gestion des articles, pièces et équipements sérialisés.
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>

        {loading && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Chargement des articles...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <ArticleTable
            data={data}
            onCreate={() => router.push('/articles/nouveau')}
            onEdit={(id) => router.push(`/articles/${id}/modifier`)}
            onRemove={handleDelete}
          />
        )}
         </div>
  </div>

  );
}