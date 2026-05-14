import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FamilleModule } from './modules/famille/famille.module';
import { ModeleModule } from './modules/modele/modele.module';
import { EtatModeleModule } from './modules/etat-modele/etat-modele.module';
import { PointStructureModule } from './modules/point-structure/point-structure.module';
import { ArborescenceModule } from './modules/arborescence/arborescence.module';
import { UniteArticleModule } from './modules/unite-article/unite-article.module';
import { ArticleModule } from './modules/article/article.module';
import { MaterielModule } from './modules/materiel/materiel.module';
import { MagasinModule } from './modules/magasin/magasin.module';
import { StockModule } from './modules/stock/stock.module';
import { InventairesPreparesModule } from './modules/inventaires-prepares/inventaires-prepares.module';
import { InventaireModule } from './modules/inventaire/inventaire.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { DemandesTransfertModule } from './modules/demandes-transfert/demandes-transfert.module';
import { ReapprovisionnementModule } from './modules/reapprovisionnement/reapprovisionnement.module';
@Module({
  imports: [PrismaModule, FamilleModule,ReservationsModule,ModeleModule,EtatModeleModule,ArborescenceModule, PointStructureModule,UniteArticleModule, ArticleModule,MaterielModule, MagasinModule,InventairesPreparesModule, InventaireModule,StockModule,DemandesTransfertModule, ReapprovisionnementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}