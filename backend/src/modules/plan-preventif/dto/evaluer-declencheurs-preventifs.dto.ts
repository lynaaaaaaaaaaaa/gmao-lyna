import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class EvaluerDeclencheursPreventifsDto {
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MANUEL', 'AUTOMATIQUE'])
  typeDeclenchement?: string;

  @IsOptional()
  @IsBoolean()
  inclureInactifs?: boolean;
}