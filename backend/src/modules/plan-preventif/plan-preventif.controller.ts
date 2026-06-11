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

import { CreatePlanPreventifDto } from './dto/create-plan-preventif.dto';
import { UpdatePlanPreventifDto } from './dto/update-plan-preventif.dto';
import { CreatePlanPreventifDeclencheurDto } from './dto/create-plan-preventif-declencheur.dto';
import { UpdatePlanPreventifDeclencheurDto } from './dto/update-plan-preventif-declencheur.dto';
import { EvaluerDeclencheursPreventifsDto } from './dto/evaluer-declencheurs-preventifs.dto';

import { PlanPreventifService } from './plan-preventif.service';

@Controller('plans-preventifs')
export class PlanPreventifController {
  constructor(private readonly service: PlanPreventifService) {}

  @Post()
  create(@Body() dto: CreatePlanPreventifDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('evaluer-declencheurs')
  evaluerDeclencheurs(@Body() dto: EvaluerDeclencheursPreventifsDto) {
    return this.service.evaluerDeclencheurs(dto);
  }

  @Get('all-declencheurs')
  findAllDeclencheurs() {
    return this.service.findAllDeclencheurs();
  }

  @Post('declencheurs/:id/generer-ot')
  generateOtFromDeclencheur(@Param('id', ParseIntPipe) id: number) {
    return this.service.generateOtFromDeclencheur(id);
  }

  // Compatibilité avec ton ancien frontend
  @Post('generate-ot/:id')
  generateOtFromDeclencheurLegacy(@Param('id', ParseIntPipe) id: number) {
    return this.service.generateOtFromDeclencheur(id);
  }

  @Get('declencheurs/:id/historique')
  findHistoriqueByDeclencheur(@Param('id', ParseIntPipe) id: number) {
    return this.service.findHistoriqueByDeclencheur(id);
  }

  @Patch('declencheurs/:id')
  updateDeclencheur(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanPreventifDeclencheurDto,
  ) {
    return this.service.updateDeclencheur(id, dto);
  }

  @Delete('declencheurs/:id')
  removeDeclencheur(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeDeclencheur(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanPreventifDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/regenerate-declencheurs')
  regenerateDeclencheurs(@Param('id', ParseIntPipe) id: number) {
    return this.service.regenerateDeclencheurs(id);
  }

  @Get(':id/declencheurs')
  findDeclencheursByPlan(@Param('id', ParseIntPipe) id: number) {
    return this.service.findDeclencheursByPlan(id);
  }

  @Post(':id/declencheurs')
  createDeclencheur(
    @Param('id', ParseIntPipe) idPlanPreventif: number,
    @Body() dto: CreatePlanPreventifDeclencheurDto,
  ) {
    return this.service.createDeclencheur(idPlanPreventif, dto);
  }

  @Get(':id/historique')
  findHistoriqueByPlan(@Param('id', ParseIntPipe) id: number) {
    return this.service.findHistoriqueByPlan(id);
  }
}