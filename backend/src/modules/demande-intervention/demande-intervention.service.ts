import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDemandeInterventionDto } from './dto/create-demande-intervention.dto';
import { UpdateDemandeInterventionDto } from './dto/update-demande-intervention.dto';
import { ValiderDemandeInterventionDto } from './dto/valider-demande-intervention.dto';
import { RefuserDemandeInterventionDto } from './dto/refuser-demande-intervention.dto';
import { GenerateOtCorrectiveDto } from './dto/generate-ot-corrective.dto';

@Injectable()
export class DemandeInterventionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDemandeInterventionDto) {
    await this.ensureMaterielExists(dto.idMateriel);

    const demande = await this.prisma.demande_intervention.create({
      data: {
        dateDemande: dto.dateDemande ? new Date(dto.dateDemande) : new Date(),
        description: dto.description,
        statut: dto.statut ?? 'EN_ATTENTE_VALIDATION',
        idMateriel: dto.idMateriel,
        priorite: dto.priorite ?? 'NORMALE',
        createdBy: dto.createdBy ?? 'RESPONSABLE_MAINTENANCE',
      },
    });

    return this.findOne(demande.idDemande);
  }

  async findAll() {
    return this.prisma.demande_intervention.findMany({
      orderBy: {
        idDemande: 'desc',
      },
      include: this.defaultInclude(),
    });
  }

  async findOne(id: number) {
    const demande = await this.prisma.demande_intervention.findUnique({
      where: {
        idDemande: id,
      },
      include: this.defaultInclude(),
    });

    if (!demande) {
      throw new NotFoundException('Demande d’intervention introuvable.');
    }

    return demande;
  }

  async update(id: number, dto: UpdateDemandeInterventionDto) {
    await this.ensureDemandeExists(id);

    if (dto.idMateriel !== undefined) {
      await this.ensureMaterielExists(dto.idMateriel);
    }

    await this.prisma.demande_intervention.update({
      where: {
        idDemande: id,
      },
      data: {
        ...(dto.dateDemande !== undefined
          ? { dateDemande: new Date(dto.dateDemande) }
          : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.statut !== undefined ? { statut: dto.statut } : {}),
        ...(dto.idMateriel !== undefined ? { idMateriel: dto.idMateriel } : {}),
        ...(dto.priorite !== undefined ? { priorite: dto.priorite } : {}),
        ...(dto.createdBy !== undefined ? { createdBy: dto.createdBy } : {}),
      },
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.ensureDemandeExists(id);

    const interventionsCount = await this.prisma.intervention.count({
      where: {
        idDemande: id,
      },
    });

    if (interventionsCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer cette DI : une intervention est déjà liée.',
      );
    }

    return this.prisma.demande_intervention.delete({
      where: {
        idDemande: id,
      },
    });
  }

  async valider(id: number, dto: ValiderDemandeInterventionDto) {
    const demande = await this.ensureDemandeExists(id);

    if (demande.statut === 'VALIDEE') {
      throw new ConflictException('Cette DI est déjà validée.');
    }

    if (demande.statut === 'REFUSEE') {
      throw new ConflictException('Impossible de valider une DI refusée.');
    }

    if (demande.statut === 'OT_GENERE') {
      throw new ConflictException('Cette DI a déjà généré un OT.');
    }

    await this.prisma.demande_intervention.update({
      where: {
        idDemande: id,
      },
      data: {
        statut: 'VALIDEE',
        validatedBy: dto.validatedBy ?? 'RESPONSABLE_MAINTENANCE',
        dateValidation: new Date(),
        motifRefus: null,
      },
    });

    return this.findOne(id);
  }

  async refuser(id: number, dto: RefuserDemandeInterventionDto) {
    const demande = await this.ensureDemandeExists(id);

    if (demande.statut === 'VALIDEE') {
      throw new ConflictException('Impossible de refuser une DI déjà validée.');
    }

    if (demande.statut === 'OT_GENERE') {
      throw new ConflictException(
        'Impossible de refuser une DI ayant déjà généré un OT.',
      );
    }

    await this.prisma.demande_intervention.update({
      where: {
        idDemande: id,
      },
      data: {
        statut: 'REFUSEE',
        validatedBy: dto.validatedBy ?? 'RESPONSABLE_MAINTENANCE',
        dateValidation: new Date(),
        motifRefus: dto.motifRefus ?? 'Demande refusée.',
      },
    });

    return this.findOne(id);
  }

  async generateOtCorrective(idDemande: number, dto: GenerateOtCorrectiveDto) {
    const demande = await this.prisma.demande_intervention.findUnique({
      where: {
        idDemande,
      },
      include: {
        materiel: true,
        intervention: true,
      },
    });

    if (!demande) {
      throw new NotFoundException('Demande d’intervention introuvable.');
    }

    if (demande.statut !== 'VALIDEE') {
      throw new ConflictException(
        'La DI doit être validée avant de générer un OT correctif.',
      );
    }

    const existingOt = await this.prisma.intervention.findFirst({
      where: {
        idDemande,
      },
    });

    if (existingOt) {
      throw new ConflictException(
        'Un OT correctif existe déjà pour cette demande.',
      );
    }

    if (dto.idGamme !== undefined) {
      await this.ensureGammeExists(dto.idGamme);
    }

    if (dto.idEquipe !== undefined) {
      await this.ensureEquipeExists(dto.idEquipe);
    }

    const codeOt = await this.generateCorrectiveCode();

    const result = await this.prisma.$transaction(async (tx) => {
      const intervention = await tx.intervention.create({
        data: {
          code: codeOt,
          typeMaintenance: 'CORRECTIF',
          dateDebut: new Date(),
          dateFin: null,
          etat: dto.idEquipe ? 'AFFECTEE_EQUIPE' : 'A_PLANIFIER',
          idMateriel: demande.idMateriel,
          idDemande: demande.idDemande,
          idGamme: dto.idGamme ?? null,
          idEquipe: dto.idEquipe ?? null,
          origineGeneration: 'DEMANDE_INTERVENTION',
          priorite: demande.priorite ?? 'NORMALE',
          description: demande.description,
          createdBy:
            dto.createdBy ??
            demande.validatedBy ??
            'RESPONSABLE_MAINTENANCE',
          validatedBy: demande.validatedBy,
          assignedBy: dto.idEquipe
            ? dto.assignedBy ?? 'RESPONSABLE_MAINTENANCE'
            : null,
          dateAffectation: dto.idEquipe ? new Date() : null,
        },
      });

      if (dto.idGamme !== undefined) {
        const operations = await tx.gamme_operation.findMany({
          where: {
            idGamme: dto.idGamme,
          },
          orderBy: {
            ordre: 'asc',
          },
        });

        if (operations.length > 0) {
          await tx.operation_intervention.createMany({
            data: operations.map((operation) => ({
              ordre: operation.ordre,
              libelle: operation.libelle,
              tempsPasse: operation.tempsStandard,
              idIntervention: intervention.idIntervention,
              description: operation.description,
              obligatoire: operation.obligatoire ?? false,
              idGammeOperationSource: operation.idOperation,
            })),
          });
        }
      }

      await tx.demande_intervention.update({
        where: {
          idDemande,
        },
        data: {
          statut: 'OT_GENERE',
        },
      });

      return intervention;
    });

    return {
      message: 'OT correctif généré avec succès.',
      intervention: await this.prisma.intervention.findUnique({
        where: {
          idIntervention: result.idIntervention,
        },
        include: {
          materiel: true,
          demande_intervention: true,
          gamme: true,
          equipe_maintenance: true,
          operation_intervention: {
            orderBy: {
              ordre: 'asc',
            },
          },
          affectation_technicien: {
            include: {
              technicien: true,
            },
          },
        },
      }),
    };
  }

  async dashboardResponsable() {
    const [
      total,
      enAttente,
      validees,
      refusees,
      otGeneres,
      urgentes,
      demandes,
    ] = await Promise.all([
      this.prisma.demande_intervention.count(),
      this.prisma.demande_intervention.count({
        where: { statut: 'EN_ATTENTE_VALIDATION' },
      }),
      this.prisma.demande_intervention.count({
        where: { statut: 'VALIDEE' },
      }),
      this.prisma.demande_intervention.count({
        where: { statut: 'REFUSEE' },
      }),
      this.prisma.demande_intervention.count({
        where: { statut: 'OT_GENERE' },
      }),
      this.prisma.demande_intervention.count({
        where: { priorite: 'URGENTE' },
      }),
      this.prisma.demande_intervention.findMany({
        orderBy: {
          idDemande: 'desc',
        },
        include: this.defaultInclude(),
      }),
    ]);

    return {
      stats: {
        total,
        enAttente,
        validees,
        refusees,
        otGeneres,
        urgentes,
      },
      demandes,
    };
  }

  async findByStatut(statut: string) {
    return this.prisma.demande_intervention.findMany({
      where: {
        statut,
      },
      orderBy: {
        idDemande: 'desc',
      },
      include: this.defaultInclude(),
    });
  }

  private async ensureDemandeExists(idDemande: number) {
    const demande = await this.prisma.demande_intervention.findUnique({
      where: {
        idDemande,
      },
      select: {
        idDemande: true,
        statut: true,
      },
    });

    if (!demande) {
      throw new NotFoundException('Demande d’intervention introuvable.');
    }

    return demande;
  }

  private async ensureMaterielExists(idMateriel: number) {
    const materiel = await this.prisma.materiel.findUnique({
      where: {
        idMateriel,
      },
      select: {
        idMateriel: true,
      },
    });

    if (!materiel) {
      throw new NotFoundException('Matériel introuvable.');
    }

    return materiel;
  }

  private async ensureGammeExists(idGamme: number) {
    const gamme = await this.prisma.gamme.findUnique({
      where: {
        idGamme,
      },
      select: {
        idGamme: true,
      },
    });

    if (!gamme) {
      throw new NotFoundException('Gamme introuvable.');
    }

    return gamme;
  }

  private async ensureEquipeExists(idEquipe: number) {
    const equipe = await this.prisma.equipe_maintenance.findUnique({
      where: {
        idEquipe,
      },
      select: {
        idEquipe: true,
      },
    });

    if (!equipe) {
      throw new NotFoundException('Equipe introuvable.');
    }

    return equipe;
  }

  private async generateCorrectiveCode() {
    const count = await this.prisma.intervention.count({
      where: {
        typeMaintenance: 'CORRECTIF',
      },
    });

    return `OT-COR-${String(count + 1).padStart(5, '0')}`;
  }

  private defaultInclude() {
    return {
      materiel: {
        include: {
          modele: true,
          etat_materiel: true,
          type_materiel: true,
        },
      },
      intervention: {
        orderBy: {
          idIntervention: 'desc' as const,
        },
      },
    };
  }
}