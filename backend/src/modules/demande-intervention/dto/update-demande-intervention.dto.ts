import { PartialType } from '@nestjs/mapped-types';
import { CreateDemandeInterventionDto } from './create-demande-intervention.dto';

export class UpdateDemandeInterventionDto extends PartialType(
  CreateDemandeInterventionDto,
) {}