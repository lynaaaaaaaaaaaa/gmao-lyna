import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

import { CreatePlanPreventifDto } from './dto/create-plan-preventif.dto';
import { UpdatePlanPreventifDto } from './dto/update-plan-preventif.dto';
import { CreatePlanPreventifDeclencheurDto } from './dto/create-plan-preventif-declencheur.dto';
import { UpdatePlanPreventifDeclencheurDto } from './dto/update-plan-preventif-declencheur.dto';
import { EvaluerDeclencheursPreventifsDto } from './dto/evaluer-declencheurs-preventifs.dto';

const planInclude = {
  materiel: {
    include: {
      modele: true,
      etat_materiel: true,
      type_materiel: true,
    },
  },
  point_structure: true,
  plan_preventif_predefini: {
    include: {
      modele: true,
      ppp_declencheur: {
        include: {
          gamme: true,
          modele: true,
          point_mesure: true,
        },
      },
    },
  },
  plan_preventif_declencheur: {
    orderBy: [
      { priorite: 'asc' },
      { idPlanPreventifDeclencheur: 'asc' },
    ],
    include: {
      gamme: {
        include: {
          gamme_operation: {
            orderBy: {
              ordre: 'asc',
            },
          },
        },
      },
      point_structure: true,
      materiel: true,
      point_mesure: true,
      modele: true,
      famille: true,
      ppp_declencheur: true,
      intervention: {
        orderBy: {
          idIntervention: 'desc',
        },
      },
      historique_declenchement_preventif: {
        orderBy: {
          dateDeclenchement: 'desc',
        },
      },
    },
  },
  intervention: {
    orderBy: {
      idIntervention: 'desc',
    },
    include: {
      gamme: true,
      materiel: true,
      point_structure: true,
    },
  },
} satisfies Prisma.plan_preventifInclude;

const declencheurInclude = {
  plan_preventif: true,
  ppp_declencheur: true,
  gamme: {
    include: {
      gamme_operation: {
        orderBy: {
          ordre: 'asc',
        },
      },
    },
  },
  materiel: true,
  point_structure: true,
  modele: true,
  point_mesure: true,
  famille: true,
  intervention: {
    orderBy: {
      idIntervention: 'desc',
    },
  },
  historique_declenchement_preventif: {
    orderBy: {
      dateDeclenchement: 'desc',
    },
  },
} satisfies Prisma.plan_preventif_declencheurInclude;

@Injectable()
export class PlanPreventifService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.plan_preventif.findMany({
      orderBy: {
        idPlanPreventif: 'desc',
      },
      include: planInclude,
    });
  }

  async findOne(id: number) {
    await this.ensurePlanExists(id);

    return this.prisma.plan_preventif.findUnique({
      where: {
        idPlanPreventif: id,
      },
      include: planInclude,
    });
  }

  async create(dto: CreatePlanPreventifDto) {
    await this.ensureUniqueCode(dto.code);

    if (dto.idMateriel !== undefined) {
      await this.ensureMaterielExists(dto.idMateriel);
    }

    if (dto.idPointStructure !== undefined) {
      await this.ensurePointStructureExists(dto.idPointStructure);
    }

    let sourcePpp:
      | Awaited<ReturnType<PlanPreventifService['getPppSourceWithDeclencheurs']>>
      | null = null;

    if (dto.idPlanPreventifPredefiniSource !== undefined) {
      sourcePpp = await this.getPppSourceWithDeclencheurs(
        dto.idPlanPreventifPredefiniSource,
      );
    }

    const created = await this.prisma.plan_preventif.create({
      data: {
        code: dto.code,
        libelle: dto.libelle ?? null,
        etat: dto.etat ?? sourcePpp?.etat ?? 'ACTIF',
        typeDeclenchement:
          dto.typeDeclenchement ?? sourcePpp?.typeDeclenchement ?? 'MANUEL',
        organisation: dto.organisation ?? sourcePpp?.organisation ?? null,
        masquerLignesInactives: dto.masquerLignesInactives ?? true,
        actif: dto.actif ?? true,

        ...(dto.idMateriel !== undefined
          ? {
              materiel: {
                connect: {
                  idMateriel: dto.idMateriel,
                },
              },
            }
          : {}),

        ...(dto.idPointStructure !== undefined
          ? {
              point_structure: {
                connect: {
                  idPoint: dto.idPointStructure,
                },
              },
            }
          : {}),

        ...(dto.idPlanPreventifPredefiniSource !== undefined
          ? {
              plan_preventif_predefini: {
                connect: {
                  idPlanPreventifPredefini:
                    dto.idPlanPreventifPredefiniSource,
                },
              },
            }
          : {}),
      },
      include: {
        materiel: true,
        point_structure: true,
        plan_preventif_predefini: true,
      },
    });

    if (sourcePpp && sourcePpp.ppp_declencheur.length > 0) {
      await this.copyDeclencheursFromPpp(
        created.idPlanPreventif,
        sourcePpp,
        dto.idMateriel,
        dto.idPointStructure,
      );
    }

    return this.findOne(created.idPlanPreventif);
  }

  async update(id: number, dto: UpdatePlanPreventifDto) {
    await this.ensurePlanExists(id);

    if (dto.code !== undefined) {
      await this.ensureUniqueCode(dto.code, id);
    }

    if (dto.idMateriel !== undefined) {
      await this.ensureMaterielExists(dto.idMateriel);
    }

    if (dto.idPointStructure !== undefined) {
      await this.ensurePointStructureExists(dto.idPointStructure);
    }

    if (dto.idPlanPreventifPredefiniSource !== undefined) {
      await this.ensurePppExists(dto.idPlanPreventifPredefiniSource);
    }

    await this.prisma.plan_preventif.update({
      where: {
        idPlanPreventif: id,
      },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.libelle !== undefined ? { libelle: dto.libelle } : {}),
        ...(dto.etat !== undefined ? { etat: dto.etat } : {}),
        ...(dto.typeDeclenchement !== undefined
          ? { typeDeclenchement: dto.typeDeclenchement }
          : {}),
        ...(dto.organisation !== undefined
          ? { organisation: dto.organisation }
          : {}),
        ...(dto.masquerLignesInactives !== undefined
          ? { masquerLignesInactives: dto.masquerLignesInactives }
          : {}),
        ...(dto.actif !== undefined ? { actif: dto.actif } : {}),

        ...(dto.idMateriel !== undefined
          ? {
              materiel: {
                connect: {
                  idMateriel: dto.idMateriel,
                },
              },
            }
          : {}),

        ...(dto.idPointStructure !== undefined
          ? {
              point_structure: {
                connect: {
                  idPoint: dto.idPointStructure,
                },
              },
            }
          : {}),

        ...(dto.idPlanPreventifPredefiniSource !== undefined
          ? {
              plan_preventif_predefini: {
                connect: {
                  idPlanPreventifPredefini:
                    dto.idPlanPreventifPredefiniSource,
                },
              },
            }
          : {}),
      },
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.ensurePlanExists(id);

    const interventionsCount = await this.prisma.intervention.count({
      where: {
        idPlanPreventif: id,
      },
    });

    if (interventionsCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer ce plan préventif : des interventions y sont déjà liées.',
      );
    }

    await this.prisma.historique_declenchement_preventif.deleteMany({
      where: {
        plan_preventif_declencheur: {
          idPlanPreventif: id,
        },
      },
    });

    await this.prisma.plan_preventif_declencheur.deleteMany({
      where: {
        idPlanPreventif: id,
      },
    });

    return this.prisma.plan_preventif.delete({
      where: {
        idPlanPreventif: id,
      },
    });
  }

  async regenerateDeclencheurs(id: number) {
    const plan = await this.prisma.plan_preventif.findUnique({
      where: {
        idPlanPreventif: id,
      },
      include: {
        plan_preventif_predefini: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan préventif introuvable.');
    }

    if (!plan.idPlanPreventifPredefiniSource) {
      throw new ConflictException(
        'Ce plan préventif n’a pas de plan préventif prédéfini source.',
      );
    }

    const linkedInterventions = await this.prisma.intervention.count({
      where: {
        idPlanPreventif: id,
      },
    });

    if (linkedInterventions > 0) {
      throw new ConflictException(
        'Impossible de régénérer les déclencheurs : des interventions sont déjà liées au plan.',
      );
    }

    await this.prisma.historique_declenchement_preventif.deleteMany({
      where: {
        plan_preventif_declencheur: {
          idPlanPreventif: id,
        },
      },
    });

    await this.prisma.plan_preventif_declencheur.deleteMany({
      where: {
        idPlanPreventif: id,
      },
    });

    const sourcePpp = await this.getPppSourceWithDeclencheurs(
      plan.idPlanPreventifPredefiniSource,
    );

    await this.copyDeclencheursFromPpp(
      id,
      sourcePpp,
      plan.idMateriel ?? undefined,
      plan.idPointStructure ?? undefined,
    );

    return this.findOne(id);
  }

  async findAllDeclencheurs() {
    return this.prisma.plan_preventif_declencheur.findMany({
      orderBy: [
        {
          priorite: 'asc',
        },
        {
          idPlanPreventifDeclencheur: 'desc',
        },
      ],
      include: declencheurInclude,
    });
  }

  async findDeclencheursByPlan(idPlanPreventif: number) {
    await this.ensurePlanExists(idPlanPreventif);

    return this.prisma.plan_preventif_declencheur.findMany({
      where: {
        idPlanPreventif,
      },
      orderBy: [
        {
          priorite: 'asc',
        },
        {
          idPlanPreventifDeclencheur: 'asc',
        },
      ],
      include: declencheurInclude,
    });
  }

  async createDeclencheur(
    idPlanPreventif: number,
    dto: CreatePlanPreventifDeclencheurDto,
  ) {
    const plan = await this.getPlanTarget(idPlanPreventif);

    if (!dto.idGamme) {
      throw new ConflictException(
        'La gamme est obligatoire pour créer un déclencheur préventif.',
      );
    }

    await this.ensureGammeExists(dto.idGamme);

    if (dto.idPppDeclencheurSource !== undefined) {
      await this.ensurePppDeclencheurExists(dto.idPppDeclencheurSource);
    }

    const effectiveIdMateriel =
      dto.idMateriel ?? plan.idMateriel ?? undefined;

    const effectiveIdPointStructure =
      dto.idPointStructure ?? plan.idPointStructure ?? undefined;

    if (!effectiveIdMateriel && !effectiveIdPointStructure) {
      throw new ConflictException(
        'Le déclencheur doit être lié à un matériel ou à un point de structure.',
      );
    }

    if (effectiveIdMateriel !== undefined) {
      await this.ensureMaterielExists(effectiveIdMateriel);
    }

    if (effectiveIdPointStructure !== undefined) {
      await this.ensurePointStructureExists(effectiveIdPointStructure);
    }

    if (dto.idPointMesure !== undefined) {
      await this.ensurePointMesureExists(dto.idPointMesure);
    }

    if (dto.idModele !== undefined) {
      await this.ensureModeleExists(dto.idModele);
    }

    if (dto.idFamille !== undefined) {
      await this.ensureFamilleExists(dto.idFamille);
    }

    const typeDeclencheur = dto.typeDeclencheur ?? 'CALENDAIRE';

    this.validateDeclencheurPointMesureRules({
      typeDeclencheur,
      idPointMesure: dto.idPointMesure,
      operateur: dto.operateur,
      seuilValeur: dto.seuilValeur,
    });

    this.validateDeclencheurCalendaireRules({
      typeDeclencheur,
      prochainLancementDate: dto.prochainLancementDate,
    });

    await this.prisma.plan_preventif_declencheur.create({
      data: {
        plan_preventif: {
          connect: {
            idPlanPreventif,
          },
        },
        gamme: {
          connect: {
            idGamme: dto.idGamme,
          },
        },

        ...(dto.idPppDeclencheurSource !== undefined
          ? {
              ppp_declencheur: {
                connect: {
                  idPppDeclencheur: dto.idPppDeclencheurSource,
                },
              },
            }
          : {}),

        ...(effectiveIdMateriel !== undefined
          ? {
              materiel: {
                connect: {
                  idMateriel: effectiveIdMateriel,
                },
              },
            }
          : {}),

        ...(effectiveIdPointStructure !== undefined
          ? {
              point_structure: {
                connect: {
                  idPoint: effectiveIdPointStructure,
                },
              },
            }
          : {}),

        ...(dto.idPointMesure !== undefined
          ? {
              point_mesure: {
                connect: {
                  idPointMesure: dto.idPointMesure,
                },
              },
            }
          : {}),

        ...(dto.idModele !== undefined
          ? {
              modele: {
                connect: {
                  idModele: dto.idModele,
                },
              },
            }
          : {}),

        ...(dto.idFamille !== undefined
          ? {
              famille: {
                connect: {
                  idFamille: dto.idFamille,
                },
              },
            }
          : {}),

        priorite: dto.priorite ?? 1,
        etat: dto.etat ?? 'ACTIF',
        typeDeclencheur,
        etatInterventionCible: dto.etatInterventionCible ?? null,
        actualisation: dto.actualisation ?? 'DECLENCHEMENT',
        horizonJours: dto.horizonJours ?? 15,
        toleranceJours: dto.toleranceJours ?? 5,

        periodiciteValeur: dto.periodiciteValeur ?? null,
        periodiciteUnite: dto.periodiciteUnite ?? null,
        prochainLancementDate: this.parseDate(dto.prochainLancementDate),
        derniereRealisationDate: this.parseDate(dto.derniereRealisationDate),
        derniereRealisationPrevueDate: this.parseDate(
          dto.derniereRealisationPrevueDate,
        ),

        operateur: dto.operateur ?? null,
        seuilValeur: dto.seuilValeur ?? null,
        prochainLancementValeur: dto.prochainLancementValeur ?? null,
        derniereRealisationValeur: dto.derniereRealisationValeur ?? null,
        derniereRealisationPrevueValeur:
          dto.derniereRealisationPrevueValeur ?? null,
        symptomeCode: dto.symptomeCode ?? null,
        saisonnaliteDu: this.parseDate(dto.saisonnaliteDu),
        saisonnaliteAu: this.parseDate(dto.saisonnaliteAu),
        actif: dto.actif ?? true,
      },
    });

    return this.findOne(idPlanPreventif);
  }

  async updateDeclencheur(
    idDeclencheur: number,
    dto: UpdatePlanPreventifDeclencheurDto,
  ) {
    const declencheur =
      await this.prisma.plan_preventif_declencheur.findUnique({
        where: {
          idPlanPreventifDeclencheur: idDeclencheur,
        },
      });

    if (!declencheur) {
      throw new NotFoundException('Déclencheur préventif introuvable.');
    }

    if (dto.idGamme !== undefined) {
      await this.ensureGammeExists(dto.idGamme);
    }

    if (dto.idPppDeclencheurSource !== undefined) {
      await this.ensurePppDeclencheurExists(dto.idPppDeclencheurSource);
    }

    if (dto.idMateriel !== undefined) {
      await this.ensureMaterielExists(dto.idMateriel);
    }

    if (dto.idPointStructure !== undefined) {
      await this.ensurePointStructureExists(dto.idPointStructure);
    }

    if (dto.idPointMesure !== undefined) {
      await this.ensurePointMesureExists(dto.idPointMesure);
    }

    if (dto.idModele !== undefined) {
      await this.ensureModeleExists(dto.idModele);
    }

    if (dto.idFamille !== undefined) {
      await this.ensureFamilleExists(dto.idFamille);
    }

    const finalTypeDeclencheur =
      dto.typeDeclencheur ?? declencheur.typeDeclencheur;

    const finalIdPointMesure =
      dto.idPointMesure ?? declencheur.idPointMesure;

    const finalOperateur = dto.operateur ?? declencheur.operateur;

    const finalSeuilValeur =
      dto.seuilValeur ?? declencheur.seuilValeur;

    this.validateDeclencheurPointMesureRules({
      typeDeclencheur: finalTypeDeclencheur,
      idPointMesure: finalIdPointMesure,
      operateur: finalOperateur,
      seuilValeur: finalSeuilValeur,
    });

    this.validateDeclencheurCalendaireRules({
      typeDeclencheur: finalTypeDeclencheur,
      prochainLancementDate:
        dto.prochainLancementDate ??
        declencheur.prochainLancementDate,
    });

    await this.prisma.plan_preventif_declencheur.update({
      where: {
        idPlanPreventifDeclencheur: idDeclencheur,
      },
      data: {
        priorite: dto.priorite,
        etat: dto.etat,
        typeDeclencheur: dto.typeDeclencheur,
        etatInterventionCible: dto.etatInterventionCible,
        actualisation: dto.actualisation,
        horizonJours: dto.horizonJours,
        toleranceJours: dto.toleranceJours,
        periodiciteValeur: dto.periodiciteValeur,
        periodiciteUnite: dto.periodiciteUnite,
        prochainLancementDate: this.parseDate(dto.prochainLancementDate),
        derniereRealisationDate: this.parseDate(dto.derniereRealisationDate),
        derniereRealisationPrevueDate: this.parseDate(
          dto.derniereRealisationPrevueDate,
        ),
        operateur: dto.operateur,
        seuilValeur: dto.seuilValeur,
        prochainLancementValeur: dto.prochainLancementValeur,
        derniereRealisationValeur: dto.derniereRealisationValeur,
        derniereRealisationPrevueValeur:
          dto.derniereRealisationPrevueValeur,
        symptomeCode: dto.symptomeCode,
        saisonnaliteDu: this.parseDate(dto.saisonnaliteDu),
        saisonnaliteAu: this.parseDate(dto.saisonnaliteAu),
        actif: dto.actif,

        ...(dto.idGamme !== undefined
          ? {
              gamme: {
                connect: {
                  idGamme: dto.idGamme,
                },
              },
            }
          : {}),

        ...(dto.idPppDeclencheurSource !== undefined
          ? {
              ppp_declencheur: {
                connect: {
                  idPppDeclencheur: dto.idPppDeclencheurSource,
                },
              },
            }
          : {}),

        ...(dto.idMateriel !== undefined
          ? {
              materiel: {
                connect: {
                  idMateriel: dto.idMateriel,
                },
              },
            }
          : {}),

        ...(dto.idPointStructure !== undefined
          ? {
              point_structure: {
                connect: {
                  idPoint: dto.idPointStructure,
                },
              },
            }
          : {}),

        ...(dto.idPointMesure !== undefined
          ? {
              point_mesure: {
                connect: {
                  idPointMesure: dto.idPointMesure,
                },
              },
            }
          : {}),

        ...(dto.idModele !== undefined
          ? {
              modele: {
                connect: {
                  idModele: dto.idModele,
                },
              },
            }
          : {}),

        ...(dto.idFamille !== undefined
          ? {
              famille: {
                connect: {
                  idFamille: dto.idFamille,
                },
              },
            }
          : {}),
      },
    });

    return this.findOne(declencheur.idPlanPreventif);
  }

  async removeDeclencheur(idDeclencheur: number) {
    const declencheur = await this.ensureDeclencheurExists(idDeclencheur);

    const interventionsCount = await this.prisma.intervention.count({
      where: {
        idPlanPreventifDeclencheur: idDeclencheur,
      },
    });

    if (interventionsCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer ce déclencheur : des interventions y sont déjà liées.',
      );
    }

    await this.prisma.historique_declenchement_preventif.deleteMany({
      where: {
        idPlanPreventifDeclencheur: idDeclencheur,
      },
    });

    await this.prisma.plan_preventif_declencheur.delete({
      where: {
        idPlanPreventifDeclencheur: idDeclencheur,
      },
    });

    return this.findOne(declencheur.idPlanPreventif);
  }

  async evaluerDeclencheurs(dto: EvaluerDeclencheursPreventifsDto) {
    const dateFinGlobale: Date | null = dto.dateFin
      ? (this.parseDate(dto.dateFin) ?? null)
      : null;

    const where: Prisma.plan_preventif_declencheurWhereInput = {};
    const planWhere: Prisma.plan_preventifWhereInput = {};

    if (!dto.inclureInactifs) {
      where.OR = [{ actif: true }, { actif: null }];
      planWhere.OR = [{ actif: true }, { actif: null }];
    }

    if (dto.typeDeclenchement) {
      planWhere.typeDeclenchement = {
        in: this.buildTypeDeclenchementVariants(dto.typeDeclenchement),
      };
    }

    if (Object.keys(planWhere).length > 0) {
      where.plan_preventif = planWhere;
    }

    const declencheurs =
      await this.prisma.plan_preventif_declencheur.findMany({
        where,
        include: {
          plan_preventif: true,
          gamme: true,
          materiel: true,
          point_structure: true,
          point_mesure: true,
          intervention: {
            where: {
              etat: {
                notIn: ['SOLDE', 'ANNULE', 'ARCHIVE'],
              },
            },
            orderBy: {
              idIntervention: 'desc',
            },
          },
        },
        orderBy: [
          {
            priorite: 'asc',
          },
          {
            prochainLancementDate: 'asc',
          },
        ],
      });

    return declencheurs.map((declencheur) => {
      const evaluation = this.evaluerDeclencheur(
        declencheur,
        dateFinGlobale,
      );

      return {
        idPlanPreventifDeclencheur:
          declencheur.idPlanPreventifDeclencheur,
        idPlanPreventif: declencheur.idPlanPreventif,
        codePlan: declencheur.plan_preventif?.code,
        libellePlan: declencheur.plan_preventif?.libelle,
        typeDeclenchement:
          declencheur.plan_preventif?.typeDeclenchement,
        typeDeclencheur: declencheur.typeDeclencheur,
        priorite: declencheur.priorite,
        datePrevue: declencheur.prochainLancementDate,
        prochainLancementValeur: declencheur.prochainLancementValeur,
        seuilValeur: declencheur.seuilValeur,
        operateur: declencheur.operateur,
        materiel: declencheur.materiel,
        point_structure: declencheur.point_structure,
        point_mesure: declencheur.point_mesure,
        gamme: declencheur.gamme,
        statutEvaluation: evaluation.statutEvaluation,
        declenchable: evaluation.declenchable,
        motif: evaluation.motif,
        interventionActiveExistante:
          declencheur.intervention.length > 0
            ? declencheur.intervention[0]
            : null,
      };
    });
  }

  async generateOtFromDeclencheur(idDeclencheur: number) {
    const declencheur =
      await this.prisma.plan_preventif_declencheur.findUnique({
        where: {
          idPlanPreventifDeclencheur: idDeclencheur,
        },
        include: {
          plan_preventif: true,
          gamme: {
            include: {
              gamme_operation: {
                orderBy: {
                  ordre: 'asc',
                },
              },
            },
          },
          materiel: true,
          point_structure: true,
          point_mesure: true,
          intervention: true,
        },
      });

    if (!declencheur) {
      throw new NotFoundException('Déclencheur préventif introuvable.');
    }

    if (declencheur.actif === false) {
      throw new ConflictException('Ce déclencheur est inactif.');
    }

    if (declencheur.plan_preventif?.actif === false) {
      throw new ConflictException('Le plan préventif associé est inactif.');
    }

    if (!declencheur.idGamme || !declencheur.gamme) {
      throw new ConflictException(
        'Le déclencheur doit être lié à une gamme.',
      );
    }

    if (!declencheur.idMateriel && !declencheur.idPointStructure) {
      throw new ConflictException(
        'Le déclencheur doit être lié à un matériel ou à un point de structure.',
      );
    }

    this.validateDeclencheurPointMesureRules({
      typeDeclencheur: declencheur.typeDeclencheur,
      idPointMesure: declencheur.idPointMesure,
      operateur: declencheur.operateur,
      seuilValeur: declencheur.seuilValeur,
    });

    this.validateDeclencheurCalendaireRules({
      typeDeclencheur: declencheur.typeDeclencheur,
      prochainLancementDate: declencheur.prochainLancementDate,
    });

    const interventionActiveExistante =
      await this.prisma.intervention.findFirst({
        where: {
          idPlanPreventifDeclencheur: idDeclencheur,
          etat: {
            notIn: ['SOLDE', 'ANNULE', 'ARCHIVE'],
          },
        },
        select: {
          idIntervention: true,
          code: true,
          etat: true,
        },
      });

    if (interventionActiveExistante) {
      throw new ConflictException(
        `Un OT préventif non soldé existe déjà pour ce déclencheur : ${interventionActiveExistante.code}.`,
      );
    }

    const codeOt = await this.generateOtCode();
    const datePrevue = declencheur.prochainLancementDate ?? new Date();
    const dateFinPrevue = this.calculateDateFinPrevue(
      datePrevue,
      declencheur.gamme.jourFin,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const intervention = await tx.intervention.create({
        data: {
          code: codeOt,
          libelle:
            declencheur.gamme?.libelle ??
            `OT préventif - ${
              declencheur.plan_preventif?.code ?? idDeclencheur
            }`,
          description: `Intervention préventive générée depuis le plan ${
            declencheur.plan_preventif?.code ??
            declencheur.idPlanPreventif
          }`,

          typeMaintenance: 'PREVENTIF',
          typeIntervention: 'TRAVAUX',
          natureIntervention: 'PREVENTIF',

          priorite: this.mapPrioritePreventive(declencheur.priorite),
          criticite: 'MOYENNE',

          etat: 'EN_PREPARATION',
          origineGeneration: 'PLAN_PREVENTIF',

          dateDebut: datePrevue,
          dateFin: dateFinPrevue,
          dateDebutPrevue: datePrevue,
          dateFinPrevue,

          chargePrevue: declencheur.gamme?.chargePrevue ?? undefined,
          dureePrevue: declencheur.gamme?.chargePrevue ?? undefined,
          tempsArretPrevu: declencheur.gamme?.tempsArret ?? undefined,
          receptionTravaux: declencheur.gamme?.receptionTravaux ?? false,

          createdBy: 'systeme-preventif',

          idMateriel: declencheur.idMateriel,
          idPointStructure: declencheur.idPointStructure,
          idGamme: declencheur.idGamme,
          idPlanPreventif: declencheur.idPlanPreventif,
          idPlanPreventifDeclencheur:
            declencheur.idPlanPreventifDeclencheur,
        },
      });

      if (declencheur.gamme?.gamme_operation?.length > 0) {
        await tx.operation_intervention.createMany({
          data: declencheur.gamme.gamme_operation.map((operation) => ({
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

      const historique =
        await tx.historique_declenchement_preventif.create({
          data: {
            idPlanPreventifDeclencheur:
              declencheur.idPlanPreventifDeclencheur,
            idIntervention: intervention.idIntervention,
            idMateriel: declencheur.idMateriel,
            idPointStructure: declencheur.idPointStructure,
            conditionResume: this.buildConditionResume(declencheur),
            valeurRealisation:
              declencheur.point_mesure?.derniereValeur ?? undefined,
            fictif: false,
            statut: 'OT_GENERE',
          },
        });

      await tx.plan_preventif_declencheur.update({
        where: {
          idPlanPreventifDeclencheur:
            declencheur.idPlanPreventifDeclencheur,
        },
        data: this.buildDeclencheurUpdateAfterGeneration(
          declencheur,
          datePrevue,
        ),
      });

      const interventionComplete = await tx.intervention.findUnique({
        where: {
          idIntervention: intervention.idIntervention,
        },
        include: {
          gamme: true,
          materiel: true,
          point_structure: true,
          plan_preventif: true,
          plan_preventif_declencheur: true,
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
      });

      return {
        intervention: interventionComplete,
        historique,
      };
    });

    return {
      message: 'OT préventif généré avec succès.',
      ...result,
    };
  }

  async findHistoriqueByPlan(idPlanPreventif: number) {
    await this.ensurePlanExists(idPlanPreventif);

    return this.prisma.historique_declenchement_preventif.findMany({
      where: {
        plan_preventif_declencheur: {
          idPlanPreventif,
        },
      },
      orderBy: {
        dateDeclenchement: 'desc',
      },
      include: {
        intervention: true,
        materiel: true,
        point_structure: true,
        plan_preventif_declencheur: {
          include: {
            plan_preventif: true,
            gamme: true,
            point_mesure: true,
          },
        },
      },
    });
  }

  async findHistoriqueByDeclencheur(idDeclencheur: number) {
    await this.ensureDeclencheurExists(idDeclencheur);

    return this.prisma.historique_declenchement_preventif.findMany({
      where: {
        idPlanPreventifDeclencheur: idDeclencheur,
      },
      orderBy: {
        dateDeclenchement: 'desc',
      },
      include: {
        intervention: true,
        materiel: true,
        point_structure: true,
        plan_preventif_declencheur: {
          include: {
            plan_preventif: true,
            gamme: true,
            point_mesure: true,
          },
        },
      },
    });
  }

  private async copyDeclencheursFromPpp(
    idPlanPreventif: number,
    sourcePpp: Awaited<
      ReturnType<PlanPreventifService['getPppSourceWithDeclencheurs']>
    >,
    idMateriel?: number,
    idPointStructure?: number,
  ) {
    for (const declencheur of sourcePpp.ppp_declencheur) {
      this.validateDeclencheurPointMesureRules({
        typeDeclencheur: declencheur.typeDeclencheur,
        idPointMesure: declencheur.idPointMesure,
        operateur: declencheur.operateur,
        seuilValeur: declencheur.seuilValeur,
      });

      let prochainLancementDate: Date | null = null;

      if (
        declencheur.typeDeclencheur === 'CALENDAIRE' &&
        declencheur.nombreJoursPremierLancement !== null &&
        declencheur.nombreJoursPremierLancement !== undefined
      ) {
        const date = new Date();
        date.setDate(
          date.getDate() + Number(declencheur.nombreJoursPremierLancement),
        );
        prochainLancementDate = date;
      }

      await this.prisma.plan_preventif_declencheur.create({
        data: {
          plan_preventif: {
            connect: {
              idPlanPreventif,
            },
          },

          ...(declencheur.idPppDeclencheur
            ? {
                ppp_declencheur: {
                  connect: {
                    idPppDeclencheur: declencheur.idPppDeclencheur,
                  },
                },
              }
            : {}),

          gamme: {
            connect: {
              idGamme: declencheur.idGamme,
            },
          },

          ...(declencheur.idPointMesure !== null &&
          declencheur.idPointMesure !== undefined
            ? {
                point_mesure: {
                  connect: {
                    idPointMesure: declencheur.idPointMesure,
                  },
                },
              }
            : {}),

          priorite: declencheur.priorite ?? 1,
          etat: declencheur.etat ?? 'ACTIF',
          typeDeclencheur: declencheur.typeDeclencheur,
          etatInterventionCible: declencheur.etatInterventionCible ?? null,
          actualisation: declencheur.actualisation ?? 'DECLENCHEMENT',
          horizonJours: declencheur.horizonJours ?? 15,
          toleranceJours: declencheur.toleranceJours ?? 5,

          periodiciteValeur:
            declencheur.typeDeclencheur === 'CALENDAIRE'
              ? declencheur.periodiciteValeur ?? null
              : null,

          periodiciteUnite:
            declencheur.typeDeclencheur === 'CALENDAIRE'
              ? declencheur.periodiciteUnite ?? null
              : null,

          prochainLancementDate,

          operateur:
            declencheur.typeDeclencheur === 'COMPTEUR' ||
            declencheur.typeDeclencheur === 'CONDITIONNEL'
              ? declencheur.operateur ?? null
              : null,

          seuilValeur:
            declencheur.typeDeclencheur === 'COMPTEUR' ||
            declencheur.typeDeclencheur === 'CONDITIONNEL'
              ? declencheur.seuilValeur ?? null
              : null,

          symptomeCode: declencheur.symptomeCode ?? null,
          saisonnaliteDu: declencheur.saisonnaliteDu ?? null,
          saisonnaliteAu: declencheur.saisonnaliteAu ?? null,
          actif: declencheur.actif ?? true,

          ...(idMateriel !== undefined
            ? {
                materiel: {
                  connect: {
                    idMateriel,
                  },
                },
              }
            : {}),

          ...(idPointStructure !== undefined
            ? {
                point_structure: {
                  connect: {
                    idPoint: idPointStructure,
                  },
                },
              }
            : {}),

          ...(declencheur.idModele !== null &&
          declencheur.idModele !== undefined
            ? {
                modele: {
                  connect: {
                    idModele: declencheur.idModele,
                  },
                },
              }
            : {}),
        },
      });
    }
  }

  private async getPppSourceWithDeclencheurs(id: number) {
    const ppp = await this.prisma.plan_preventif_predefini.findUnique({
      where: {
        idPlanPreventifPredefini: id,
      },
      include: {
        ppp_declencheur: {
          include: {
            gamme: true,
            modele: true,
            point_mesure: true,
          },
        },
      },
    });

    if (!ppp) {
      throw new NotFoundException(
        'Plan préventif prédéfini source introuvable.',
      );
    }

    return ppp;
  }

  private async getPlanTarget(idPlanPreventif: number) {
    const plan = await this.prisma.plan_preventif.findUnique({
      where: {
        idPlanPreventif,
      },
      select: {
        idPlanPreventif: true,
        idMateriel: true,
        idPointStructure: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan préventif introuvable.');
    }

    return plan;
  }

  private async ensurePlanExists(id: number) {
    const plan = await this.prisma.plan_preventif.findUnique({
      where: {
        idPlanPreventif: id,
      },
      select: {
        idPlanPreventif: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan préventif introuvable.');
    }

    return plan;
  }

  private async ensureDeclencheurExists(idDeclencheur: number) {
    const declencheur =
      await this.prisma.plan_preventif_declencheur.findUnique({
        where: {
          idPlanPreventifDeclencheur: idDeclencheur,
        },
        select: {
          idPlanPreventifDeclencheur: true,
          idPlanPreventif: true,
        },
      });

    if (!declencheur) {
      throw new NotFoundException('Déclencheur préventif introuvable.');
    }

    return declencheur;
  }

  private async ensurePppExists(id: number) {
    const ppp = await this.prisma.plan_preventif_predefini.findUnique({
      where: {
        idPlanPreventifPredefini: id,
      },
      select: {
        idPlanPreventifPredefini: true,
      },
    });

    if (!ppp) {
      throw new NotFoundException(
        'Plan préventif prédéfini source introuvable.',
      );
    }

    return ppp;
  }

  private async ensurePppDeclencheurExists(id: number) {
    const pppDeclencheur = await this.prisma.ppp_declencheur.findUnique({
      where: {
        idPppDeclencheur: id,
      },
      select: {
        idPppDeclencheur: true,
      },
    });

    if (!pppDeclencheur) {
      throw new NotFoundException('Déclencheur prédéfini introuvable.');
    }

    return pppDeclencheur;
  }

  private async ensureMaterielExists(id: number) {
    const materiel = await this.prisma.materiel.findUnique({
      where: {
        idMateriel: id,
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

  private async ensurePointStructureExists(id: number) {
    const point = await this.prisma.point_structure.findUnique({
      where: {
        idPoint: id,
      },
      select: {
        idPoint: true,
      },
    });

    if (!point) {
      throw new NotFoundException('Point de structure introuvable.');
    }

    return point;
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

  private async ensurePointMesureExists(idPointMesure: number) {
    const pointMesure = await this.prisma.point_mesure.findUnique({
      where: {
        idPointMesure,
      },
      select: {
        idPointMesure: true,
      },
    });

    if (!pointMesure) {
      throw new NotFoundException('Point de mesure introuvable.');
    }

    return pointMesure;
  }

  private async ensureModeleExists(idModele: number) {
    const modele = await this.prisma.modele.findUnique({
      where: {
        idModele,
      },
      select: {
        idModele: true,
      },
    });

    if (!modele) {
      throw new NotFoundException('Modèle introuvable.');
    }

    return modele;
  }

  private async ensureFamilleExists(idFamille: number) {
    const famille = await this.prisma.famille.findUnique({
      where: {
        idFamille,
      },
      select: {
        idFamille: true,
      },
    });

    if (!famille) {
      throw new NotFoundException('Famille introuvable.');
    }

    return famille;
  }

  private async ensureUniqueCode(code: string, currentId?: number) {
    const existing = await this.prisma.plan_preventif.findFirst({
      where: {
        code,
        ...(currentId !== undefined
          ? {
              NOT: {
                idPlanPreventif: currentId,
              },
            }
          : {}),
      },
      select: {
        idPlanPreventif: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Un plan préventif avec ce code existe déjà.',
      );
    }
  }

  private validateDeclencheurPointMesureRules(data: {
    typeDeclencheur?: string | null;
    idPointMesure?: number | null;
    operateur?: string | null;
    seuilValeur?: Prisma.Decimal | number | string | null;
  }) {
    const type = data.typeDeclencheur?.toUpperCase();

    if (type === 'COMPTEUR' || type === 'CONDITIONNEL') {
      if (!data.idPointMesure) {
        throw new ConflictException(
          `Un déclencheur ${type} doit être lié à un point de mesure.`,
        );
      }

      if (!data.operateur) {
        throw new ConflictException(
          `Un déclencheur ${type} doit avoir un opérateur de comparaison.`,
        );
      }

      if (
        data.seuilValeur === undefined ||
        data.seuilValeur === null ||
        data.seuilValeur === ''
      ) {
        throw new ConflictException(
          `Un déclencheur ${type} doit avoir une valeur seuil.`,
        );
      }
    }
  }

  private validateDeclencheurCalendaireRules(data: {
    typeDeclencheur?: string | null;
    prochainLancementDate?: string | Date | null;
  }) {
    const type = data.typeDeclencheur?.toUpperCase();

    if (type === 'CALENDAIRE' && !data.prochainLancementDate) {
      throw new ConflictException(
        'Un déclencheur calendaire doit avoir une date de prochain lancement.',
      );
    }
  }

  private async generateOtCode() {
    const count = await this.prisma.intervention.count({
      where: {
        typeMaintenance: 'PREVENTIF',
      },
    });

    let index = count + 1;

    while (true) {
      const code = `OT-PREV-${String(index).padStart(6, '0')}`;

      const exists = await this.prisma.intervention.findFirst({
        where: {
          code,
        },
        select: {
          idIntervention: true,
        },
      });

      if (!exists) return code;

      index++;
    }
  }

  private parseDate(value?: string | Date | null): Date | undefined {
    if (!value) return undefined;

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new ConflictException(`Date invalide : ${value}`);
    }

    return date;
  }

  private calculateDateFinPrevue(
    dateDebut: Date,
    jourFin?: number | null,
  ): Date | undefined {
    if (!jourFin || jourFin <= 0) return undefined;

    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + jourFin);

    return dateFin;
  }

  private mapPrioritePreventive(priorite?: number | null): string {
    if (priorite === 0) return 'URGENTE';
    if (priorite === 1) return 'HAUTE';
    if (priorite === 2) return 'NORMALE';
    return 'BASSE';
  }

  private buildConditionResume(declencheur: {
    typeDeclencheur: string;
    periodiciteValeur?: number | null;
    periodiciteUnite?: string | null;
    prochainLancementDate?: Date | null;
    operateur?: string | null;
    seuilValeur?: Prisma.Decimal | number | string | null;
    point_mesure?: {
      code?: string | null;
      derniereValeur?: Prisma.Decimal | number | string | null;
    } | null;
  }) {
    if (declencheur.typeDeclencheur === 'CALENDAIRE') {
      return `Déclenchement calendaire - prochain lancement ${
        declencheur.prochainLancementDate
          ? declencheur.prochainLancementDate.toISOString().slice(0, 10)
          : 'non renseigné'
      } - périodicité ${declencheur.periodiciteValeur ?? '-'} ${
        declencheur.periodiciteUnite ?? ''
      }`;
    }

    if (
      declencheur.typeDeclencheur === 'COMPTEUR' ||
      declencheur.typeDeclencheur === 'CONDITIONNEL'
    ) {
      return `Déclenchement ${declencheur.typeDeclencheur} - point ${
        declencheur.point_mesure?.code ?? '-'
      } - valeur actuelle ${
        declencheur.point_mesure?.derniereValeur ?? '-'
      } ${declencheur.operateur ?? ''} ${declencheur.seuilValeur ?? '-'}`;
    }

    return `Déclenchement ${declencheur.typeDeclencheur}`;
  }

  private buildDeclencheurUpdateAfterGeneration(
    declencheur: {
      actualisation?: string | null;
      typeDeclencheur: string;
      periodiciteValeur?: number | null;
      periodiciteUnite?: string | null;
      prochainLancementDate?: Date | null;
      point_mesure?: {
        derniereValeur?: Prisma.Decimal | number | string | null;
      } | null;
    },
    datePrevue: Date,
  ): Prisma.plan_preventif_declencheurUpdateInput {
    const actualisation = declencheur.actualisation?.toUpperCase() ?? '';

    const updateData: Prisma.plan_preventif_declencheurUpdateInput = {
      derniereRealisationPrevueDate: datePrevue,
      derniereRealisationPrevueValeur:
        declencheur.point_mesure?.derniereValeur ?? undefined,
    };

    const actualisationALaRealisation =
      actualisation.includes('REALISATION');

    if (!actualisationALaRealisation) {
      if (declencheur.typeDeclencheur === 'CALENDAIRE') {
        updateData.prochainLancementDate =
          this.calculateNextDateFromDeclencheur(
            declencheur.prochainLancementDate ?? datePrevue,
            declencheur.periodiciteValeur,
            declencheur.periodiciteUnite,
          ) ?? undefined;
      }
    }

    return updateData;
  }

  private evaluerDeclencheur(
    declencheur: {
      priorite?: number | null;
      typeDeclencheur: string;
      prochainLancementDate?: Date | null;
      horizonJours?: number | null;
      seuilValeur?: Prisma.Decimal | number | string | null;
      operateur?: string | null;
      point_mesure?: {
        derniereValeur?: Prisma.Decimal | number | string | null;
      } | null;
      intervention?: unknown[];
    },
    dateFinGlobale: Date | null,
  ) {
    if (declencheur.intervention && declencheur.intervention.length > 0) {
      return {
        declenchable: false,
        statutEvaluation: 'DEJA_GENERE',
        motif: 'Un OT non soldé existe déjà pour ce déclencheur.',
      };
    }

    if (declencheur.typeDeclencheur === 'CALENDAIRE') {
      if (!declencheur.prochainLancementDate) {
        return {
          declenchable: false,
          statutEvaluation: 'DATE_MANQUANTE',
          motif: 'Aucune date de prochain lancement.',
        };
      }

      const dateFin =
        dateFinGlobale ??
        this.addDays(new Date(), declencheur.horizonJours ?? 15);

      const declenchable =
        declencheur.priorite === 0 ||
        declencheur.prochainLancementDate <= dateFin;

      return {
        declenchable,
        statutEvaluation: declenchable ? 'A_DECLENCHER' : 'HORS_HORIZON',
        motif: declenchable
          ? 'La date de lancement est dans l’horizon.'
          : 'La date de lancement est hors horizon.',
      };
    }

    if (
      declencheur.typeDeclencheur === 'COMPTEUR' ||
      declencheur.typeDeclencheur === 'CONDITIONNEL'
    ) {
      const valeurActuelle = Number(declencheur.point_mesure?.derniereValeur);
      const seuil = Number(declencheur.seuilValeur);

      if (Number.isNaN(valeurActuelle) || Number.isNaN(seuil)) {
        return {
          declenchable: false,
          statutEvaluation: 'VALEUR_MANQUANTE',
          motif: 'Valeur actuelle ou seuil manquant.',
        };
      }

      const declenchable = this.compareValues(
        valeurActuelle,
        seuil,
        declencheur.operateur ?? '>=',
      );

      return {
        declenchable,
        statutEvaluation: declenchable
          ? 'A_DECLENCHER'
          : 'SEUIL_NON_ATTEINT',
        motif: declenchable
          ? 'Le seuil est atteint.'
          : 'Le seuil n’est pas atteint.',
      };
    }

    return {
      declenchable: false,
      statutEvaluation: 'TYPE_INCONNU',
      motif: 'Type de déclencheur non reconnu.',
    };
  }

  private compareValues(value: number, threshold: number, operator: string) {
    switch (operator) {
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '=':
        return value === threshold;
      default:
        return value >= threshold;
    }
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private calculateNextDateFromDeclencheur(
    baseDate: Date,
    periodiciteValeur?: number | null,
    periodiciteUnite?: string | null,
  ) {
    if (!periodiciteValeur || !periodiciteUnite) {
      return null;
    }

    const nextDate = new Date(baseDate);

    switch (periodiciteUnite.toUpperCase()) {
      case 'JOUR':
      case 'JOURS':
      case 'DAY':
      case 'DAYS':
        nextDate.setDate(nextDate.getDate() + periodiciteValeur);
        break;

      case 'SEMAINE':
      case 'SEMAINES':
      case 'WEEK':
      case 'WEEKS':
        nextDate.setDate(nextDate.getDate() + periodiciteValeur * 7);
        break;

      case 'MOIS':
      case 'MONTH':
      case 'MONTHS':
        nextDate.setMonth(nextDate.getMonth() + periodiciteValeur);
        break;

      case 'AN':
      case 'ANS':
      case 'ANNEE':
      case 'ANNEES':
      case 'YEAR':
      case 'YEARS':
        nextDate.setFullYear(nextDate.getFullYear() + periodiciteValeur);
        break;

      default:
        return null;
    }

    return nextDate;
  }

  private buildTypeDeclenchementVariants(value: string) {
    const upper = value.toUpperCase();
    const lower = value.toLowerCase();
    const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);

    return Array.from(new Set([value, upper, lower, capitalized]));
  }
}