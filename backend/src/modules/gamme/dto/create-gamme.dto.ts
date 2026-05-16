import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGammeDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  libelle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  typeMaintenance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  etat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  organisation?: string;

  @IsOptional()
  @IsInt()
  idModele?: number;

  @IsOptional()
  @IsInt()
  jourFin?: number;

  @IsOptional()
  @IsNumber()
  chargePrevue?: number;

  @IsOptional()
  @IsNumber()
  tempsArret?: number;

  @IsOptional()
  @IsBoolean()
  receptionTravaux?: boolean;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}