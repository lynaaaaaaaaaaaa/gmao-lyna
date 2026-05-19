export type StockSortieLigne = {
  idLigneSortieStock: number;
  idSortieStock: number;
  idArticle: number;
  idMagasin: number;
  idEmplacement?: number | null;
  idMateriel?: number | null;
  quantite: number | string;
  prixUnitaire?: number | string | null;
  commentaire?: string | null;

  article?: {
    idArticle: number;
    reference?: string | null;
    designation?: string | null;
    libelle?: string | null;
    serialise?: boolean | null;
  } | null;

  magasin?: {
    idMagasin: number;
    code?: string | null;
    libelle?: string | null;
  } | null;
};

export type StockSortie = {
  idSortieStock: number;
  numero?: string | null;
  dateSortie: string;
  commentaire?: string | null;
  statut?: string | null;
  sortie_stock_ligne?: StockSortieLigne[];
  lignes?: StockSortieLigne[];
};

export type CreateStockSortieDto = {
  numero?: string;
  dateSortie: string;
  commentaire?: string | null;
  lignes: LigneSortieStockCrudDto[];
};

export type UpdateStockSortieDto = {
  numero?: string;
  dateSortie?: string;
  commentaire?: string | null;
};

export type LigneSortieStockCrudDto = {
  idArticle: number;
  idMagasin: number;
  idEmplacement?: number | null;
  quantite: number;
  prixUnitaire?: number | null;
  commentaire?: string | null;
};

export type UpdateLigneSortieStockDto = {
  idArticle?: number | null;
  idMagasin?: number | null;
  idEmplacement?: number | null;
  quantite?: number | null;
  prixUnitaire?: number | null;
  commentaire?: string | null;
};