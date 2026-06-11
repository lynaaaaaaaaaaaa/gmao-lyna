import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateConsommationInterventionDto {
  @IsInt()
  idArticle!: number;

  @IsInt()
  idMagasin!: number;

  @IsOptional()
  @IsInt()
  idEmplacement?: number;

  @IsOptional()
  @IsInt()
  idMateriel?: number;

  @IsInt()
  @Min(1)
  quantite!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prixUnitaire?: number;

  @IsOptional()
  @IsDateString()
  dateSortie?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  createdBy?: string;
}