import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LigneSortieStockDto {
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

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idMateriel?: number;

  @IsPositive()
  @Type(() => Number)
  quantite?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  prixUnitaire?: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
  
}

export class SortieStockDto {
  @IsOptional()
  @IsString()
  numero?: string;

  @IsDateString()
  dateSortie!: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneSortieStockDto)
  lignes!: LigneSortieStockDto[];
}