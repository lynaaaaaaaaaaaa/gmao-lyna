import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InterventionController } from './intervention.controller';
import { InterventionService } from './intervention.service';

@Module({
  imports: [PrismaModule],
  controllers: [InterventionController],
  providers: [InterventionService],
  exports: [InterventionService],
})
export class InterventionModule {}