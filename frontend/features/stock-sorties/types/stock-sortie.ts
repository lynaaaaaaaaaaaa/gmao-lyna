export type StockArticle = {
  idArticle: number;
  reference?: string | null;
  code?: string | null;
  libelle?: string | null;
  designation?: string | null;
  serialise?: boolean | null;
};

export type StockMagasin = {
  idMagasin: number;
  code?: string | null;
  libelle?: string | null;
};

export type StockEmplacement = {
  idEmplacement: number;
  code?: string | null;
  libelle?: string | null;
};

export type StockMateriel = {
  idMateriel: number;
  code?: string | null;
  numeroSerie?: string | null;
  libelle?: string | null;
};

export type StockSortieLigne = {
  idLigneSortieStock: number;
  idSortieStock?: number;
  idArticle?: number;
  idMagasin?: number;
  idEmplacement?: number | null;
  idMateriel?: number | null;

  quantite: number | string;
  prixUnitaire?: number | string | null;
  commentaire?: string | null;

  article?: StockArticle | null;
  magasin?: StockMagasin | null;
  emplacement?: StockEmplacement | null;
  materiel?: StockMateriel | null;
};

export type StockSortie = {
  idSortieStock: number;
  numero?: string | null;
  dateSortie?: string | Date | null;
  commentaire?: string | null;
  statut?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  lignes?: StockSortieLigne[];
  sortie_stock_ligne?: StockSortieLigne[];
  sortieStockLigne?: StockSortieLigne[];
};

export type LigneStockSortieDto = {
  idArticle: number;
  idMagasin: number;
  idEmplacement?: number | null;
  idMateriel?: number | null;
  quantite: number;
  prixUnitaire?: number | null;
  commentaire?: string;
};

export type CreateStockSortieDto = {
  numero?: string;
  dateSortie: string;
  commentaire?: string;
  lignes: LigneStockSortieDto[];
};