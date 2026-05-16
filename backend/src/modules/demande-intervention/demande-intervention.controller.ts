import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DemandeInterventionService } from './demande-intervention.service';
import { CreateDemandeInterventionDto } from './dto/create-demande-intervention.dto';
import { UpdateDemandeInterventionDto } from './dto/update-demande-intervention.dto';
import { ValiderDemandeInterventionDto } from './dto/valider-demande-intervention.dto';
import { RefuserDemandeInterventionDto } from './dto/refuser-demande-intervention.dto';
import { GenerateOtCorrectiveDto } from './dto/generate-ot-corrective.dto';

@Controller('demandes-intervention')
export class DemandeInterventionController {
  constructor(private readonly service: DemandeInterventionService) {}

  @Get('dashboard/responsable')
  dashboardResponsable() {
    return this.service.dashboardResponsable();
  }

  @Get('statut/:statut')
  findByStatut(@Param('statut') statut: string) {
    return this.service.findByStatut(statut);
  }

  @Post()
  create(@Body() dto: CreateDemandeInterventionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDemandeInterventionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/valider')
  valider(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValiderDemandeInterventionDto,
  ) {
    return this.service.valider(id, dto);
  }

  @Patch(':id/refuser')
  refuser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RefuserDemandeInterventionDto,
  ) {
    return this.service.refuser(id, dto);
  }

  @Post(':id/generate-ot-corrective')
  generateOtCorrective(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GenerateOtCorrectiveDto,
  ) {
    return this.service.generateOtCorrective(id, dto);
  }
}