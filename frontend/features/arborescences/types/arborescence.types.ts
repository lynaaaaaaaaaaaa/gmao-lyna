export type ArborescenceMode = 'GEOGRAPHIQUE' | 'TECHNIQUE' | 'FAMILLE';

export type ArborescenceNodeType =
  | 'POINT_STRUCTURE'
  | 'MATERIEL'
  | 'FAMILLE'
  | 'GROUPE_MODELES'
  | 'MODELE'
  | 'GROUPE_ARTICLES'
  | 'ARTICLE';

export type ArborescenceNode = {
  key: string;
  id: number;
  type: ArborescenceNodeType;
  code: string | null;
  libelle: string | null;
  typePoint?: 'GEOGRAPHIQUE' | 'TECHNIQUE' | null;
  children: ArborescenceNode[];

  meta?: {
    sousFamilles?: number;
    modeles?: number;
    articles?: number;
    gereEnStock?: boolean;
    serialise?: boolean;
    reparable?: boolean;
  };
};