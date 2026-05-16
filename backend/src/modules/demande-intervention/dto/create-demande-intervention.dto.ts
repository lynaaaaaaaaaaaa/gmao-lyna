import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDemandeInterventionDto {
  @IsOptional()
  @IsString()
  dateDemande?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  statut?: string;

  @IsInt()
  idMateriel!: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  priorite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  createdBy?: string;
}