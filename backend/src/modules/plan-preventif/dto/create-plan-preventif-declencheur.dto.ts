import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreatePlanPreventifDeclencheurDto {
  @IsOptional()
  @IsInt()
  idPppDeclencheurSource?: number;

  @IsOptional()
  @IsInt()
  priorite?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  etat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  typeDeclencheur?: string;

  @IsOptional()
  @IsInt()
  idGamme?: number;

  @IsOptional()
  @IsInt()
  idPointStructure?: number;

  @IsOptional()
  @IsInt()
  idMateriel?: number;

  @IsOptional()
  @IsInt()
  idModele?: number;

  @IsOptional()
  @IsInt()
  idFamille?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  etatInterventionCible?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  actualisation?: string;

  @IsOptional()
  @IsInt()
  horizonJours?: number;

  @IsOptional()
  @IsInt()
  toleranceJours?: number;

  @IsOptional()
  @IsInt()
  periodiciteValeur?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  periodiciteUnite?: string;

  @IsOptional()
  @IsString()
  prochainLancementDate?: string;

  @IsOptional()
  @IsString()
  derniereRealisationDate?: string;

  @IsOptional()
  @IsString()
  derniereRealisationPrevueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  mesureCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  operateur?: string;

  @IsOptional()
  @IsNumber()
  seuilValeur?: number;

  @IsOptional()
  @IsNumber()
  prochainLancementValeur?: number;

  @IsOptional()
  @IsNumber()
  derniereRealisationValeur?: number;

  @IsOptional()
  @IsNumber()
  derniereRealisationPrevueValeur?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  symptomeCode?: string;

  @IsOptional()
  @IsString()
  saisonnaliteDu?: string;

  @IsOptional()
  @IsString()
  saisonnaliteAu?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}