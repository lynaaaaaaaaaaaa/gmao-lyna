import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { AffecterTechnicienDto } from './dto/affecter-technicien.dto';
import { RealiserInterventionDto } from './dto/realiser-intervention.dto';
import { AffecterEquipeDto } from './dto/affecter-equipe.dto';

@Injectable()
export class InterventionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.intervention.findMany({
      orderBy: {
        idIntervention: 'desc',
      },
      include: this.defaultInclude(),
    });
  }

  async findOne(id: number) {
    const intervention = await this.prisma.intervention.findUnique({
      where: {
        idIntervention: id,
      },
      include: this.defaultInclude(),
    });

    if (!intervention) {
      throw new NotFoundException('Intervention introuvable.');
    }

    return intervention;
  }

  async findByType(typeMaintenance: string) {
    return this.prisma.intervention.findMany({
      where: {
        typeMaintenance,
      },
      orderBy: {
        idIntervention: 'desc',
      },
      include: this.defaultInclude(),
    });
  }

  async findByEtat(etat: string) {
    return this.prisma.intervention.findMany({
      where: {
        etat,
      },
      orderBy: {
        idIntervention: 'desc',
      },
      include: this.defaultInclude(),
    });
  }

  async update(id: number, dto: UpdateInterventionDto) {
    const intervention = await this.ensureInterventionExists(id);

    if (intervention.etat === 'CLOTUREE') {
      throw new ConflictException(
        'Impossible de modifier une intervention clôturée.',
      );
    }

    if (intervention.etat === 'ANNULEE') {
      throw new ConflictException(
        'Impossible de modifier une intervention annulée.',
      );
    }

    await this.prisma.intervention.update({
      where: {
        idIntervention: id,
      },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.typeMaintenance !== undefined
          ? { typeMaintenance: dto.typeMaintenance }
          : {}),
        ...(dto.dateDebut !== undefined
          ? { dateDebut: new Date(dto.dateDebut) }
          : {}),
        ...(dto.dateFin !== undefined
          ? { dateFin: new Date(dto.dateFin) }
          : {}),
        ...(dto.etat !== undefined ? { etat: dto.etat } : {}),
        ...(dto.idMateriel !== undefined ? { idMateriel: dto.idMateriel } : {}),
        ...(dto.idDemande !== undefined ? { idDemande: dto.idDemande } : {}),
        ...(dto.idGamme !== undefined ? { idGamme: dto.idGamme } : {}),
      },
    });

    return this.findOne(id);
  }

  async affecterEquipe(idIntervention: number, dto: AffecterEquipeDto) {
    const intervention = await this.ensureInterventionExists(idIntervention);

    this.ensureTransitionAllowed(intervention.etat, 'AFFECTEE_EQUIPE');

    const equipe = await this.prisma.equipe_maintenance.findUnique({
      where: {
        idEquipe: dto.idEquipe,
      },
      select: {
        idEquipe: true,
      },
    });

    if (!equipe) {
      throw new NotFoundException('Equipe introuvable.');
    }

    await this.prisma.intervention.update({
      where: {
        idIntervention,
      },
      data: {
        idEquipe: dto.idEquipe,
        etat: 'AFFECTEE_EQUIPE',
        assignedBy: dto.assignedBy ?? 'RESPONSABLE_MAINTENANCE',
        dateAffectation: new Date(),
      },
    });

    return this.findOne(idIntervention);
  }

  async affecterTechnicien(idIntervention: number, dto: AffecterTechnicienDto) {
    const intervention = await this.ensureInterventionExists(idIntervention);

    this.ensureTransitionAllowed(intervention.etat, 'AFFECTEE');

    const technicien = await this.prisma.technicien.findUnique({
      where: {
        idTechnicien: dto.idTechnicien,
      },
      select: {
        idTechnicien: true,
      },
    });

    if (!technicien) {
      throw new NotFoundException('Technicien introuvable.');
    }

    const existing = await this.prisma.affectation_technicien.findFirst({
      where: {
        idIntervention,
        idTechnicien: dto.idTechnicien,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ce technicien est déjà affecté à cette intervention.',
      );
    }

    await this.prisma.affectation_technicien.create({
      data: {
        idIntervention,
        idTechnicien: dto.idTechnicien,
        tempsTravail: dto.tempsTravail ?? null,
        affectePar: dto.affectePar ?? 'RESPONSABLE_MAINTENANCE',
        dateAffectation: new Date(),
      },
    });

    await this.prisma.intervention.update({
      where: {
        idIntervention,
      },
      data: {
        etat: 'AFFECTEE',
        assignedBy: dto.affectePar ?? 'RESPONSABLE_MAINTENANCE',
        dateAffectation: new Date(),
      },
    });

    return this.findOne(idIntervention);
  }

  async retirerAffectation(idAffectation: number) {
    const affectation = await this.prisma.affectation_technicien.findUnique({
      where: {
        idAffectation,
      },
      select: {
        idAffectation: true,
        idIntervention: true,
        intervention: {
          select: {
            etat: true,
          },
        },
      },
    });

    if (!affectation) {
      throw new NotFoundException('Affectation introuvable.');
    }

    if (affectation.intervention?.etat === 'CLOTUREE') {
      throw new ConflictException(
        'Impossible de retirer une affectation d’une intervention clôturée.',
      );
    }

    if (affectation.intervention?.etat === 'ANNULEE') {
      throw new ConflictException(
        'Impossible de retirer une affectation d’une intervention annulée.',
      );
    }

    await this.prisma.affectation_technicien.delete({
      where: {
        idAffectation,
      },
    });

    return this.findOne(affectation.idIntervention!);
  }

  async realiser(idIntervention: number, dto: RealiserInterventionDto) {
    const intervention = await this.ensureInterventionExists(idIntervention);

    this.ensureTransitionAllowed(intervention.etat, 'REALISEE');

    await this.prisma.intervention.update({
      where: {
        idIntervention,
      },
      data: {
        etat: 'REALISEE',
        dateFin: dto.dateFin ? new Date(dto.dateFin) : new Date(),
      },
    });

    return this.findOne(idIntervention);
  }

  async annuler(idIntervention: number) {
    const intervention = await this.ensureInterventionExists(idIntervention);

    this.ensureTransitionAllowed(intervention.etat, 'ANNULEE');

    await this.prisma.intervention.update({
      where: {
        idIntervention,
      },
      data: {
        etat: 'ANNULEE',
      },
    });

    return this.findOne(idIntervention);
  }

  async cloturer(idIntervention: number, closedBy?: string) {
    const intervention = await this.ensureInterventionExists(idIntervention);

    this.ensureTransitionAllowed(intervention.etat, 'CLOTUREE');

    await this.prisma.intervention.update({
      where: {
        idIntervention,
      },
      data: {
        etat: 'CLOTUREE',
        closedBy: closedBy ?? 'CHEF_EQUIPE',
        dateCloture: new Date(),
      },
    });

    return this.findOne(idIntervention);
  }

  async dashboardResponsable() {
    const [
      total,
      aPlanifier,
      affectees,
      realisees,
      cloturees,
      annulees,
      preventives,
      correctives,
      interventions,
    ] = await Promise.all([
      this.prisma.intervention.count(),
      this.prisma.intervention.count({
        where: { etat: 'A_PLANIFIER' },
      }),
      this.prisma.intervention.count({
        where: {
          etat: {
            in: ['AFFECTEE', 'AFFECTEE_EQUIPE'],
          },
        },
      }),
      this.prisma.intervention.count({
        where: { etat: 'REALISEE' },
      }),
      this.prisma.intervention.count({
        where: { etat: 'CLOTUREE' },
      }),
      this.prisma.intervention.count({
        where: { etat: 'ANNULEE' },
      }),
      this.prisma.intervention.count({
        where: { typeMaintenance: 'PREVENTIF' },
      }),
      this.prisma.intervention.count({
        where: { typeMaintenance: 'CORRECTIF' },
      }),
      this.prisma.intervention.findMany({
        orderBy: { idIntervention: 'desc' },
        include: this.defaultInclude(),
      }),
    ]);

    return {
      stats: {
        total,
        aPlanifier,
        affectees,
        realisees,
        cloturees,
        annulees,
        preventives,
        correctives,
      },
      interventions,
    };
  }

  async dashboardEquipe(idEquipe: number) {
    await this.ensureEquipeExists(idEquipe);

    return this.prisma.intervention.findMany({
      where: {
        OR: [
          {
            idEquipe,
          },
          {
            affectation_technicien: {
              some: {
                technicien: {
                  idEquipe,
                },
              },
            },
          },
        ],
      },
      orderBy: {
        idIntervention: 'desc',
      },
      include: this.defaultInclude(),
    });
  }

  async dashboardTechnicien(idTechnicien: number) {
    await this.ensureTechnicienExists(idTechnicien);

    const technicien = await this.prisma.technicien.findUnique({
      where: {
        idTechnicien,
      },
      select: {
        idEquipe: true,
      },
    });

    return this.prisma.intervention.findMany({
      where: {
        OR: [
          {
            affectation_technicien: {
              some: {
                idTechnicien,
              },
            },
          },
          {
            idEquipe: technicien?.idEquipe ?? -1,
          },
        ],
      },
      orderBy: {
        idIntervention: 'desc',
      },
      include: this.defaultInclude(),
    });
  }

  async dashboardChefEquipe(idEquipe: number) {
    await this.ensureEquipeExists(idEquipe);

    return this.prisma.intervention.findMany({
      where: {
        OR: [
          {
            idEquipe,
          },
          {
            affectation_technicien: {
              some: {
                technicien: {
                  idEquipe,
                },
              },
            },
          },
        ],
        etat: {
          in: ['AFFECTEE', 'AFFECTEE_EQUIPE', 'REALISEE', 'CLOTUREE'],
        },
      },
      orderBy: {
        idIntervention: 'desc',
      },
      include: this.defaultInclude(),
    });
  }

  private async ensureInterventionExists(idIntervention: number) {
    const intervention = await this.prisma.intervention.findUnique({
      where: {
        idIntervention,
      },
      select: {
        idIntervention: true,
        etat: true,
      },
    });

    if (!intervention) {
      throw new NotFoundException('Intervention introuvable.');
    }

    return intervention;
  }

  private ensureTransitionAllowed(currentEtat: string | null, nextEtat: string) {
    const current = currentEtat ?? 'A_PLANIFIER';

    const transitions: Record<string, string[]> = {
      A_PLANIFIER: ['AFFECTEE', 'AFFECTEE_EQUIPE', 'ANNULEE'],
      AFFECTEE: ['REALISEE', 'ANNULEE'],
      AFFECTEE_EQUIPE: ['AFFECTEE', 'REALISEE', 'ANNULEE'],
      REALISEE: ['CLOTUREE'],
      CLOTUREE: [],
      ANNULEE: [],
    };

    const allowedNextStates = transitions[current] ?? [];

    if (!allowedNextStates.includes(nextEtat)) {
      throw new ConflictException(
        `Transition d’état impossible : ${current} → ${nextEtat}`,
      );
    }
  }

  private async ensureTechnicienExists(idTechnicien: number) {
    const technicien = await this.prisma.technicien.findUnique({
      where: {
        idTechnicien,
      },
      select: {
        idTechnicien: true,
      },
    });

    if (!technicien) {
      throw new NotFoundException('Technicien introuvable.');
    }

    return technicien;
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

  private defaultInclude() {
    return {
      materiel: {
        include: {
          modele: true,
          etat_materiel: true,
          type_materiel: true,
        },
      },
      demande_intervention: true,
      gamme: {
        include: {
          gamme_operation: {
            orderBy: {
              ordre: 'asc' as const,
            },
          },
        },
      },
      operation_intervention: {
        orderBy: {
          ordre: 'asc' as const,
        },
      },
      affectation_technicien: {
        include: {
          technicien: true,
        },
      },
      equipe_maintenance: true,
      plan_preventif: true,
      plan_preventif_declencheur: true,
      historique_declenchement_preventif: true,
    };
  }
}