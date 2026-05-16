import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlanPreventifController } from './plan-preventif.controller';
import { PlanPreventifService } from './plan-preventif.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlanPreventifController],
  providers: [PlanPreventifService],
  exports: [PlanPreventifService],
})
export class PlanPreventifModule {}