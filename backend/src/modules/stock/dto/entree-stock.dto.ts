import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MaterielEntreeStockDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  numeroSerie?: string;
}

export class LigneEntreeStockDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idArticle!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idMagasin!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idEmplacement?: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantite!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  prixUnitaire?: number;

  @IsOptional()
  @IsString()
  numeroLot?: string;

  @IsOptional()
  @IsDateString()
  datePeremption?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterielEntreeStockDto)
  materiels?: MaterielEntreeStockDto[];
}

export class EntreeStockDto {
    @IsOptional()
  @IsString()
  numero?: string;
  
  @IsDateString()
  dateReception!: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneEntreeStockDto)
  lignes!: LigneEntreeStockDto[];
}