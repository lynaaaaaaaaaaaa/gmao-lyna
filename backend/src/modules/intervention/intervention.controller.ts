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
import { InterventionService } from './intervention.service';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { AffecterTechnicienDto } from './dto/affecter-technicien.dto';
import { RealiserInterventionDto } from './dto/realiser-intervention.dto';
import { AffecterEquipeDto } from './dto/affecter-equipe.dto';

@Controller('interventions')
export class InterventionController {
  constructor(private readonly service: InterventionService) {}

  @Get('dashboard/responsable')
  dashboardResponsable() {
    return this.service.dashboardResponsable();
  }

  @Get('dashboard/equipe/:idEquipe')
  dashboardEquipe(@Param('idEquipe', ParseIntPipe) idEquipe: number) {
    return this.service.dashboardEquipe(idEquipe);
  }

  @Get('dashboard/technicien/:idTechnicien')
  dashboardTechnicien(
    @Param('idTechnicien', ParseIntPipe) idTechnicien: number,
  ) {
    return this.service.dashboardTechnicien(idTechnicien);
  }

  @Get('dashboard/chef-equipe/:idEquipe')
  dashboardChefEquipe(@Param('idEquipe', ParseIntPipe) idEquipe: number) {
    return this.service.dashboardChefEquipe(idEquipe);
  }

  @Get('type/:typeMaintenance')
  findByType(@Param('typeMaintenance') typeMaintenance: string) {
    return this.service.findByType(typeMaintenance);
  }

  @Get('etat/:etat')
  findByEtat(@Param('etat') etat: string) {
    return this.service.findByEtat(etat);
  }

  @Patch(':id/affecter-equipe')
  affecterEquipe(
    @Param('id', ParseIntPipe) idIntervention: number,
    @Body() dto: AffecterEquipeDto,
  ) {
    return this.service.affecterEquipe(idIntervention, dto);
  }

  @Post(':id/affectations')
  affecterTechnicien(
    @Param('id', ParseIntPipe) idIntervention: number,
    @Body() dto: AffecterTechnicienDto,
  ) {
    return this.service.affecterTechnicien(idIntervention, dto);
  }

  @Delete('affectations/:id')
  retirerAffectation(@Param('id', ParseIntPipe) idAffectation: number) {
    return this.service.retirerAffectation(idAffectation);
  }

  @Patch(':id/realiser')
  realiser(
    @Param('id', ParseIntPipe) idIntervention: number,
    @Body() dto: RealiserInterventionDto,
  ) {
    return this.service.realiser(idIntervention, dto);
  }

  @Patch(':id/annuler')
  annuler(@Param('id', ParseIntPipe) idIntervention: number) {
    return this.service.annuler(idIntervention);
  }

  @Patch(':id/cloturer')
  cloturer(
    @Param('id', ParseIntPipe) idIntervention: number,
    @Body('closedBy') closedBy?: string,
  ) {
    return this.service.cloturer(idIntervention, closedBy);
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
    @Body() dto: UpdateInterventionDto,
  ) {
    return this.service.update(id, dto);
  }
}