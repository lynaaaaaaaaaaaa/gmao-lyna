import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { StockService } from './stock.service';
import { EntreeStockDto } from './dto/entree-stock.dto';
import { SortieStockDto } from './dto/sortie-stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAllStock() {
    return this.stockService.findAllStock();
  }

  @Get('mouvements')
  findAllMouvements() {
    return this.stockService.findAllMouvements();
  }

  @Get('entrees')
  findEntrees() {
    return this.stockService.findEntrees();
  }

  @Get('entrees/:id')
  findEntreeById(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.findEntreeById(id);
  }

  @Post('entrees')
  entreeStock(@Body() dto: EntreeStockDto) {
    return this.stockService.entreeStock(dto);
  }

  @Get('sorties')
  findSorties() {
    return this.stockService.findSorties();
  }

  @Get('sorties/:id')
  findSortieById(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.findSortieById(id);
  }

  @Post('sorties')
  sortieStock(@Body() dto: SortieStockDto) {
    return this.stockService.sortieStock(dto);
  }
  @Get('sorties')
  findAllSorties() {
  return this.stockService.findAllSorties();
}
}