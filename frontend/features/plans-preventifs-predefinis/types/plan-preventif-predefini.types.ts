export interface PppDeclencheur {
  idPppDeclencheur: number;
  idPlanPreventifPredefini: number;
  priorite?: number | null;
  etat?: string | null;
  typeDeclencheur: string;
  idGamme: number;
  idModele?: number | null;
  etatInterventionCible?: string | null;
  horizonJours?: number | null;
  toleranceJours?: number | null;
  actualisation?: string | null;
  periodiciteValeur?: number | null;
  periodiciteUnite?: string | null;
  nombreJoursPremierLancement?: number | null;
  mesureCode?: string | null;
  seuilValeur?: number | null;
  operateur?: string | null;
  symptomeCode?: string | null;
  saisonnaliteDu?: string | null;
  saisonnaliteAu?: string | null;
  actif?: boolean | null;
}

export interface PlanPreventifPredefini {
  idPlanPreventifPredefini: number;
  code: string;
  titre?: string | null;
  etat?: string | null;
  typeDeclenchement?: string | null;
  organisation?: string | null;
  idModele?: number | null;
  actif?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
  modele?: {
    idModele: number;
    code?: string | null;
    libelle?: string | null;
  } | null;
  ppp_declencheur?: PppDeclencheur[];
  plan_preventif?: Array<{
    idPlanPreventif: number;
    code: string;
    libelle?: string | null;
  }>;
}

export type CreatePlanPreventifPredefiniPayload = {
  code: string;
  libelle?: string;
  etat?: string;
  organisation?: string;
  typeDeclenchement?: string;
  idModele?: number;
  actif?: boolean;
};

export type UpdatePlanPreventifPredefiniPayload =
  Partial<CreatePlanPreventifPredefiniPayload>;

export type CreatePppDeclencheurPayload = {
  priorite?: number;
  etat?: string;
  typeDeclencheur?: string;
  idGamme: number;
  idModele?: number;
  etatInterventionCible?: string;
  actualisation?: string;
  horizonJours?: number;
  toleranceJours?: number;
  periodiciteValeur?: number;
  periodiciteUnite?: string;
  nombreJoursPremierLancement?: number;
  mesureCode?: string;
  operateur?: string;
  seuilValeur?: number;
  symptomeCode?: string;
  actif?: boolean;
};

export type UpdatePppDeclencheurPayload =
  Partial<CreatePppDeclencheurPayload>;

export type DeclencheurFormValues = {
  priorite: string;
  typeDeclencheur: string;
  idGamme: string;
  idModele: string;
  horizonJours: string;
  toleranceJours: string;
  periodiciteValeur: string;
  periodiciteUnite: string;
  actif: boolean;
  nombreJoursPremierLancement: string;
  mesureCode: string;
  operateur: string;
  seuilValeur: string;
  symptomeCode: string;
};