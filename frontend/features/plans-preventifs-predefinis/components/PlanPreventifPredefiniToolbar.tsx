'use client';

type PlanPreventifPredefiniToolbarProps = {
  search: string;
  etat: string;
  typeDeclenchement: string;
  etatsOptions: string[];
  typesDeclenchementOptions: string[];
  onSearchChange: (value: string) => void;
  onEtatChange: (value: string) => void;
  onTypeDeclenchementChange: (value: string) => void;
  onCreate: () => void;
};

export function PlanPreventifPredefiniToolbar({
  search,
  etat,
  typeDeclenchement,
  etatsOptions,
  typesDeclenchementOptions,
  onSearchChange,
  onEtatChange,
  onTypeDeclenchementChange,
  onCreate,
}: PlanPreventifPredefiniToolbarProps) {
  return (
    <div
      className="border-b px-4 py-4 md:px-5"
      style={{ borderColor: '#EDF2F6' }}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3 xl:flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par code, titre, état..."
            className="h-[44px] w-full min-w-0 rounded-[14px] border px-4 text-[14px] outline-none"
            style={{
              borderColor: '#E4EBF0',
              color: '#183B56',
              backgroundColor: '#FFFFFF',
            }}
          />

          <select
            value={etat}
            onChange={(e) => onEtatChange(e.target.value)}
            className="h-[44px] w-full min-w-0 rounded-[14px] border px-4 text-[14px] outline-none"
            style={{
              borderColor: '#E4EBF0',
              color: '#183B56',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="">Tous les états</option>
            {etatsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={typeDeclenchement}
            onChange={(e) => onTypeDeclenchementChange(e.target.value)}
            className="h-[44px] w-full min-w-0 rounded-[14px] border px-4 text-[14px] outline-none"
            style={{
              borderColor: '#E4EBF0',
              color: '#183B56',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="">Tous les types</option>
            {typesDeclenchementOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end xl:ml-4">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-[44px] items-center justify-center rounded-[14px] px-5 text-[14px] font-medium text-white transition"
            style={{ backgroundColor: '#1D5C83' }}
          >
            Nouveau PPP
          </button>
        </div>
      </div>
    </div>
  );
}