import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanPreventifPredefiniDto } from './dto/create-plan-preventif-predefini.dto';
import { UpdatePlanPreventifPredefiniDto } from './dto/update-plan-preventif-predefini.dto';
import { CreatePppDeclencheurDto } from './dto/create-ppp-declencheur.dto';
import { UpdatePppDeclencheurDto } from './dto/update-ppp-declencheur.dto';

@Injectable()
export class PlanPreventifPredefiniService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanPreventifPredefiniDto) {
    return this.prisma.plan_preventif_predefini.create({
      data: {
        code: dto.code ?? '',
        titre: dto.libelle ?? null,
        etat: dto.etat ?? null,
        typeDeclenchement: dto.typeDeclenchement ?? null,
        organisation: dto.organisation ?? null,
        idModele: dto.idModele ?? null,
        actif: dto.actif ?? true,
      },
      include: {
        modele: true,
        ppp_declencheur: {
          orderBy: { priorite: 'asc' },
        },
        plan_preventif: true,
      },
    });
  }

  async findAll() {
    return this.prisma.plan_preventif_predefini.findMany({
      include: {
        modele: true,
        ppp_declencheur: {
          orderBy: { priorite: 'asc' },
        },
        plan_preventif: true,
      },
      orderBy: {
        idPlanPreventifPredefini: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.plan_preventif_predefini.findUnique({
      where: { idPlanPreventifPredefini: id },
      include: {
        modele: true,
        ppp_declencheur: {
          include: {
            gamme: true,
            modele: true,
            plan_preventif_declencheur: true,
          },
          orderBy: { priorite: 'asc' },
        },
        plan_preventif: true,
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Plan préventif prédéfini ${id} introuvable`,
      );
    }

    return item;
  }

  async update(id: number, dto: UpdatePlanPreventifPredefiniDto) {
    await this.ensurePlanExists(id);

    return this.prisma.plan_preventif_predefini.update({
      where: { idPlanPreventifPredefini: id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.libelle !== undefined ? { titre: dto.libelle } : {}),
        ...(dto.etat !== undefined ? { etat: dto.etat } : {}),
        ...(dto.typeDeclenchement !== undefined
          ? { typeDeclenchement: dto.typeDeclenchement }
          : {}),
        ...(dto.organisation !== undefined
          ? { organisation: dto.organisation }
          : {}),
        ...(dto.idModele !== undefined ? { idModele: dto.idModele } : {}),
        ...(dto.actif !== undefined ? { actif: dto.actif } : {}),
      },
      include: {
        modele: true,
        ppp_declencheur: {
          orderBy: { priorite: 'asc' },
        },
        plan_preventif: true,
      },
    });
  }

  async remove(id: number) {
    await this.ensurePlanExists(id);

    return this.prisma.plan_preventif_predefini.delete({
      where: { idPlanPreventifPredefini: id },
    });
  }

  async createDeclencheur(
  idPlanPreventifPredefini: number,
  dto: CreatePppDeclencheurDto,
) {
  await this.ensurePlanExists(idPlanPreventifPredefini);

  if (!dto.idGamme) {
    throw new NotFoundException(
      'idGamme est obligatoire pour créer un déclencheur PPP.',
    );
  }

  return this.prisma.ppp_declencheur.create({
    data: {
      idPlanPreventifPredefini,
      priorite: dto.priorite ?? 1,
      etat: dto.etat ?? null,
      typeDeclencheur: dto.typeDeclencheur ?? '',
      idGamme: dto.idGamme,
      idModele: dto.idModele ?? null,
      etatInterventionCible: dto.etatInterventionCible ?? null,
      horizonJours: dto.horizonJours ?? null,
      toleranceJours: dto.toleranceJours ?? null,
      actualisation: dto.actualisation ?? null,
      periodiciteValeur: dto.periodiciteValeur ?? null,
      periodiciteUnite: dto.periodiciteUnite ?? null,
      nombreJoursPremierLancement:
        dto.nombreJoursPremierLancement ?? null,
      mesureCode: dto.mesureCode ?? null,
      seuilValeur:
        dto.seuilValeur !== undefined && dto.seuilValeur !== null
          ? dto.seuilValeur
          : null,
      operateur: dto.operateur ?? null,
      symptomeCode: dto.symptomeCode ?? null,
      saisonnaliteDu: null,
      saisonnaliteAu: null,
      actif: dto.actif ?? true,
    },
    include: {
      plan_preventif_predefini: true,
      gamme: true,
      modele: true,
      plan_preventif_declencheur: true,
    },
  });
}
  async findDeclencheursByPlan(idPlanPreventifPredefini: number) {
    await this.ensurePlanExists(idPlanPreventifPredefini);

    return this.prisma.ppp_declencheur.findMany({
      where: { idPlanPreventifPredefini },
      include: {
        plan_preventif_predefini: true,
        gamme: true,
        modele: true,
        plan_preventif_declencheur: true,
      },
      orderBy: {
        priorite: 'asc',
      },
    });
  }

 async updateDeclencheur(
  idDeclencheur: number,
  dto: UpdatePppDeclencheurDto,
) {
  await this.ensureDeclencheurExists(idDeclencheur);

  return this.prisma.ppp_declencheur.update({
    where: { idPppDeclencheur: idDeclencheur },
    data: {
      ...(dto.priorite !== undefined ? { priorite: dto.priorite } : {}),
      ...(dto.etat !== undefined ? { etat: dto.etat } : {}),
      ...(dto.typeDeclencheur !== undefined
        ? { typeDeclencheur: dto.typeDeclencheur }
        : {}),
      ...(dto.idGamme !== undefined ? { idGamme: dto.idGamme } : {}),
      ...(dto.idModele !== undefined ? { idModele: dto.idModele } : {}),
      ...(dto.etatInterventionCible !== undefined
        ? { etatInterventionCible: dto.etatInterventionCible }
        : {}),
      ...(dto.horizonJours !== undefined
        ? { horizonJours: dto.horizonJours }
        : {}),
      ...(dto.toleranceJours !== undefined
        ? { toleranceJours: dto.toleranceJours }
        : {}),
      ...(dto.actualisation !== undefined
        ? { actualisation: dto.actualisation }
        : {}),
      ...(dto.periodiciteValeur !== undefined
        ? { periodiciteValeur: dto.periodiciteValeur }
        : {}),
      ...(dto.periodiciteUnite !== undefined
        ? { periodiciteUnite: dto.periodiciteUnite }
        : {}),
      ...(dto.nombreJoursPremierLancement !== undefined
        ? {
            nombreJoursPremierLancement:
              dto.nombreJoursPremierLancement,
          }
        : {}),
      ...(dto.mesureCode !== undefined
        ? { mesureCode: dto.mesureCode }
        : {}),
      ...(dto.operateur !== undefined
        ? { operateur: dto.operateur }
        : {}),
      ...(dto.seuilValeur !== undefined
        ? { seuilValeur: dto.seuilValeur }
        : {}),
      ...(dto.symptomeCode !== undefined
        ? { symptomeCode: dto.symptomeCode }
        : {}),
      ...(dto.actif !== undefined ? { actif: dto.actif } : {}),
    },
    include: {
      plan_preventif_predefini: true,
      gamme: true,
      modele: true,
      plan_preventif_declencheur: true,
    },
  });
}
  async removeDeclencheur(idDeclencheur: number) {
    await this.ensureDeclencheurExists(idDeclencheur);

    return this.prisma.ppp_declencheur.delete({
      where: { idPppDeclencheur: idDeclencheur },
    });
  }

  private async ensurePlanExists(id: number) {
    const item = await this.prisma.plan_preventif_predefini.findUnique({
      where: { idPlanPreventifPredefini: id },
      select: { idPlanPreventifPredefini: true },
    });

    if (!item) {
      throw new NotFoundException(
        `Plan préventif prédéfini ${id} introuvable`,
      );
    }
  }

  private async ensureDeclencheurExists(id: number) {
    const item = await this.prisma.ppp_declencheur.findUnique({
      where: { idPppDeclencheur: id },
      select: { idPppDeclencheur: true },
    });

    if (!item) {
      throw new NotFoundException(`Déclencheur PPP ${id} introuvable`);
    }
  }
}