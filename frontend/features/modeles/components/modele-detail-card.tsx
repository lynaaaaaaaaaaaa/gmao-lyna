import {
  Boxes,
  Building2,
  CalendarClock,
  Factory,
  Info as InfoIcon,
  Layers3,
  Package,
  Pencil,
  RefreshCcw,
  Tag,
  Wrench,
} from 'lucide-react';

import type { ModeleApi } from '@/features/modeles/types/modele';

type MaterielLite = {
  idMateriel: number;
  code?: string | null;
  numeroSerie?: string | null;
  actif?: boolean | null;
};

export type ModeleDetail = ModeleApi & {
  materiel?: MaterielLite[];
  gamme?: unknown[];
  articles?: unknown[];
  plan_preventif_predefini?: unknown[];
};

type Props = {
  modele: ModeleDetail;
  refreshing?: boolean;
  onRefresh: () => void;
  onEdit: () => void;
};

function formatBudget(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return String(value);

  return `${new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 2,
  }).format(numberValue)} DA`;
}

export default function ModeleDetailCard({
  modele,
  refreshing = false,
  onRefresh,
  onEdit,
}: Props) {
  const code = modele.code || `MOD-${modele.idModele}`;
  const libelle = modele.libelle || 'Sans libellé';

  const etatLabel =
    modele.etat_modele?.libelle || modele.etat_modele?.code || 'Non défini';

  const typeLabel =
    modele.type_equipement?.libelle ||
    modele.type_equipement?.code ||
    'Non défini';

  const familleLabel =
    modele.famille?.libelle || modele.famille?.code || 'Aucune';

  const fabricantLabel =
    modele.fabricant?.nom || modele.fabricant?.code || '—';

  const marqueLabel = modele.marque?.libelle || modele.marque?.code || '—';

  const nbMateriels = modele.materiel?.length ?? 0;
  const nbGammes = modele.gamme?.length ?? 0;
  const nbArticles = modele.articles?.length ?? 0;
  const nbPpp = modele.plan_preventif_predefini?.length ?? 0;

  return (
    <>
      <section className="mb-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Boxes size={28} />
            </div>

            <div>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                  {libelle}
                </h1>

                <span className="rounded-xl bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                  {etatLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCcw
                size={16}
                className={refreshing ? 'animate-spin' : ''}
              />
              Actualiser
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-5 text-sm font-bold text-white shadow-md shadow-[#06475a]/20 transition hover:bg-[#043747]"
            >
              <Pencil size={16} />
              Modifier
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card title="Identification" icon={<Layers3 size={19} />}>
            <InfoGrid>
              <Info label="Code" value={code} />
              <Info label="Libellé" value={libelle} />
              <Info label="Famille" value={familleLabel} />
              <Info label="Type" value={typeLabel} />
              <Info label="État" value={etatLabel} />
              <Info label="Matériels" value={String(nbMateriels)} />
            </InfoGrid>

            <InfoBlock
              label="Commentaire maintenance"
              value={modele.commentaire}
            />
          </Card>

          <Card title="Référentiel technique" icon={<Wrench size={19} />}>
            <InfoGrid>
              <Info label="Type d’équipement" value={typeLabel} />
              <Info label="Fabricant" value={fabricantLabel} />
              <Info label="Marque" value={marqueLabel} />
              <Info
                label="Durée de vie"
                value={modele.dureeVie ? `${modele.dureeVie} ans` : '—'}
              />
              <Info label="Budget" value={formatBudget(modele.budget)} />
            </InfoGrid>
          </Card>

          <Card title="Matériels rattachés" icon={<Package size={19} />}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Liste des matériels associés à ce modèle.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {nbMateriels}
              </span>
            </div>

            {!modele.materiel || modele.materiel.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm font-semibold text-slate-500">
                Aucun matériel rattaché à ce modèle.
              </div>
            ) : (
              <div className="space-y-2">
                {modele.materiel.map((materiel) => (
                  <div
                    key={materiel.idMateriel}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-black text-slate-900">
                        {materiel.numeroSerie || materiel.code || '-'}
                      </p>

                      <p className="text-sm text-slate-500">
                        Code : {materiel.code || '-'}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        materiel.actif
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {materiel.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Classification" icon={<Factory size={19} />}>
            <SideInfo label="TYPE D’ÉQUIPEMENT" value={typeLabel} />
            <SideInfo label="FAMILLE" value={familleLabel} />
            <SideInfo label="FABRICANT" value={fabricantLabel} />
            <SideInfo label="MARQUE" value={marqueLabel} />
          </Card>

          <Card title="Renouvellement" icon={<CalendarClock size={19} />}>
            <SideInfo
              label="DURÉE DE VIE"
              value={modele.dureeVie ? `${modele.dureeVie} ans` : '—'}
            />
            <SideInfo label="BUDGET" value={formatBudget(modele.budget)} />
          </Card>

         
        </div>
      </div>
    </>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-[#06475a]">
          {icon}
        </div>

        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-x-8 md:grid-cols-2">{children}</div>;
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center border-b border-slate-100 py-4">
      <p className="text-sm font-black text-slate-500">{label}</p>

      <p className="truncate text-right text-sm font-black text-slate-950">
        {value || '—'}
      </p>
    </div>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>

      <p className="text-sm font-medium leading-6 text-slate-600">
        {value || 'Aucune information renseignée.'}
      </p>
    </div>
  );
}

function SideInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-base font-black text-slate-950">
        {value || '—'}
      </p>
    </div>
  );
}