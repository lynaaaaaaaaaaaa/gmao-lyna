import { ArborescenceNode } from '../types/arborescence.types';

const API_URL = 'http://localhost:3001';

async function fetchTree(
  endpoint: string,
  errorMessage: string,
): Promise<ArborescenceNode[]> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(errorMessage);
  }

  return res.json();
}

export function getArborescenceGeographique() {
  return fetchTree(
    '/arborescence/geographique/tree',
    "Erreur lors du chargement de l'arborescence géographique",
  );
}

export function getArborescenceTechnique() {
  return fetchTree(
    '/arborescence/technique/tree',
    "Erreur lors du chargement de l'arborescence technique",
  );
}

/* -------------------- FAMILLES -------------------- */

type ApiModele = {
  idModele?: number;
  id?: number;
  code?: string | null;
  libelle?: string | null;
  designation?: string | null;
  reference?: string | null;
};

type ApiArticle = {
  idArticle: number;
  reference?: string | null;
  designation?: string | null;
  gereEnStock?: boolean;
  serialise?: boolean;
  reparable?: boolean;
  actif?: boolean;
};

type ApiFamille = {
  idFamille: number;
  code?: string | null;
  libelle?: string | null;
  parent_id?: number | null;
  modele?: ApiModele[];
  articles?: ApiArticle[];
};

function buildFamilleTree(familles: ApiFamille[]): ArborescenceNode[] {
  const ids = new Set(familles.map((famille) => famille.idFamille));

  const famillesByParent = new Map<number | null, ApiFamille[]>();

  for (const famille of familles) {
    const parentId = famille.parent_id ?? null;

    if (!famillesByParent.has(parentId)) {
      famillesByParent.set(parentId, []);
    }

    famillesByParent.get(parentId)?.push(famille);
  }

  function buildNode(famille: ApiFamille): ArborescenceNode {
    const sousFamilles = famillesByParent.get(famille.idFamille) ?? [];
    const modeles = famille.modele ?? [];
    const articles = famille.articles ?? [];

    const children: ArborescenceNode[] = [
      ...sousFamilles.map(buildNode),

      ...modeles.map((modele, index) => ({
        key: `modele-${modele.idModele ?? modele.id ?? index}`,
        id: modele.idModele ?? modele.id ?? index,
        type: 'MODELE' as const,
        code: null,
        libelle:
          modele.libelle ??
          modele.designation ??
          modele.reference ??
          'Modèle sans libellé',
        children: [],
      })),

      ...articles.map((article) => ({
        key: `article-${article.idArticle}`,
        id: article.idArticle,
        type: 'ARTICLE' as const,
        code: null,
        libelle: article.designation ?? article.reference ?? 'Article sans désignation',
        children: [],
      })),
    ];

    return {
      key: `famille-${famille.idFamille}`,
      id: famille.idFamille,
      type: 'FAMILLE',
      code: null,
      libelle: famille.libelle ?? 'Famille sans libellé',
      children,
    };
  }

  const roots = familles.filter(
    (famille) => famille.parent_id == null || !ids.has(famille.parent_id),
  );

  return roots.map(buildNode);
}
export async function getArborescenceFamilles() {
  const res = await fetch(`${API_URL}/familles`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement de l'arborescence des familles");
  }

  const familles: ApiFamille[] = await res.json();

  return buildFamilleTree(familles);
}