import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePppDeclencheurDto {
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
  idModele?: number;

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
  @IsInt()
  nombreJoursPremierLancement?: number;

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
  @IsString()
  @MaxLength(50)
  symptomeCode?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}